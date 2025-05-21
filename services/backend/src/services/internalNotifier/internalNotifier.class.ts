import {ServiceMethods} from "@feathersjs/feathers";
import logger from "logger";
import {IS_PRODUCTION} from "values/servicesConfig";
import {Application} from "../../declarations";

// Note: This internal notifier was originally used to send notifications to Slack.
// It now only sends notifications to the console since Slack is no longer used.

interface Data {
    message: string;
    notifier?: "console";
}

interface ServiceOptions {}

export class InternalNotifier implements Pick<ServiceMethods<Data>, "create"> {
    app: Application;
    options: ServiceOptions;
    enableNotifier: boolean;

    constructor(options: ServiceOptions = {}, app: Application) {
        this.app = app;
        this.options = options;

        this.enableNotifier = IS_PRODUCTION;
    }

    async create(data: Data) {
        if (!this.enableNotifier) {
            logger.info({
                notification: data,
                message: "Internal notifier is disabled; logging notification."
            });

            return data;
        }

        const {message, notifier = "console"} = data;

        switch (notifier) {
            case "console":
                logger.info({notification: message});

                break;
            default:
                break;
        }

        return data;
    }
}
