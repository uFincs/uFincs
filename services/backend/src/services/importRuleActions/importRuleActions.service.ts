// Initializes the `importRuleActions` service on path `/importRuleActions`
import {ServiceAddons} from "@feathersjs/feathers";
import {Application} from "declarations";
import {rateLimiter} from "middleware/";
import createModel from "models/importRuleActions.model";
import {ImportRuleActions} from "./importRuleActions.class";
import hooks from "./importRuleActions.hooks";

// Add this service to the service type index
declare module "declarations" {
    interface ServiceTypes {
        importRuleActions: ImportRuleActions & ServiceAddons<any>;
    }
}

export default function (app: Application) {
    const options = {
        Model: createModel(app),
        paginate: app.get("paginate"),
        multi: ["remove"]
    };

    // Initialize our service with any options it requires
    app.use("/importRuleActions", rateLimiter(), new ImportRuleActions(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service("importRuleActions");

    service.hooks(hooks);
}
