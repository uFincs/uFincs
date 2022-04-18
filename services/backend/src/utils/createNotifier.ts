import {logo} from "emailTemplates/assets/encodedImages";
import {FRONTEND_URL} from "values/servicesConfig";
import {Application} from "../declarations";

type NotifierActions =
    | "changePassword"
    | "deleteUserAccount"
    | "identityChange"
    | "sendResetPwd"
    | "resetPwd";

const fileAttachments = [
    {
        cid: "logo.png",
        content: logo,
        encoding: "base64"
    }
];

/** Creates a 'notifier' (the returned function) for the `feathers-authentication-management` service.
 *
 *  It handles sending out emails to users based on certain actions that users take. */
const createNotifier = (app: Application) => {
    const constructLink = (type: string, token: string) => `${FRONTEND_URL}/${type}/${token}`;
    const sendEmail = async (email: Record<string, any>) => app.service("mailer").create(email);

    return async (
        type: NotifierActions,
        user: {email: string; resetToken?: string},
        options?: Record<string, any>
    ) => {
        const from = app.get("mailer").from;
        const to = user.email;

        let tokenLink;

        let email: Record<string, any> = {
            from,
            to,
            attachments: fileAttachments
        };

        // Other possible action types: resendVerifySignup, verifySignup
        switch (type) {
            // Send a password change confirmation email to the user.
            // Note: This currently is handled manually as a Users service hook, and not
            // through the Auth Management service; this is because we don't yet verify emails
            // on sign up.
            case "changePassword":
                email = {
                    ...email,
                    subject: "[uFincs] Your password was changed",
                    template: "password-change-confirmation"
                };

                return sendEmail(email);

            // Send an email to the user confirming that their user account was deleted.
            // Note: This is _not_ an auth management type; it is custom.
            case "deleteUserAccount":
                email = {
                    ...email,
                    subject: "[uFincs] Your account was deleted",
                    template: "account-deletion-confirmation"
                };

                return sendEmail(email);

            // Send an email change confirmation email to the user.
            // Note: This currently is handled manually as a Users service hook, and not
            // through the Auth Management service; this is because we don't yet verify emails
            // on sign up.
            case "identityChange":
                email = {
                    ...email,
                    subject: "[uFincs] Your email was changed",
                    template: "email-change-confirmation",
                    "h:X-Mailgun-Variables": JSON.stringify({
                        oldEmail: options?.oldEmail,
                        newEmail: options?.newEmail
                    })
                };

                return sendEmail(email);

            // Send a password reset link to the user.
            case "sendResetPwd":
                tokenLink = constructLink("password-reset", user.resetToken as string);

                email = {
                    ...email,
                    subject: "[uFincs] Reset your password",
                    template: "password-reset",
                    "h:X-Mailgun-Variables": JSON.stringify({tokenLink})
                };

                return sendEmail(email);

            // Send a password reset confirmation email to the user.
            case "resetPwd":
                email = {
                    ...email,
                    subject: "[uFincs] Successful password reset",
                    template: "password-reset-confirmation"
                };

                return sendEmail(email);

            default:
                return;
        }
    };
};

export default createNotifier;
