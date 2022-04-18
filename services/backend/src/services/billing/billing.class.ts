import {Request, Response} from "express";
import logger from "logger";
import Stripe from "stripe";
import {Application} from "declarations";
import {Subscription, User} from "models/";
import {FRONTEND_URL, IS_MASTER} from "values/servicesConfig";

type RequestWithAuthenticatedUser = Request & {user?: User};
type RequestWithRawBody = Request & {rawBody: string};

export class Billing {
    app: Application;
    priceIds: {monthly: string; annually: string; lifetime: string};
    stripe!: Stripe;
    webhookSecret: string;

    constructor(app: Application) {
        this.app = app;

        const {testKey, prodKey, stripeConfig, webhookSecret} = app.get("billing");
        const key = IS_MASTER ? prodKey : testKey;
        const stripeIds = IS_MASTER ? stripeConfig.production : stripeConfig.test;

        this.webhookSecret = webhookSecret;
        this.priceIds = stripeIds.prices;

        if (!key) {
            const featureFlags = this.app.get("featureFlags");
            this.app.set("featureFlags", {...featureFlags, subscriptions: false});

            logger.warn(
                "WARNING: Stripe API key is missing. Subscriptions feature flag has been disabled."
            );
        } else {
            this.stripe = new Stripe(key, {apiVersion: "2020-08-27"});
        }
    }

    /** A route that just returns the price IDs.
     *
     *  The Frontend depends on the Backend for the most up-to-date price IDs,
     *  instead of being hard-coded in multiple places. */
    public async getConfig(req: RequestWithAuthenticatedUser, res: Response) {
        res.send({prices: this.priceIds});
    }

    /** A route for creating a Stripe Checkout session. */
    public async createCheckoutSession(req: RequestWithAuthenticatedUser, res: Response) {
        const {priceId} = req.body;
        const {user} = req;

        // If there's no user, then that means that this was an unauthenticated call.
        // `req.user` gets set by the Feathers `authenticate` middleware.
        if (!user) {
            res.status(401);
            return res.send({error: {message: "Access forbidden: You are not authenticated."}});
        }

        const userId = user.id;
        const customer = await this._getExistingCustomerId(user);

        if (customer) {
            // If a customer already exists with the given email, and they already have a subscription,
            // then we should just associate the Stripe subscription data to the local subscription,
            // instead of making them go through the Checkout process.
            const subscription = await this._updateSubscriptionFromStripeCustomer(userId, customer);

            if (subscription) {
                res.send({sessionId: null});
            }
        }

        const mode = priceId === this.priceIds.lifetime ? "payment" : "subscription";

        try {
            const session = await this.stripe.checkout.sessions.create({
                mode,
                payment_method_types: ["card"],
                line_items: [
                    {
                        price: priceId,
                        quantity: 1
                    }
                ],
                allow_promotion_codes: true,
                billing_address_collection: "auto",
                // `customer` should only not be undefined when, for some reason, the customer
                // already exists but they don't have any subscription. Which... _shouldn't_ happen,
                // but who knows; might as well handle for it.
                customer,
                customer_email: customer ? undefined : user.email,
                client_reference_id: userId,
                subscription_data:
                    mode === "subscription"
                        ? {
                              metadata: {
                                  userId
                              }
                          }
                        : undefined,
                success_url: `${FRONTEND_URL}/app`,
                cancel_url: `${FRONTEND_URL}/checkout`
            });

            return res.send({sessionId: session.id});
        } catch (e) {
            logger.error(e);

            res.status(400);
            return res.send({error: {message: e.message}});
        }
    }

