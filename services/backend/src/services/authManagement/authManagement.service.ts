// Initializes the `authManagement` service on path `/authManagement`
import {ServiceAddons} from "@feathersjs/feathers";
import authManagement from "feathers-authentication-management";
import {rateLimiter} from "middleware/";
import createNotifier from "utils/createNotifier";
import {Application} from "../../declarations";
import hooks from "./authManagement.hooks";

// Add this service to the service type index
declare module "../../declarations" {
    interface ServiceTypes {
        authManagement: ServiceAddons<any>;
    }
}

const path = "authManagement";

export default function (app: Application) {
    const options = {
        notifier: createNotifier(app),
        path,
        skipIsVerifiedCheck: true
    };

    // Initialize our service with any options it requires
    app.use(`/${path}`, rateLimiter());
    app.configure(authManagement(options));

    // Get our initialized service so that we can register hooks
    const service = app.service("authManagement");

    service.hooks(hooks);
}
