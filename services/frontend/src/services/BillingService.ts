import {Stripe} from "@stripe/stripe-js";
import {loadStripe} from "@stripe/stripe-js/pure";
import api, {PriceIds} from "api/";
import {STRIPE_KEY} from "config";

export type PlanId = "monthly" | "annually" | "lifetime";

interface Plan {
    id: PlanId;
    alternativePeriod?: string;
    alternativePrice?: string;
    monthlyPrice?: string;
    name: string;
    percentOff?: string;
}

let stripe: Stripe | null = null;
let priceIds: PriceIds | null = null;

export default class BillingService {
    static PLANS: Array<Plan> = [
        {
            id: "monthly",
            monthlyPrice: "20",
            name: "Monthly"
        },
        {
            id: "annually",
            alternativePeriod: "year",
            alternativePrice: "120",
            monthlyPrice: "10",
            name: "Annually",
            percentOff: "50"
        },
        {
            id: "lifetime",
            alternativePrice: "400",
            name: "Lifetime"
        }
    ];

    /** Initializes the Stripe library and loads the price IDs from the Backend.
     *
     *  This is a distinct call because we don't want the Stripe library to be loaded all the time,
     *  only during Checkout. This technically goes against Stripe's documentation (fraud blah blah),
     *  but I'd rather Stripe not be making a bunch of random calls all the time. */
    static async init() {
        if (!stripe) {
            stripe = await loadStripe(STRIPE_KEY);
            priceIds = (await api.billing.getConfig()).prices;
        }
    }

    /** Handles getting the Checkout session from the Backend and redirecting the user to it. */
    static async createCheckoutSession(planId: PlanId) {
        if (!BillingService.PLANS.find((plan) => plan.id === planId)) {
            throw new Error("Invalid plan");
        }

        const priceId = priceIds?.[planId];

        if (!priceId) {
            throw new Error("Stripe was not initialized");
        }

        const {sessionId} = await api.billing.createCheckoutSession(priceId);

        if (sessionId) {
            stripe?.redirectToCheckout({sessionId});
        } else {
            throw new Error("Customer already has a subscription");
        }
    }

    /** Handles getting the Customer Portal session from the Backend redirecting the user to it. */
    static async createCustomerPortalSession() {
        const {url} = await api.billing.createCustomerPortalSession();

        if (url) {
            // Redirect the user to the Customer Portal.
            // Have to do this manually cause, for some reason, the Stripe library has a `redirectToCheckout`
            // function but not a `redirectToPortal` function?? IDK.
            window.location.href = url;
        }
    }
}
