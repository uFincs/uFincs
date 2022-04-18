// Initializes the `importRuleConditions` service on path `/importRuleConditions`
import {ServiceAddons} from "@feathersjs/feathers";
import {Application} from "declarations";
import {rateLimiter} from "middleware/";
import createModel from "models/importRuleConditions.model";
import {ImportRuleConditions} from "./importRuleConditions.class";
import hooks from "./importRuleConditions.hooks";

// Add this service to the service type index
declare module "declarations" {
    interface ServiceTypes {
        importRuleConditions: ImportRuleConditions & ServiceAddons<any>;
    }
}

export default function (app: Application) {
    const options = {
        Model: createModel(app),
        paginate: app.get("paginate"),
        multi: ["remove"]
    };

    // Initialize our service with any options it requires
    app.use("/importRuleConditions", rateLimiter(), new ImportRuleConditions(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service("importRuleConditions");

    service.hooks(hooks);
}
