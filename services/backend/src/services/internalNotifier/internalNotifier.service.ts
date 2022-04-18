// Initializes the `internalNotifier` service on path `/internalNotifier`
import {ServiceAddons} from "@feathersjs/feathers";
import {Application} from "../../declarations";
import {InternalNotifier} from "./internalNotifier.class";
import hooks from "./internalNotifier.hooks";

// Add this service to the service type index
declare module "../../declarations" {
    interface ServiceTypes {
        internalNotifier: InternalNotifier & ServiceAddons<any>;
    }
}

export default function (app: Application) {
    const options = {};

    // Initialize our service with any options it requires
    app.use("/internalNotifier", new InternalNotifier(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service("internalNotifier");

    service.hooks(hooks);
}
