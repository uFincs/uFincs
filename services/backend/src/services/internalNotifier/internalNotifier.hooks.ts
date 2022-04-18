import {HookContext} from "@feathersjs/feathers";
import {disallow} from "feathers-hooks-common";
import logger from "logger";

const logNotifications = () => (context: HookContext) => {
    logger.info({message: "Sent internal notification", data: context.data});
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
        all: [],
        find: [],
        get: [],
        create: [logNotifications()],
        update: [],
        patch: [],
        remove: []
    },

    error: {
        all: [],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: []
    }
};
