import {ServiceMethods} from "@feathersjs/feathers";
import logger from "logger";
import NodeMailer, {SendMailOptions, SentMessageInfo, Transporter} from "nodemailer";
import Mailgun from "nodemailer-mailgun-transport";
import {Application} from "../../declarations";

interface Data extends SendMailOptions {}

interface ServiceOptions {}

export class Mailer implements Pick<ServiceMethods<Data>, "create"> {
    app: Application;
    options: ServiceOptions;
    mailer?: Transporter;

    constructor(options: ServiceOptions = {}, app: Application) {
        this.options = options;
        this.app = app;

        const {apiKey, domain} = app.get("mailer");

        if (!apiKey) {
            logger.warn("WARNING: Mailgun API key is missing; emails have been disabled.");
        } else {
            this.mailer = NodeMailer.createTransport(
                Mailgun({
                    auth: {
                        api_key: apiKey,
                        domain
                    }
                })
            );
        }
    }

    async create(data: Data): Promise<SentMessageInfo | undefined> {
        if (!this.mailer) {
            logger.info({email: data, message: "Mailer is disabled; logging email."});
        } else {
            return this.mailer.sendMail(data);
        }
    }
}
