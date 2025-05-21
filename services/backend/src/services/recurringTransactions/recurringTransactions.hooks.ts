import errors from "@feathersjs/errors";
import {HookContext} from "@feathersjs/feathers";
import {disallow, iff, isProvider} from "feathers-hooks-common";
import {authenticate, findFromUser, includeUserId} from "hooks/";
import {RecurringTransaction} from "models/";
// Don't remove this comment. It's needed to format import lines nicely.

const validateData = (transactionData: Partial<RecurringTransaction>) => {
    try {
        RecurringTransaction.validate(transactionData);
    } catch (e) {
        if (e instanceof Error) {
            throw new errors.BadRequest(e.message);
        }
    }
};

const validateDataHook = () => (context: HookContext) => {
    const data = Array.isArray(context.data) ? context.data : [context.data];
    data.forEach(validateData);

    return context;
};

const validateOwnerHook = () => async (context: HookContext) => {
    const id = context.id;
    const userId = context?.params?.user?.id;

    const recurringTransaction = await context.app.service("recurringTransactions").get(id);

    if (!recurringTransaction || recurringTransaction.userId !== userId) {
        throw new errors.Forbidden("Access denied: you don't own this recurring transaction");
    }

    return context;
};

export default {
    before: {
        all: [authenticate()],
        find: [iff(isProvider("external"), findFromUser())],
        get: [disallow("external")],
        create: [includeUserId(), validateDataHook()],
        update: [includeUserId(), validateDataHook()],
        patch: [disallow("external")],
        remove: [iff(isProvider("external"), validateOwnerHook())]
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
