// Initializes the `users` service on path `/users`
import {ServiceAddons} from "@feathersjs/feathers";
import {Application} from "declarations";
import {rateLimiter} from "middleware/";
import createModel from "models/users.model";
import {Users, noAccountNotification} from "./users.class";
import hooks from "./users.hooks";

// Add this service to the service type index
declare module "declarations" {
    interface ServiceTypes {
        users: Users & ServiceAddons<any>;
    }
}

export default function (app: Application) {
    const options = {
        Model: createModel(app),
        paginate: app.get("paginate")
    };

    // Initialize our service with any options it requires.
    app.use("/users", rateLimiter("aggressive"), new Users(options, app));

    // Extra user related functions.
    app.get("/users-no-account", rateLimiter("once"), noAccountNotification(app));

    // Get our initialized service so that we can register hooks.
    const service = app.service("users");

    service.hooks(hooks);
}
