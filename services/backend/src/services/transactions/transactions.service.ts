// Initializes the `transactions` service on path `/transactions`
import {ServiceAddons} from "@feathersjs/feathers";
import {Application} from "declarations";
import {rateLimiter} from "middleware/";
import createModel from "models/transactions.model";
import {Transactions} from "./transactions.class";
import hooks from "./transactions.hooks";

// Add this service to the service type index
declare module "declarations" {
    interface ServiceTypes {
        transactions: Transactions & ServiceAddons<any>;
    }
}

export default function (app: Application) {
    const options = {
        Model: createModel(app),
        paginate: app.get("paginate"),
        multi: ["create", "update", "remove"]
    };

    // Initialize our service with any options it requires
    app.use("/transactions", rateLimiter("lenient"), new Transactions(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service("transactions");

    service.hooks(hooks);
}
