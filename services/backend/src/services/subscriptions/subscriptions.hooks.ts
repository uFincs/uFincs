import {HookContext} from "@feathersjs/feathers";
import {disallow} from "feathers-hooks-common";
// Don't remove this comment. It's needed to format import lines nicely.

const updateCancelledSubscriptionProperties = () => async (context: HookContext) => {
    const subscription = await context.app.service("subscriptions").get(context.id);

    await context.app.service("subscriptions").patch(subscription.id, {
        status: "inactive",
        periodStart: null,
        periodEnd: null
    });
};

export default {
    before: {
        all: [disallow("external")],
        find: [],
        get: [],
        create: [],
        update: [],
        patch: [],
        remove: [updateCancelledSubscriptionProperties()]
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [],
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