    /** A route for creating a Stripe Customer Portal session. */
    public async createCustomerPortalSession(req: RequestWithAuthenticatedUser, res: Response) {
        const {user} = req;

        // Just a fail safe in case someone calls this without being authenticated.
        if (!user) {
            res.status(401);
            return res.send({error: {message: "Access denied: You are not authenticated."}});
        }

        const userId = user.id;
        let subscription = await Subscription.findByUserId(userId);

        if (!subscription) {
            res.status(400);
            return res.send({error: {message: "You do not have a subscription."}});
        }

        let {customerId} = subscription;

        if (!customerId) {
            // If we don't have the customer ID on a local subscription, then fetch it from Stripe.
            // In practice, this should really only happen with the test accounts; this should _not_
            // happen in production.
            customerId = (await this._getExistingCustomerId(user)) || null;

            if (customerId) {
                logger.debug({
                    route: "/billing/create-customer-portal-session",
                    message:
                        `Customer ${customerId} wasn't present in local subscription ${subscription.id} ` +
                        `for user ${userId}, but was found in Stripe. ` +
                        "This should only happen for test accounts."
                });

                // Update the subscription with the rest of the info, alongside the customer ID,
                // while we're at it.
                subscription = await this._updateSubscriptionFromStripeCustomer(userId, customerId);
            } else {
                res.status(400);
                return res.send({error: {message: "You do not have a valid subscription."}});
            }
        }

        // Because lifetime users don't have a Stripe Billing subscription (because it's a one-time payment),
        // then they shouldn't be able to access the Customer Portal because there's nothing for them to
        // deal with.
        if (subscription?.isLifetime) {
            res.status(400);

            return res.send({
                error: {message: "Lifetime users don't have access to the Customer Portal."}
            });
        }

        try {
            const portalSession = await this.stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url: `${FRONTEND_URL}/app`
            });

