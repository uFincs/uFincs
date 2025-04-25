import classNames from "classnames";
import React from "react";
import {useForm} from "react-hook-form";
import {FieldErrors} from "react-hook-form";

import {Card, Link, OverlineHeading} from "components/atoms";
import {LabelledInput, SubmitButton} from "components/molecules";
import ScreenUrls from "values/screenUrls";
import {useClearPasswordOnError, useRegisterEmailInput, useRegisterPasswordInput} from "./hooks";
import "./AuthForm.scss";

export enum AuthType {
    login = "login",
    signup = "signup"
}

export interface AuthFormData {
    email: string;
    password: string;
    username?: string;
}

const mapTypeLabel = (type: AuthType) => {
    switch (type) {
        case AuthType.login:
            return "Login";
        case AuthType.signup:
            return "Sign Up";
        default:
            return "Login";
    }
};

const mapErrorMessage = (type: AuthType, error: string, errors: FieldErrors<AuthFormData>) => {
    if (type === AuthType.signup) {
        if (errors.email) {
            return "You must provide an email";
        } else if (errors.password) {
            return "You must provide a password";
        }
    } else {
        if (errors.email || errors.password) {
            return "Wrong email or password";
        }
    }

    if (error) {
        return error;
    } else {
        return "";
    }
};

interface AuthFormProps {
    /** Custom class name. */
    className?: string;

    /** Error message to show in the form (from e.g. a failed request). */
    error?: string;

    /** Whether or not the form should be shown to be loading after submission. */
    loading?: boolean;

    /** The type of authentication this form does. */
    type: AuthType;

    /** Handler for when the form submits. */
    onSubmit: (data: AuthFormData) => void;
}

/** The basis of the authentication pages, the `AuthForm` is the inputs and submission
 *  button necessary for logging in/signing up users. */
const AuthForm = ({
    className,
    error = "",
    loading = false,
    type = AuthType.login,
    onSubmit
}: AuthFormProps) => {
    const {register, handleSubmit, errors} = useForm<AuthFormData>();

    const {emailRef, passwordRef} = useClearPasswordOnError(error);
    const registerEmailInput = useRegisterEmailInput(register, emailRef);
    const registerPasswordInput = useRegisterPasswordInput(register, passwordRef);

    return (
        <Card className={classNames("AuthForm", className)} data-testid="auth-form">
            <OverlineHeading>{mapTypeLabel(type)}</OverlineHeading>

            <form className="AuthForm-form" onSubmit={handleSubmit(onSubmit)}>
                <LabelledInput
                    containerClassName="AuthForm-LabelledInput"
                    name="email"
                    autoComplete="username"
                    type="email"
                    label="Email"
                    placeholder="Enter your email"
                    autoFocus={true}
                    disabled={loading}
                    error={errors?.email?.message as string}
                    ref={registerEmailInput}
                />

                {/* Note: THIS IS A FAKE INPUT. It is a honeypot for bots that will just fill out all the
                          fields of a form. Making it a 'username' field is just a way of making it juicier.
                          It is 'hidden' by absolutely positioning it outside the viewport. */}
                <LabelledInput
                    containerClassName="AuthForm-username-input"
                    autoComplete="off"
                    name="username"
                    label="Username"
                    placeholder="Leave this input empty"
                    tabIndex={-1}
                    ref={register({
                        validate: {
                            mustBeEmpty: (value: string) =>
                                !value || "Are you a bot? How did you fill out a hidden input?"
                        }
                    })}
                />

                <LabelledInput
                    containerClassName="AuthForm-LabelledInput"
                    name="password"
                    autoComplete={type === AuthType.login ? "current-password" : "new-password"}
                    type="password"
                    label="Password"
                    placeholder="Enter your password"
                    disabled={loading}
                    error={errors?.password?.message as string}
                    ref={registerPasswordInput}
                />

                <SubmitButton
                    containerClassName="AuthForm-SubmitButton"
                    // Need to display the honeypot 'error' message here since the actual input is hidden.
                    error={mapErrorMessage(type, error, errors) || errors.username?.message}
                    loading={loading}
                >
                    {mapTypeLabel(type)}
                </SubmitButton>

                {type === AuthType.login && (
                    <Link className="AuthForm-forgot-password" to={ScreenUrls.SEND_PASSWORD_RESET}>
                        Forgot your password?
                    </Link>
                )}
            </form>
        </Card>
    );
};

export default AuthForm;
