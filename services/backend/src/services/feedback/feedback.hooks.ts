import errors from "@feathersjs/errors";
import {HookContext} from "@feathersjs/feathers";
import {disallow, discard, iff, isNot} from "feathers-hooks-common";
import {authenticate, includeUserId} from "hooks/";
import {Feedback} from "models/";
// Don't remove this comment. It's needed to format import lines nicely.

const validateFeedbackData = () => (context: HookContext) => {
    const {data} = context;

    try {
        Feedback.validate(data);
    } catch (e) {
        throw new errors.BadRequest(e.message);
    }

    return context;
};

const isSentAnonymously = () => (context: HookContext) => !!context.data.isAnonymous;

const notifyFeedback = () => async (context: HookContext) => {
    const {message, type, userId} = context.result;

    await context.app.service("internalNotifier").create({
        message: {
            text: userId ? `${userId} sent *${type}* feedback:` : `Anonymous *${type}* feedback:`,
            attachments: [
                {
                    text: message
                }
            ]
        }
    });
};

export default {
    before: {
        // Because anonymous feedback can be sent in no-account mode, we can only authenticate users
        // when the feedback isn't sent anonymously.
        //
        // We got rate limiting on this, so it should be fine.
        all: [iff(isNot(isSentAnonymously()), authenticate())],
        find: [disallow("external")],
        get: [disallow("external")],
        create: [
            iff(isNot(isSentAnonymously()), includeUserId(), discard("isAnonymous")),
            validateFeedbackData()
        ],
        update: [disallow("external")],
        patch: [disallow("external")],
        remove: [disallow("external")]
    },

    after: {
        all: [],
        find: [],
        get: [],
        create: [notifyFeedback()],
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
