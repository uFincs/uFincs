// Initializes the `importRules` service on path `/importRules`
import {ServiceAddons} from "@feathersjs/feathers";
import {Application} from "declarations";
import {rateLimiter} from "middleware/";
import createModel from "models/importRules.model";
import {ImportRules} from "./importRules.class";
import hooks from "./importRules.hooks";

// Add this service to the service type index
declare module "declarations" {
    interface ServiceTypes {
        importRules: ImportRules & ServiceAddons<any>;
    }
}

export default function (app: Application) {
    const options = {
        Model: createModel(app),
        paginate: app.get("paginate"),
        multi: ["create", "remove"]
    };

    // Initialize our service with any options it requires
    app.use("/importRules", rateLimiter("lenient"), new ImportRules(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service("importRules");

    service.hooks(hooks);
}
