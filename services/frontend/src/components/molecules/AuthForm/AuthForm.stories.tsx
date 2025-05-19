import {action} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import {useEffect, useState} from "react";
import {smallViewport, storyUsingHooks, storyUsingRedux} from "utils/stories";
import AuthForm, {AuthType} from "./AuthForm";

const meta: Meta<typeof AuthForm> = {
    title: "Molecules/Auth Form",
    component: AuthForm,
    parameters: {
        backgrounds: {
            default: "Dark"
        }
    },
    args: {
        type: AuthType.login
    }
};

export default meta;
type Story = StoryObj<typeof AuthForm>;

const submitAction = () => action("submitted");

const useEnableForm = () => {
    const [loading, setLoading] = useState(false);

    const onSubmit = (data: any) => {
        submitAction()(data);
        setLoading(true);
    };

    useEffect(() => {
        if (loading) {
            setTimeout(() => {
                setLoading(false);
            }, 3000);
        }
    }, [loading, setLoading]);

    return {loading, onSubmit};
};

/** The `login` variant of the `AuthForm`; the submission button is labelled with 'Login'.  */
export const Login: Story = {
    args: {
        type: AuthType.login
    },
    render: storyUsingHooks((args) => {
        const {loading, onSubmit} = useEnableForm();
        return <AuthForm {...args} loading={loading} onSubmit={onSubmit} />;
    })
};

/** The `signup` variant of the `AuthForm`; the submission button is labelled with 'Sign Up'.  */
export const SignUp: Story = {
    args: {
        type: AuthType.signup
    },
    render: storyUsingRedux((args) => {
        const {loading, onSubmit} = useEnableForm();
        return <AuthForm {...args} loading={loading} onSubmit={onSubmit} />;
    })
};

/** What the `AuthForm` looks like on small devices.  */
export const Small: Story = {
    parameters: {
        ...smallViewport
    },
    render: storyUsingHooks((args) => {
        const {loading, onSubmit} = useEnableForm();
        return <AuthForm {...args} loading={loading} onSubmit={onSubmit} />;
    })
};

/** The `AuthForm` with an externally generated error.
 *  This is opposed to an internal error, which is handled internally for validating the
 *  inputs before submission. */
export const ExternalError: Story = {
    args: {
        error: "Something has gone terribly wrong"
    }
};

/** The loading state of the `AuthForm`.
 *  Inputs get disabled and the submission button transforms into a loading spinner. */
export const Loading: Story = {
    args: {
        loading: true
    }
};
