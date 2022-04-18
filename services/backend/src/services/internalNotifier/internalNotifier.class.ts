import {ServiceMethods} from "@feathersjs/feathers";
import {IncomingWebhookSendArguments} from "@slack/webhook";
import logger from "logger";
import {createSlackNotifier} from "utils/createSlackNotifier";
import {IS_MASTER, IS_PRODUCTION} from "values/servicesConfig";
import {Application} from "../../declarations";

interface Data {
    message: string | IncomingWebhookSendArguments;
    notifier?: "slack";
}

interface ServiceOptions {}

export class InternalNotifier implements Pick<ServiceMethods<Data>, "create"> {
    app: Application;
    options: ServiceOptions;
    enableNotifier: boolean;
    slackNotifier: ReturnType<typeof createSlackNotifier>;

    constructor(options: ServiceOptions = {}, app: Application) {
        this.app = app;
        this.options = options;

        const {slackWebhook, slackWebhookTest} = app.get("internalNotifier");

        if (!slackWebhook && !slackWebhook) {
            logger.warn(
                "WARNING: Neither Slack webhook was provided; internal notifier (Slack) has been disabled."
            );

            this.enableNotifier = false;
        } else {
            this.enableNotifier = IS_PRODUCTION;
        }

        const webhook = IS_MASTER ? slackWebhook : IS_PRODUCTION ? slackWebhookTest : "";
        this.slackNotifier = createSlackNotifier(webhook);
    }

    async create(data: Data) {
        if (!this.enableNotifier) {
            logger.info({
                notification: data,
                message: "Internal notifier (Slack) is disabled; logging notification."
            });

            return data;
        }

        const {message, notifier = "slack"} = data;

        switch (notifier) {
            case "slack":
                if (typeof message === "string") {
                    await this.slackNotifier.send({text: message});
                } else {
                    await this.slackNotifier.send(message);
                }

                break;
            default:
                break;
        }

        return data;
    }
}
