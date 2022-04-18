import errors from "@feathersjs/errors";
import {HookContext} from "@feathersjs/feathers";
import {disallow} from "feathers-hooks-common";
import {deleteUserData} from "hooks/";

const VALID_ACTIONS = ["sendResetPwd", "resetPwdLong"];

/** Currently, we only allow password reset actions. Maybe in the future we'll enable email verification. */
const isPasswordResetAction = () => (context: HookContext) => {
    if (!VALID_ACTIONS.includes(context.data.action)) {
        throw new errors.Forbidden(`Unauthorized action: ${context.data.action}`);
    }
};

/** Hook to strip away any fields from the user result that we don't want to expose publicly.
 *
 *  Since the password reset can be called by anyone, we don't want to allow _anyone_ to make a call
 *  and get back, for example, the user's encryption 'keys'.
 *
 *  Note: This hook might have to be guarded based on action in the future, if we decide to use actions
 *        other than the password reset ones. */
const stripExcessUserProperties = () => (context: HookContext) => {
    const {
        result: {email}
    } = context;

    context.result = {email};
};

/** Since user data is encrypted, when users reset their password, all of their data becomes useless.
 *  As such, we delete _all_ of their data. Old encryption keys, accounts, transactions, etc. Poof.
 *
 *  Why not soft-delete? Cause I'm lazy and we have backups. */
const deleteUserDataAfterPasswordReset = () => async (context: HookContext) => {
    if (context.data.action !== "resetPwdLong") {
        return;
    }

    // Remove the encryption keys from the user, since they'll get re-created by the frontend
    // as part of the password reset process.
    await context.app.service("users").patch(context.result.id, {
        edek: null,
        kekSalt: null
    });

    deleteUserData()(context);
};

export default {
    before: {
        all: [],
        find: [disallow("external")],
        get: [disallow("external")],
        create: [isPasswordResetAction()],
        update: [disallow("external")],
        patch: [disallow("external")],
        remove: [disallow("external")]
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [deleteUserDataAfterPasswordReset(), stripExcessUserProperties()],
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
