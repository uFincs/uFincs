// Initializes the `mailer` service on path `/mailer`
import {ServiceAddons} from "@feathersjs/feathers";
import {Application} from "../../declarations";
import {Mailer} from "./mailer.class";
import hooks from "./mailer.hooks";

// Add this service to the service type index
declare module "../../declarations" {
    interface ServiceTypes {
        mailer: Mailer & ServiceAddons<any>;
    }
}

export default function (app: Application) {
    const options = {};

    // Initialize our service with any options it requires
    app.use("/mailer", new Mailer(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service("mailer");

    service.hooks(hooks);
}
