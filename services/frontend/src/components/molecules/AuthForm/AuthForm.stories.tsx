import {action} from "@storybook/addon-actions";
import {boolean, text} from "@storybook/addon-knobs";
import React, {useEffect, useState} from "react";
import {smallViewport} from "utils/stories";
import AuthForm, {AuthType} from "./AuthForm";

export default {
    title: "Molecules/Auth Form",
    component: AuthForm,
    parameters: {
        backgrounds: {
            default: "Dark"
        }
    }
};

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
export const Login = () => {
    const {loading, onSubmit} = useEnableForm();
    return <AuthForm type={AuthType.login} loading={loading} onSubmit={onSubmit} />;
};

/** The `signup` variant of the `AuthForm`; the submission button is labelled with 'Sign Up'.  */
export const SignUp = () => {
    const {loading, onSubmit} = useEnableForm();
    return <AuthForm type={AuthType.signup} loading={loading} onSubmit={onSubmit} />;
};

/** What the `AuthForm` looks like on small devices.  */
export const Small = () => {
    const {loading, onSubmit} = useEnableForm();
    return <AuthForm type={AuthType.login} loading={loading} onSubmit={onSubmit} />;
};

Small.parameters = smallViewport;

/** The `AuthForm` with an externally generated error.
 *  This is opposed to an internal error, which is handled internally for validating the
 *  inputs before submission.
 */
export const ExternalError = () => (
    <AuthForm
        error={text("Error Message", "Something has gone terribly wrong")}
        type={AuthType.login}
        onSubmit={submitAction()}
    />
);

/** The loading state of the `AuthForm`.
 *  Inputs get disabled and the submission button transforms into a loading spinner.
 */
export const Loading = () => (
    <AuthForm loading={boolean("Loading", true)} type={AuthType.login} onSubmit={submitAction()} />
);
