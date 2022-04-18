import {HookContext, ServiceAddons} from "@feathersjs/feathers";
import {iff} from "feathers-hooks-common";
import {AuthenticationService, JWTStrategy} from "@feathersjs/authentication";
import {LocalStrategy} from "@feathersjs/authentication-local";
import {featureFlagEnabled} from "hooks/";
import {rateLimiter} from "middleware/";
import {Subscription} from "models/";
import {Application} from "./declarations";

declare module "./declarations" {
    interface ServiceTypes {
        authentication: AuthenticationService & ServiceAddons<any>;
    }
}

const setSubscriptionProperties = () => async (context: HookContext) => {
    const subscriptions = await context.app.service("subscriptions").find({
        query: {
            userId: context.result.user.id
        }
    });

    let subscription: Subscription =
        "length" in subscriptions ? subscriptions?.[0] : subscriptions.data?.[0];

    if (subscription) {
        subscription = await Subscription.updateStatus(subscription);

        context.result.user.subscriptionStatus = subscription.status;
        context.result.user.subscriptionIsLifetime = subscription.isLifetime;
    } else {
        context.result.user.subscriptionStatus = null;
        context.result.user.subscriptionIsLifetime = false;
    }
};

export default function (app: Application) {
    const authentication = new AuthenticationService(app, "authentication");

    authentication.register("jwt", new JWTStrategy());
    authentication.register("local", new LocalStrategy());

    app.use(
        "/authentication",
        // Only want to rate limit failed auth requests.
        rateLimiter("aggressive", {skipSuccessfulRequests: true}),
        authentication
    );

    const service = app.service("authentication");

    service.hooks({
        after: {
            create: [iff(featureFlagEnabled("subscriptions"), setSubscriptionProperties())]
        }
    });
}
