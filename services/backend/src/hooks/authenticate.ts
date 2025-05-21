import errors from "@feathersjs/errors";
import {HookContext} from "@feathersjs/feathers";
import {combine, iff, isProvider} from "feathers-hooks-common";
import * as authentication from "@feathersjs/authentication";
import {featureFlagEnabled} from "hooks/";
import {Subscription} from "models/";

const {authenticate: originalAuthenticate} = authentication.hooks;

const hasActiveSubscription = () => async (context: HookContext) => {
    const subscriptions = await context.app.service("subscriptions").find({
        query: {
            userId: context?.params?.user?.id
        }
    });

    let subscription: Subscription =
        "length" in subscriptions ? subscriptions?.[0] : subscriptions.data?.[0];

    subscription = await Subscription.updateStatus(subscription);

    if (Subscription.isActive(subscription)) {
        return context;
    } else {
        throw new errors.NotAuthenticated("Access denied: you don't have an active subscription.");
    }
};

/** This is just a wrapper hook around the `authenticate` hook from `@feathersjs/authentication`.
 *  It is combined with the above hook for checking for active subscriptions, so that users are authorized
 *  on whether or not they have a subscription to do anything. */
const authenticate = () => async (context: HookContext) => {
    // Don't want to authenticate on active subscription for `find` calls, so that users
    // with expired subscriptions can still use the app in a read-only mode.
    if (context.method === "find") {
        return originalAuthenticate("jwt").call(this, context);
    } else {
        return await combine(
            originalAuthenticate("jwt"),
            // Only check the subscription for external calls, since only external calls
            // will have `context.params.user` set.
            iff(
                isProvider("external"),
                iff(featureFlagEnabled("subscriptions"), hasActiveSubscription())
            )
        ).call(this, context);
    }
};

export default authenticate;
