// Initializes the `feedback` service on path `/feedback`
import {ServiceAddons} from "@feathersjs/feathers";
import {Application} from "declarations";
import {rateLimiter} from "middleware/";
import createModel from "models/preferences.model";
import {Preferences} from "./preferences.class";
import hooks from "./preferences.hooks";

// Add this service to the service type index
declare module "declarations" {
    interface ServiceTypes {
        preferences: Preferences & ServiceAddons<any>;
    }
}

export default function (app: Application) {
    const options = {
        Model: createModel(app),
        paginate: app.get("paginate"),
        // Need this for the `deleteUserData` hook.
        multi: ["remove"]
    };

    // Initialize our service with any options it requires
    app.use("/preferences", rateLimiter("lenient"), new Preferences(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service("preferences");

    service.hooks(hooks);
}
