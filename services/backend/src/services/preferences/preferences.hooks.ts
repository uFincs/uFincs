import errors from "@feathersjs/errors";
import {HookContext} from "@feathersjs/feathers";
import {disallow, iff, isProvider} from "feathers-hooks-common";
import {authenticate, findFromUser, includeUserId} from "hooks/";
// Don't remove this comment. It's needed to format import lines nicely.

const preventCreationOfDuplicate = () => async (context: HookContext) => {
    const userId = context.params?.user?.id || context?.data?.userId;

    const existingPreferences = await context.app.service("preferences").find({
        query: {
            userId
        }
    });

    if (existingPreferences.length > 0) {
        throw new errors.Forbidden("You already have a preferences row; not creating another.");
    }
};

export default {
    before: {
        all: [authenticate()],
        // Note: Even though users can only have one preferences row, we want to use `find` over `get`
        // so that we can abstract the Frontend from passing the user's ID in the path in favour
        // of grabbing from the JWT using `findFromUser`.
        find: [iff(isProvider("external"), findFromUser())],
        get: [disallow("external")],
        // A user can't normally create another preference row for themselves.
        // However, during a backup restore, they need to create a new row.
        create: [iff(isProvider("external"), includeUserId()), preventCreationOfDuplicate()],
        update: [disallow("external")],
        // The single row of preferences for a user can only be patched.
        patch: [iff(isProvider("external"), includeUserId())],
        // A user can't remove their own preference row.
        remove: [disallow("external")]
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
