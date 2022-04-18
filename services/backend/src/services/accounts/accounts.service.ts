// Initializes the `accounts` service on path `/accounts`
import {ServiceAddons} from "@feathersjs/feathers";
import {Application} from "declarations";
import {rateLimiter} from "middleware/";
import createModel from "models/accounts.model";
import {Accounts} from "./accounts.class";
import hooks from "./accounts.hooks";

// Add this service to the service type index
declare module "declarations" {
    interface ServiceTypes {
        accounts: Accounts & ServiceAddons<any>;
    }
}

export default function (app: Application) {
    const options = {
        Model: createModel(app),
        paginate: app.get("paginate"),
        multi: ["create", "remove"]
    };

    // Initialize our service with any options it requires
    app.use("/accounts", rateLimiter("lenient"), new Accounts(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service("accounts");

    service.hooks(hooks);
}
