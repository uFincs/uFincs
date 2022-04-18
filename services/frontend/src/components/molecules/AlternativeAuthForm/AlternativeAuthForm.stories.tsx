import {action} from "@storybook/addon-actions";
import React from "react";
import {AuthType} from "components/molecules/AuthForm";
import {smallViewport} from "utils/stories";
import AlternativeAuthForm from "./AlternativeAuthForm";

export default {
    title: "Molecules/Alternative Auth Form",
    component: AlternativeAuthForm
};

/** The `login` variant of the `AlternativeAuthForm` shows the user how to sign up. */
export const Login = () => (
    <AlternativeAuthForm type={AuthType.login} onClick={action("clicked")} />
);

/** The small version of the `login` variant of `AlternativeAuthForm`. */
export const LoginSmall = () => (
    <AlternativeAuthForm type={AuthType.login} onClick={action("clicked")} />
);

LoginSmall.parameters = smallViewport;

/** The `signup` variant of the `AlternativeAuthForm` shows the user how to login. */
export const SignUp = () => (
    <AlternativeAuthForm type={AuthType.signup} onClick={action("clicked")} />
);

/** The small version of the `signup` variant of `AlternativeAuthForm`. */
export const SignUpSmall = () => (
    <AlternativeAuthForm type={AuthType.signup} onClick={action("clicked")} />
);

SignUpSmall.parameters = smallViewport;

/** The disabled state of the `AlternativeAuthForm`.
 *  The form's button should appear look disabled and be unclickable.
 */
export const Disabled = () => (
    <AlternativeAuthForm disabled={true} type={AuthType.login} onClick={action("clicked")} />
);
