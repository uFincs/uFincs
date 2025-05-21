import errors from "@feathersjs/errors";
import {HookContext} from "@feathersjs/feathers";
import {disallow, iff, isProvider} from "feathers-hooks-common";
import dehydrate from "feathers-sequelize/hooks/dehydrate";
import {authenticate, findFromUser, includeUserId} from "hooks/";
import {Account} from "models/";
// Don't remove this comment. It's needed to format import lines nicely.

const includeTransactions = () => (context: HookContext) => {
    context.params.sequelize = {
        include: [
            // Without `separate`, the generated query runs two outer joins that is quite slow.
            // By turning on `separate`, Sequelize fetches the transactions in separate queries,
            // speeding things up by a factor of around ~75% (250ms -> 50ms for request latency).
            //
            // Note that it only seems to be slow because there are _two_ joins. When testing with
            // only one, its speed was within reason.
            //
            // https://stackoverflow.com/a/37965130 is a good reference for what `separate` does.
            {association: "creditAccountTransactions", separate: true},
            {association: "debitAccountTransactions", separate: true}
        ],
        raw: false
    };

    return context;
};

const combineTransactions = () => (context: HookContext) => {
    const {result} = context;

    const combinedTransactionsResult = result.map((account: Account) => {
        const combinedTransactionsAccount = {
            ...account,
            transactions: [
                ...(account.creditAccountTransactions || []),
                ...(account.debitAccountTransactions || [])
            ]
        };

        // Remove the extra transaction properties, so that the frontend doesn't end up storing them.
        delete combinedTransactionsAccount.creditAccountTransactions;
        delete combinedTransactionsAccount.debitAccountTransactions;

        // Remove the user ID property, since it's only really relevant for the Backend and we don't
        // want it showing up in backups generated from the Frontend.
        delete combinedTransactionsAccount.userId;

        return combinedTransactionsAccount;
    });

    context.result = combinedTransactionsResult;
    return context;
};

const validateAccountData = () => (context: HookContext) => {
    const {data} = context;

    try {
        if (Array.isArray(data)) {
            data.forEach((account) => {
                Account.validate(account);
            });
        } else {
            Account.validate(context.data);
        }
    } catch (e) {
        if (e instanceof Error) {
            throw new errors.BadRequest(e.message);
        }
    }

    return context;
};

const validateAccountOwner = () => async (context: HookContext) => {
    const accountId = context.id;
    const authenticatedUserId = context?.params?.user?.id;

    const account = await context.app.service("accounts").get(accountId);

    if (!account || account.userId !== authenticatedUserId) {
        throw new errors.Forbidden("Access denied: you don't own this account");
    }

    return context;
};

export default {
    before: {
        all: [authenticate()],
        find: [iff(isProvider("external"), findFromUser()), includeTransactions()],
        get: [disallow("external")],
        create: [includeUserId(), validateAccountData()],
        update: [includeUserId(), validateAccountData()],
        patch: [disallow("external")],
        remove: [iff(isProvider("external"), validateAccountOwner())]
    },

    after: {
        all: [],
        find: [dehydrate(), combineTransactions()],
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