            return res.send({url: portalSession.url});
        } catch (e) {
            logger.error(e);

            res.status(400);
            return res.send({error: {message: e.message}});
        }
    }

    /** The route that is used as a webhook for Stripe, to handle all the events they through at us.
     *
     *  This is what enables the Backend to keep the subscriptions in sync with Stripe. */
    public async webhook(req: RequestWithRawBody, res: Response) {
        const {data, eventType} = this._extractEventData(req, res)!;

        logger.info("Processing billing event %s", eventType);

        switch (eventType) {
            case "checkout.session.completed":
                await this._processCompletedCheckoutSession(data.object as Stripe.Checkout.Session);
                break;
            case "invoice.paid":
                await this._processInvoice(data.object as Stripe.Invoice);
                break;
            case "invoice.payment_failed":
                await this._processInvoice(data.object as Stripe.Invoice);
                break;
            case "customer.subscription.deleted":
                await this._processSubscription(data.object as Stripe.Subscription);
                break;
            default:
                break;
        }

        res.sendStatus(200);
    }

    /** A method that handles cancelling a user's Stripe subscription, 'deleting' their Customer object,
     *  and 'deleting' the local subscription. */
    public async cancelSubscription(user: User) {
        const userId = user.id;
        const subscription = await Subscription.findByUserId(userId);

        if (subscription) {
            if (subscription.customerId) {
                // Since we need emails to be unique, we need to make sure the Stripe customer's email
                // is updated with the new 'deleted' email of the user.
                await this.stripe.customers.update(subscription.customerId, {
                    email: User.generateDeletedEmail(user)
                });

                // This marks the customer as deleted, removes all of their payment details, and
                // cancels and any active subscriptions.
                //
                // See https://stripe.com/docs/api/customers/delete for more details.
                await this.stripe.customers.del(subscription.customerId);
            }

            await this.app.service("subscriptions").remove(subscription.id);
        }
    }

    /** Handles verifying that the events from the webhook are legit and extracting
     *  the data from them. */
    private _extractEventData(req: RequestWithRawBody, res: Response) {
        if (this.webhookSecret) {
            let event;
            const signature = req.headers["stripe-signature"] as string;

            try {
                event = this.stripe.webhooks.constructEvent(
                    req.rawBody,
                    signature,
                    this.webhookSecret
                );
            } catch (err) {
                logger.error(err, "Webhook signature verification failed");
                res.sendStatus(400);
                return;
            }

            return {data: event.data, eventType: event.type};
        } else {
            logger.error("Webhook secret is not configured");
            res.sendStatus(400);
            return;
        }
    }

    /** The logic for processing the 'checkout.session.completed' event.
     *
     *  Provisions the subscription for the user on our side, so that they can access the app. */
    private async _processCompletedCheckoutSession(data: Stripe.Checkout.Session) {
        const sessionId = data.id;

        const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
            expand: ["line_items"]
        });

        const userId = session.client_reference_id;
        logger.info("Processing successful checkout for user %s", userId);

        if (!userId || !(await this._doesUserExist(userId))) {
            // If the userId wasn't on the Checkout session, then... this event probably wasn't even ours?
            // In theory, this shouldn't happen.
            //
            // And if the user doesn't exist, see the explanation on _doesUserExist.
            return;
        }

        await this.stripe.customers.update(session.customer?.toString() as string, {
            metadata: {userId}
        });

        const existingSubscription = await Subscription.findByUserId(userId);

        let subscriptionInfo: Partial<Subscription> = {
            userId,
            customerId: session.customer?.toString(),
            productId: session.line_items?.data?.[0].price.product.toString(),
            priceId: session.line_items?.data?.[0].price.id.toString(),
            // We want 'inactive' for the subscription status here (and below) because if the user
            // never managed to pay for the subscription in the first place, then they don't get
            // to have read-only access (i.e. an 'expired' subscription).
            status: session.payment_status === "paid" ? "active" : "inactive"
        };

        if (session.subscription) {
            const stripeSubscription = await this.stripe.subscriptions.retrieve(
                session.subscription.toString()
            );

            subscriptionInfo = {
                ...subscriptionInfo,
                ...this._extractStripeSubscriptionProperties(stripeSubscription, "inactive")
            };
        } else {
            // If the priceId wasn't actually the lifetime price, then this is an invalid/unknown
            // event, since there aren't (currently) any other non-subscription plans.
            if (subscriptionInfo.priceId !== this.priceIds.lifetime) {
                return;
            }

            subscriptionInfo = {
                ...subscriptionInfo,
                ...this._lifetimeSubscriptionProperties()
            };
        }

        await this._upsertSubscription(existingSubscription?.id, subscriptionInfo);

        await this._notifyCompletedCheckout(userId, subscriptionInfo.priceId);
        logger.info("Finished processing successful checkout for user %s", userId);
    }

    /** The logic for processing the 'invoice.paid' and 'invoice.payment_failure' event.
     *
     *  Makes sure the user's subscription on our end matches out with whether or not they've paid their invoice.
     *  We've decided that, when payment failure occurs, a user's subscription should be "expired" instead
     *  of "inactive"; this way, users still have read-only access to the app until they fix their payment. */
    private async _processInvoice(invoice: Stripe.Invoice) {
        const customer = await this.stripe.customers.retrieve(invoice.customer.toString());

        if (customer.deleted) {
            return;
        }

        let userId = customer.metadata?.userId;
        let existingSubscription;

        // Normally, when an invoice is paid (e.g. during Checkout), there is only 1 line item:
        // the subscription the user paid for. However, when the user changes their subscription
        // (e.g. through the Customer Portal), then there'll be multiple line items. It appears
        // that the pattern is that the first line item will be the correction/proration for the
        // user's current subscription, and then the second line item will be the user's new subscription.
        //
        // As such, I've decided that we'll just check for the last line item as the new subscription
        // and hope that that doesn't change.
        //
        // As a fallback, the `_extractStripeSubscriptionProperties` picks the price/product IDs
        // right off the Stripe subscription, so we should be fine...
        const lineItem = invoice.lines.data[invoice.lines.data.length - 1];

        let subscriptionInfo: Partial<Subscription> = {
            customerId: customer?.id,
            productId: lineItem.price?.product.toString() || null,
            priceId: lineItem.price?.id || null,
            status: invoice.paid ? "active" : "expired"
        };

        if (invoice.subscription) {
            const stripeSubscription = await this.stripe.subscriptions.retrieve(
                invoice.subscription.toString()
            );

            userId = userId || stripeSubscription.metadata?.userId;

            if (!userId || !(await this._doesUserExist(userId))) {
                return;
            }

            logger.info("Processing invoice for user %s", userId);

            existingSubscription = await Subscription.findByUserId(userId);

            subscriptionInfo = {
                ...subscriptionInfo,
                ...this._extractStripeSubscriptionProperties(stripeSubscription)
            };
        } else {
            // If the priceId wasn't actually the lifetime price, then this is an invalid/unknown
            // event, since there aren't (currently) any other non-subscription plans.
            if (subscriptionInfo.priceId !== this.priceIds.lifetime) {
                return;
            }

            if (!userId || !(await this._doesUserExist(userId))) {
                return;
            }

            logger.info("Processing invoice for user %s", userId);

            existingSubscription = await Subscription.findByUserId(userId);

            subscriptionInfo = {
                ...subscriptionInfo,
                ...this._lifetimeSubscriptionProperties()
            };
        }

        await this._upsertSubscription(existingSubscription?.id, {...subscriptionInfo, userId});
        logger.info("Finished processing invoice for user %s", userId);
    }

    /** The logic for processing the 'customer.subscription.deleted'.
     *
     *  In reality, this is just generic subscription processing logic, but it does its job
     *  of making sure that when a user cancels their subscription, the subscription on our side
     *  is marked as inactive. */
    private async _processSubscription(stripeSubscription: Stripe.Subscription) {
        const userId = stripeSubscription.metadata.userId;

        if (!userId || !(await this._doesUserExist(userId))) {
            return;
        }

        logger.info("Processing subscription update for user %s", userId);

        const existingSubscription = await Subscription.findByUserId(userId);

        const subscriptionInfo = {
            userId,
            // We want the 'inactive' status here because `_processSubscription` is (currently) bound
            // to the customer.subscription.deleted event. If the user cancels their subscription,
            // then they purposefully do not want to access their account anymore. As such,
            // their subscription is now inactive instead of expired.
            //
            // Note that their account still _exists_ and they can login and sign up for a new subscription;
            // only if they choose to _delete_ their user account will they lose this ability.
            ...this._extractStripeSubscriptionProperties(stripeSubscription, "inactive")
        };

        await this._upsertSubscription(existingSubscription?.id, subscriptionInfo);
        logger.info("Finished processing subscription update for user %s", userId);
    }

    /** Fetches a user's Stripe Customer ID based on their email (which should be unique). */
    private async _getExistingCustomerId(user: User): Promise<string | undefined> {
        const existingCustomers = await this.stripe.customers.list({email: user.email});

        // Stripe allows customer objects to have the same email, but _we_ don't. If we somehow end up
        // with multiple customers that have the same email, that means something is seriously screwed up.
        //
        // As such, we specifically want to check for there being exactly 1 customer
        // (as opposed to more than 0) so that we don't end up screwing things up any more than they
        // would already be if there was more than 1 customer with the same email.
        //
        // If there does end up being multiple customers with the same email, well, from the
        // `crete-checkout-session` route's perspective, there isn't much more it can besides allowing
        // _another_ duplicate customer to be created, so that the user can complete their checkout.
        // It'd end up being something that would have to be manually sorted.
        const customer =
            existingCustomers.data.length === 1 ? existingCustomers.data[0].id : undefined;

        return customer;
    }

    /** Updates a local subscription with the information from their corresponding Stripe customer. */
    private async _updateSubscriptionFromStripeCustomer(
        userId: string,
        customer: string
    ): Promise<Subscription | undefined> {
        const subscriptions = await this.stripe.subscriptions.list({customer});

        if (subscriptions.data.length) {
            const stripeSubscription = subscriptions.data[0];
            const existingSubscription = await Subscription.findByUserId(userId);

            return await this._upsertSubscription(existingSubscription?.id, {
                userId,
                ...this._extractStripeSubscriptionProperties(stripeSubscription)
            });
        }
    }

    /** Just a helper function for doing upserts. Should it be on the Subscription model? Maybe... */
    private async _upsertSubscription(
        id: string | undefined,
        subscription: Partial<Subscription>
    ): Promise<Subscription> {
        if (id) {
            return await this.app.service("subscriptions").update(id, subscription);
        } else {
            return await this.app.service("subscriptions").create(subscription);
        }
    }

    /** Just a helper function for checking if a user exists in our database. */
    private async _doesUserExist(userId: string): Promise<boolean> {
        // If we have a userId but we don't have the _user_, then that probably means that the Stripe event
        // was issued by a different environment for a different webhook (e.g. the event was generated
        // by a local dev environment but the event was picked up by a per-branch deployed environment).
        //
        // If that's the case, just ignore the event.
        try {
            const user = await this.app.service("users").get(userId);

            return !!user;
        } catch {
            return false;
        }
    }

    /** Helper function for extracting all of the properties from a Stripe subscription
     *  that correspond with our subscriptions. */
    private _extractStripeSubscriptionProperties(
        stripeSubscription: Stripe.Subscription,

        // In general, we want to be lenient with users. As such, the default status for when the Stripe
        // subscription isn't 'active' is 'expired' on our end. That way, users can at least sign in
        // to their accounts, read their data, and update their payment methods (if necessary).
        //
        // However, there are certain cases where we do want to set the 'inactive' state on our end.
        // This is generally when customers have indicated they no longer want to use our service
        // (e.g. they cancel their subscription or we refund them their subscription). All of these
        // cases of actually setting 'inactive' are detailed by comments throughout the above code.
        // Just search for 'inactive'.
        inactiveStatus: "expired" | "inactive" = "expired"
    ): Partial<Subscription> {
        const status = stripeSubscription.status === "active" ? "active" : inactiveStatus;
        const isActive = status === "active";

        return {
            customerId: stripeSubscription.customer.toString(),
            productId: stripeSubscription.items.data[0].price.product.toString(),
            priceId: stripeSubscription.items.data[0].price.id,
            subscriptionId: stripeSubscription.id,
            status,
            periodStart: isActive
                ? convertTimestampToDate(stripeSubscription.current_period_start)
                : null,
            periodEnd: isActive
                ? convertTimestampToDate(stripeSubscription.current_period_end, true)
                : null,
            isLifetime: false
        };
    }

    /** Just a function that returns certain properties of a lifetime subscription. */
    private _lifetimeSubscriptionProperties() {
        return {
            subscriptionId: null,
            periodStart: null,
            periodEnd: null,
            isLifetime: true
        };
    }

    private async _notifyCompletedCheckout(userId: string, priceId: string | null | undefined) {
        if (!priceId) {
            return;
        }

        const priceName = Object.keys(this.priceIds).find(
            // @ts-ignore
            (name) => this.priceIds[name] === priceId
        );

        await this.app.service("internalNotifier").create({
            message: `\`${userId}\` just subscribed to the *${priceName}* plan!`
        });
    }
}

// 7 days, 24 hours/day, 60 minutes/hour, 60 seconds/minute, 1000 milliseconds/second
// AKA, add 7 days to the end period of a subscription as a buffer, just so users have
// time to fix their subscription if they have to.
const END_PERIOD_BUFFER = 7 * 24 * 60 * 60 * 1000;

/** Stripe's timestamp values (i.e. epoch values) are in seconds, whereas JavaScript dates expect them
 *  in milliseconds. So... multiply by 1000. */
const convertTimestampToDate = (epochInSeconds: number, addBuffer: boolean = false): Date => {
    if (addBuffer) {
        return new Date(epochInSeconds * 1000 + END_PERIOD_BUFFER);
    } else {
        return new Date(epochInSeconds * 1000);
    }
};
