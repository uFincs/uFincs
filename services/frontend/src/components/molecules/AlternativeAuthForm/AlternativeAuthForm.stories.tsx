import {type Meta, type StoryObj} from "@storybook/react";
import {AuthType} from "components/molecules/AuthForm";
import {smallViewport} from "utils/stories";
import AlternativeAuthForm from "./AlternativeAuthForm";

const meta: Meta<typeof AlternativeAuthForm> = {
    title: "Molecules/Alternative Auth Form",
    component: AlternativeAuthForm,
    args: {
        type: AuthType.login
    }
};

export default meta;
type Story = StoryObj<typeof AlternativeAuthForm>;

/** The `login` variant of the `AlternativeAuthForm` shows the user how to sign up. */
export const Login: Story = {
    args: {
        type: AuthType.login
    }
};

/** The small version of the `login` variant of `AlternativeAuthForm`. */
export const LoginSmall: Story = {
    args: {
        type: AuthType.login
    },
    parameters: {
        ...smallViewport
    }
};

/** The `signup` variant of the `AlternativeAuthForm` shows the user how to login. */
export const SignUp: Story = {
    args: {
        type: AuthType.signup
    }
};

/** The small version of the `signup` variant of `AlternativeAuthForm`. */
export const SignUpSmall: Story = {
    args: {
        type: AuthType.signup
    },
    parameters: {
        ...smallViewport
    }
};

/** The disabled state of the `AlternativeAuthForm`.
 *  The form's button should appear look disabled and be unclickable.
 */
export const Disabled: Story = {
    args: {
        disabled: true
    }
};
