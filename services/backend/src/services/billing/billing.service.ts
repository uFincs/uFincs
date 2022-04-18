// Initializes the `billing` service on path `/billing`
import {authenticate} from "@feathersjs/express";
import {ServiceAddons} from "@feathersjs/feathers";
import {rateLimiter} from "middleware/";
import customRoutes from "values/customRoutes";
import {Application} from "../../declarations";
import {Billing} from "./billing.class";

// Add this service to the service type index
declare module "../../declarations" {
    interface ServiceTypes {
        billing: Billing & ServiceAddons<any>;
    }
}

export default function (app: Application) {
    const billing = new Billing(app);

    app.get(
        customRoutes.billing.getConfig,
        rateLimiter("aggressive"),
        authenticate("jwt"),
        billing.getConfig.bind(billing)
    );

    app.post(
        customRoutes.billing.createCheckoutSession,
        rateLimiter("aggressive"),
        authenticate("jwt"),
        billing.createCheckoutSession.bind(billing)
    );

    app.post(
        customRoutes.billing.createCustomerPortalSession,
        rateLimiter("aggressive"),
        authenticate("jwt"),
        billing.createCustomerPortalSession.bind(billing)
    );

    app.post(customRoutes.billing.webhook, billing.webhook.bind(billing));

    // Set the billing service instance on the app so that it can be directly accessed elsewhere.
    app.set("billingService", billing);
}
