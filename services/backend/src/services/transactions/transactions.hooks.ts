import errors from "@feathersjs/errors";
import {HookContext} from "@feathersjs/feathers";
import {disallow, iff, isProvider} from "feathers-hooks-common";
import {authenticate} from "hooks/";
import {Account, Transaction} from "models/";
// Don't remove this comment. It's needed to format import lines nicely.

const validateTransactionData = (transactionData: Partial<Transaction>) => {
    try {
        Transaction.validate(transactionData);
    } catch (e) {
        throw new errors.BadRequest(e.message);
    }
};

const validateTransactionOwner = (userId: string, accountsService: any) => {
    const accountCache: Record<string, Account> = {};

    return async (transactionData: Partial<Transaction>) => {
        const {creditAccountId, debitAccountId} = transactionData;

        if (!creditAccountId || !debitAccountId) {
            throw new errors.Forbidden("Access denied: you don't own these accounts");
        }

        if (!(creditAccountId in accountCache)) {
            accountCache[creditAccountId] = await accountsService.get(creditAccountId);
        }

        if (!(debitAccountId in accountCache)) {
            accountCache[debitAccountId] = await accountsService.get(debitAccountId);
        }

        const creditAccount = accountCache[creditAccountId];
        const debitAccount = accountCache[debitAccountId];

        if (
            !creditAccount ||
            !debitAccount ||
            (creditAccount && creditAccount.userId !== userId) ||
            (debitAccount && debitAccount.userId !== userId)
        ) {
            throw new errors.Forbidden("Access denied: you don't own these accounts");
        }
    };
};

const validateTransactionDataHook = () => (context: HookContext) => {
    const data = Array.isArray(context.data) ? context.data : [context.data];
    data.forEach(validateTransactionData);

    return context;
};

const validateTransactionOwnerHook = () => async (context: HookContext) => {
    const transactionId = context.id;

    let data = [];

    if (
        context.method === "remove" &&
        context.data === undefined &&
        transactionId === null &&
        context.params.query &&
        Object.keys(context.params.query).length > 0
    ) {
        // This handles the case for multi `remove`.

        // The ID query comes in as an object representation of an array
        // (so, an object with indices as keys mapping to IDs).
        // However, it doesn't seem to work when passing the object representation
        // as a query, so we have to convert it back to just an array.
        //
        // This is true for both the query to look up the transactions and the underlying
        // remove method.
        //
        // Don't know why it does this...
        const ids = Object.values(context.params.query?.id?.["$in"]);

        data = await context.app.service("transactions").find({
            query: {
                id: {
                    $in: ids
                }
            }
        });

        context.params.query.id["$in"] = ids;
    } else if (
        context.method === "remove" &&
        context.data === undefined &&
        transactionId !== undefined &&
        transactionId !== null
    ) {
        // This handles the case for single `remove`, since there will only be the ID provided.
        const transaction = await context.app.service("transactions").get(transactionId);
        data = [transaction];
    } else if (context.method === "create" || context.method === "update") {
        // This handles the case for `create` and `update`.
        data = Array.isArray(context.data) ? context.data : [context.data];
    }

    const authenticatedUserId = context.params.user.id;
    const accountsService = context.app.service("accounts");

    // Instantiate the validator so that it shares the cache between all transactions to be validated.
    const validator = validateTransactionOwner(authenticatedUserId, accountsService);

    // Run the validations sequentially, instead of in 'parallel' with `Promise.all`, so that the
    // cache is actually filled between validations. Although running them sequentially will
    // theoretically be slower, in practice it's faster with the cache since the database lookups
    // are really the bottleneck (not that this is a particularly slow operation in general).
    for (const transaction of data) {
        await validator(transaction);
    }

    return context;
};

export default {
    before: {
        all: [authenticate()],
        find: [disallow("external")],
        get: [disallow("external")],
        create: [validateTransactionDataHook(), validateTransactionOwnerHook()],
        update: [validateTransactionDataHook(), validateTransactionOwnerHook()],
        patch: [disallow("external")],
        remove: [iff(isProvider("external"), validateTransactionOwnerHook())]
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
