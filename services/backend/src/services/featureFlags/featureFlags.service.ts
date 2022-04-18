// Initializes the `featureFlags` service on path `/featureFlags`
import {ServiceAddons} from "@feathersjs/feathers";
import {Application} from "../../declarations";
import {FeatureFlags} from "./featureFlags.class";
import hooks from "./featureFlags.hooks";

// Add this service to the service type index
declare module "../../declarations" {
    interface ServiceTypes {
        featureFlags: FeatureFlags & ServiceAddons<any>;
    }
}

export default function (app: Application) {
    const options = {};

    // Initialize our service with any options it requires
    app.use("/featureFlags", new FeatureFlags(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service("featureFlags");

    service.hooks(hooks);
}
