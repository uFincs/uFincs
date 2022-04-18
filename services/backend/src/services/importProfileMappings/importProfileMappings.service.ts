// Initializes the `importProfileMappings` service on path `/importProfileMappings`
import {ServiceAddons} from "@feathersjs/feathers";
import {Application} from "declarations";
import {rateLimiter} from "middleware/";
import createModel from "models/importProfileMappings.model";
import {ImportProfileMappings} from "./importProfileMappings.class";
import hooks from "./importProfileMappings.hooks";

// Add this service to the service type index
declare module "declarations" {
    interface ServiceTypes {
        importProfileMappings: ImportProfileMappings & ServiceAddons<any>;
    }
}

export default function (app: Application) {
    const options = {
        Model: createModel(app),
        paginate: app.get("paginate"),
        multi: ["remove"]
    };

    // Initialize our service with any options it requires
    app.use("/importProfileMappings", rateLimiter(), new ImportProfileMappings(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service("importProfileMappings");

    service.hooks(hooks);
}
