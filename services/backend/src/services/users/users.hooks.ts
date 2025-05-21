import errors from "@feathersjs/errors";
import {HookContext} from "@feathersjs/feathers";
import {disallow, iff, isNot, isProvider, preventChanges} from "feathers-hooks-common";
import * as feathersAuthentication from "@feathersjs/authentication";
import * as local from "@feathersjs/authentication-local";
import {deleteUserData} from "hooks/";
import {User} from "models/";
import createNotifier from "utils/createNotifier";
import {IS_MASTER} from "values/servicesConfig";
import {Application} from "../../declarations";
// Don't remove this comment. It's needed to format import lines nicely.

const CYPRESS_TEST_EMAILS = [
    "abc123@abc123.com",
    "1bbf8bfb-6f4e-420f-b8d2-c641c725e031@mailslurp.com"
];

const {authenticate} = feathersAuthentication.hooks;
const {hashPassword, protect} = local.hooks;

const validateUser = () => (context: HookContext) => {
    const userId = context.id;
    const authenticatedUserId = context?.params?.user?.id;

    if (userId !== authenticatedUserId) {
        throw new errors.Forbidden("Access denied: you don't own this account");
    }
};

const provisionEmptySubscription = () => async (context: HookContext) => {
    // TECH DEBT/HACK: This is a workaround for the fact that we don't have an easy way
    // to toggle the subscriptions flag off during Cypress tests.
    //
    // Basically, we're just giving the test account a lifetime subscription so that
    // we can test no-account sign up without having to make the user subscribe.
    //
    // It's hacky cause we do this by just checking for our test email... But we make it
    // less hacky by making sure it can't happen in production.
    const isLifetime = !IS_MASTER && CYPRESS_TEST_EMAILS.includes(context.result.email);

    await context.app.service("subscriptions").create({
        userId: context.result.id,
        customerId: null,
        productId: null,
        priceId: null,
        subscriptionId: null,
        status: isLifetime ? "active" : "inactive",
        periodStart: null,
        periodEnd: null,
        isLifetime
    });
};

const provisionDefaultPreferences = () => async (context: HookContext) => {
    await context.app.service("preferences").create({
        userId: context.result.id
    });
};

const notifyNewSignUp = () => async (context: HookContext) => {
    const {id} = context.result;

    await context.app.service("internalNotifier").create({
        message: `\`${id}\` just signed up!`
    });
};

const deleteUserSubscription = () => async (context: HookContext) => {
    const billingService = context.app.get("billingService");
    await billingService.cancelSubscription(context.params.user);
};

const isOnlyDeleteUserDataSet = () => (context: HookContext) =>
    context.params.query?.onlyDeleteUserData;

const skipRemoveUser = () => (context: HookContext) => {
    if (isOnlyDeleteUserDataSet()(context)) {
        // By writing to context.result, the service method will be skipped.
        // This way, only the user's data is removed and not their actual account.
        // For reference: https://docs.feathersjs.com/api/hooks.html#context-result
        context.result = {};
    }
};

const sendConfirmationEmailHook = () => async (context: HookContext) => {
    const notifier = createNotifier(context.app as Application);

    if (context.data?.email) {
        const options = {oldEmail: context?.params?.user?.email, newEmail: context.data.email};

        // Send an email to their old email.
        await notifier("identityChange", context.params.user as any, options);

        // Send an email to their new email.
        await notifier("identityChange", {email: options.newEmail}, options);
    } else if (context.data?.password) {
        await notifier("changePassword", context.params.user as any);
    }
};

const sendAccountDeletionEmailHook = () => async (context: HookContext) => {
    const notifier = createNotifier(context.app as Application);
    await notifier("deleteUserAccount", context.params.user as any);
};

const updateDeletedUserProperties = () => async (context: HookContext) => {
    // Want to update the user's properties to get rid of potentially sensitive information
    // (password, edek, kekSalt) as well as overwrite the user's email so that the email is freed up
    // for use by a new user.
    await context.app.service("users").patch(
        context?.params?.user?.id,
        {
            email: User.generateDeletedEmail(context.params.user as any),
            // Use an empty string here because `allowNull: false` is set on password.
            password: "",
            edek: null,
            kekSalt: null,
            isOnboarded: null
        },
        {
            sequelize: {
                // Need to disable paranoid so that we can update the deleted user.
                paranoid: false
            }
        }
    );
};

export default {
    before: {
        all: [],
        find: [authenticate("jwt")],
        get: [authenticate("jwt")],
        create: [hashPassword("password")],
        update: [disallow("external")],
        patch: [
            iff(
                isProvider("external"),
                preventChanges(
                    true,
                    "isVerified",
                    "verifyToken",
                    "verifyShortToken",
                    "verifyExpires",
                    "verifyChanges",
                    "resetToken",
                    "resetShortToken",
                    "resetExpires"
                ),
                hashPassword("password"),
                authenticate("jwt"),
                validateUser()
            )
        ],
        remove: [authenticate("jwt"), validateUser(), deleteUserData(), skipRemoveUser()]
    },

    after: {
        all: [
            // Make sure the password field is never sent to the client
            // Always must be the last hook
            protect("password")
        ],
        find: [],
        get: [],
        create: [provisionEmptySubscription(), provisionDefaultPreferences(), notifyNewSignUp()],
        update: [],
        // Only send confirmation emails when triggered externally, so that things like the
        // password reset process of the auth management service don't trigger it.
        patch: [iff(isProvider("external"), sendConfirmationEmailHook())],
        remove: [
            iff(
                isProvider("external"),
                iff(
                    isNot(isOnlyDeleteUserDataSet()),
                    deleteUserSubscription(),
                    sendAccountDeletionEmailHook(),
                    // Note: Must update properties _after_ sending the confirmation email,
                    // cause the email is one of the updated properties.
                    updateDeletedUserProperties()
                )
            )
        ]
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
