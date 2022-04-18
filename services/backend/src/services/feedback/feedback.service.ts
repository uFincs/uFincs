// Initializes the `feedback` service on path `/feedback`
import {ServiceAddons} from "@feathersjs/feathers";
import {Application} from "declarations";
import {rateLimiter} from "middleware/";
import createModel from "models/feedback.model";
import {Feedback} from "./feedback.class";
import hooks from "./feedback.hooks";

// Add this service to the service type index
declare module "declarations" {
    interface ServiceTypes {
        feedback: Feedback & ServiceAddons<any>;
    }
}

export default function (app: Application) {
    const options = {
        Model: createModel(app),
        paginate: app.get("paginate")
    };

    // Initialize our service with any options it requires
    app.use("/feedback", rateLimiter("aggressive"), new Feedback(options, app));

    // Get our initialized service so that we can register hooks
    const service = app.service("feedback");

    service.hooks(hooks);
}
