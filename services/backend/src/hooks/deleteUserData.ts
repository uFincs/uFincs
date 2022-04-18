import {HookContext} from "@feathersjs/feathers";
import {ImportProfile, ImportRule} from "models/";

/** Deletes all of a user's data (accounts, transactions, etc), but not their actual user record. */
const deleteUserData = () => async (context: HookContext) => {
    // The user is in the params when the hook is used as an authenticated before hook.
    // The user should be in the result if the hook is used as an after hook.
    //
    // Before hook is used for user account deletion (user service),
    // after hook is used during password reset (auth management service).
    const user = context.params.user || context.result;

    // Remove all of the user's data.
    const accounts = await context.app.service("accounts").find({
        query: {
            userId: user.id
        }
    });

    // Need a map for the transaction IDs so that we don't get duplicates.
    const transactionIds: Record<string, string> = {};
    const accountIds: Array<string> = [];

    for (const account of accounts) {
        accountIds.push(account.id);

        for (const transaction of account.transactions) {
            transactionIds[transaction.id] = transaction.id;
        }
    }

    const mappingIds: Array<string> = [];
    const profileIds: Array<string> = [];

    const importProfiles: Array<ImportProfile> = await context.app.service("importProfiles").find({
        query: {
            userId: user.id
        }
    });

    for (const profile of importProfiles) {
        profileIds.push(profile.id);

        for (const mapping of profile.importProfileMappings) {
            mappingIds.push(mapping.id);
        }
    }

    const ruleIds: Array<string> = [];

    const importRules: Array<ImportRule> = await context.app.service("importRules").find({
        query: {
            userId: user.id
        }
    });

    for (const rule of importRules) {
        ruleIds.push(rule.id);
    }

    // Remove all of the user's data.
    await context.app.service("transactions").remove(null, {
        query: {
            id: {
                $in: Object.keys(transactionIds)
            }
        }
    });

    await context.app.service("accounts").remove(null, {
        query: {
            id: {
                $in: accountIds
            }
        }
    });

    await context.app.service("importProfileMappings").remove(null, {
        query: {
            id: {
                $in: mappingIds
            }
        }
    });

    await context.app.service("importProfiles").remove(null, {
        query: {
            id: {
                $in: profileIds
            }
        }
    });

    // Note: Deletion of rule action/conditions is handled internally by import rule hooks.
    await context.app.service("importRules").remove(null, {
        query: {
            id: {
                $in: ruleIds
            }
        }
    });

    await context.app.service("preferences").remove(null, {
        // Use the query syntax for deletion just to handle the case where
        // the user somehow doesn't have any preferences record.
        query: {
            userId: {
                $in: [user.id]
            }
        }
    });
};

export default deleteUserData;
