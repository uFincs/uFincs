import {HookContext} from "@feathersjs/feathers";
import {disallow} from "feathers-hooks-common";
import logger from "logger";

/** Helper function for extracting non-sensitive data from mailer requests for logging. */
const getEmailData = (context: HookContext) => {
    // Remove attachments and variables since they can be quite big/sensitive.
    // eslint-disable-next-line
    const {attachments, "h:X-Mailgun-Variables": variables, ...data} = context.data;

    return data;
};

/** Logs all successful email requests. */
const logEmails = () => (context: HookContext) => {
    const data = getEmailData(context);
    logger.info({message: "Sent email", data: data, result: context.result});
};

/** Logs all failed email requests. */
const logEmailErrors = () => (context: HookContext) => {
    const data = getEmailData(context);
    logger.error({message: "Error sending email", data: data});
};

export default {
    before: {
        all: [disallow("external")],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    },

    after: {
        all: [logEmails()],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    },

    error: {
        all: [logEmailErrors()],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    }
};
