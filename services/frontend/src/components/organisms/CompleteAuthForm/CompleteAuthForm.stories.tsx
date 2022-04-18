import {action} from "@storybook/addon-actions";
import {boolean, text} from "@storybook/addon-knobs";
import React, {useEffect, useState} from "react";
import {AuthType} from "components/molecules/AuthForm";
import {smallViewport} from "utils/stories";
import CompleteAuthForm from "./CompleteAuthForm";

export default {
    title: "Organisms/Complete Auth Form",
    component: CompleteAuthForm,
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

const useMakeFunctional = (defaultType: AuthType = AuthType.login) => {
    const {loading, onSubmit} = useEnableForm();
    const [type, setType] = useState(defaultType);

    const onAltClick = () => {
        action("alternative clicked")();

        if (type === AuthType.login) {
            setType(AuthType.signup);
        } else if (type === AuthType.signup) {
            setType(AuthType.login);
        }
    };

    const onLogin = (data: any) => {
        action("login submitted")();
        onSubmit(data);
    };

    const onSignUp = (data: any) => {
        action("signup submitted")();
        onSubmit(data);
    };

    return {loading, type, onLogin, onSignUp, onAltClick};
};

/** The `CompleteAuthForm` when the default type is `login`. */
export const Login = () => {
    const {loading, type, onLogin, onSignUp, onAltClick} = useMakeFunctional(AuthType.login);

    return (
        <CompleteAuthForm
            loading={loading}
            type={type}
            onLogin={onLogin}
            onSignUp={onSignUp}
            onAltClick={onAltClick}
        />
    );
};

/** The `CompleteAuthForm` when the default type is `signup`. */
export const SignUp = () => {
    const {loading, type, onLogin, onSignUp, onAltClick} = useMakeFunctional(AuthType.signup);

    return (
        <CompleteAuthForm
            loading={loading}
            type={type}
            onLogin={onLogin}
            onSignUp={onSignUp}
            onAltClick={onAltClick}
        />
    );
};

/** What the `CompleteAuthForm` looks like on small devices. */
export const Small = () => {
    const {loading, type, onLogin, onSignUp, onAltClick} = useMakeFunctional(AuthType.login);

    return (
        <CompleteAuthForm
            loading={loading}
            type={type}
            onLogin={onLogin}
            onSignUp={onSignUp}
            onAltClick={onAltClick}
        />
    );
};

Small.parameters = smallViewport;

/** The external error state of the `CompleteAuthForm`. */
export const ExternalError = () => {
    const {type, onAltClick} = useMakeFunctional();

    return (
        <CompleteAuthForm
            error={text("Label", "Wrong email or password")}
            type={type}
            onLogin={action("login")}
            onSignUp={action("signup")}
            onAltClick={onAltClick}
        />
    );
};

/** The loading state of the `CompleteAuthForm`. */
export const Loading = () => {
    const {type, onAltClick} = useMakeFunctional();

    return (
        <CompleteAuthForm
            loading={boolean("Loading", true)}
            type={type}
            onLogin={action("login")}
            onSignUp={action("signup")}
            onAltClick={onAltClick}
        />
    );
};

/** The "Only Login Form" view of the `CompleteAuthForm`. */
export const OnlyLogin = () => {
    const {type, onAltClick} = useMakeFunctional();

    return (
        <CompleteAuthForm
            onlyLoginForm={boolean("Only Login", true)}
            type={type}
            onLogin={action("login")}
            onSignUp={action("signup")}
            onAltClick={onAltClick}
        />
    );
};
