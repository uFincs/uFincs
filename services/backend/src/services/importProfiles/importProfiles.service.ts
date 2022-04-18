// Initializes the `importProfiles` service on path `/importProfiles`
import {ServiceAddons} from "@feathersjs/feathers";
import {Application} from "declarations";
import {rateLimiter} from "middleware/";
import createModel from "models/importProfiles.model";
import {ImportProfiles} from "./importProfiles.class";
import hooks from "./importProfiles.hooks";

// Add this service to the service type index
declare module "declarations" {
    interface ServiceTypes {
        importProfiles: ImportProfiles & ServiceAddons<any>;
    }
}

export default function (app: Application) {
    const options = {
        Model: createModel(app),
        paginate: app.get("paginate"),
        multi: ["create", "remove"]
    };

    // Initialize our service with any options it requires
    app.use("/importProfiles", rateLimiter("lenient"), new ImportProfiles(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service("importProfiles");

    service.hooks(hooks);
}
