// Initializes the `recurringTransactions` service on path `/recurringTransactions`
import {ServiceAddons} from "@feathersjs/feathers";
import {Application} from "declarations";
import {rateLimiter} from "middleware/";
import createModel from "models/recurringTransactions.model";
import {RecurringTransactions} from "./recurringTransactions.class";
import hooks from "./recurringTransactions.hooks";

// Add this service to the service type index
declare module "declarations" {
    interface ServiceTypes {
        recurringTransactions: RecurringTransactions & ServiceAddons<any>;
    }
}

export default function (app: Application) {
    const options = {
        Model: createModel(app),
        paginate: app.get("paginate"),
        multi: ["create", "update", "remove"]
    };

    // Initialize our service with any options it requires
    app.use(
        "/recurringTransactions",
        rateLimiter("lenient"),
        new RecurringTransactions(options, app)
    );

    // Get our initialized service so that we can register hooks
    const service = app.service("recurringTransactions");

    service.hooks(hooks);
}
