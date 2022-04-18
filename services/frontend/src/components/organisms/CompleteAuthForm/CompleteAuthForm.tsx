import classNames from "classnames";
import React from "react";
import {AlternativeAuthForm, AuthForm} from "components/molecules";
import {AuthFormData, AuthType} from "components/molecules/AuthForm";
import {useAlternativeFormAnimation} from "./hooks";
import "./CompleteAuthForm.scss";

interface CompleteAuthFormProps {
    /** Custom class name. */
    className?: string;

    /** Error message to show in the form (from e.g. a failed request). */
    error?: string;

    /** Whether or not the form should be shown to be loading after submission. */
    loading?: boolean;

    /** Whether or not to only have the login form and no sign up form.
     *
     *  Relevant on native mobile apps cause app stores. */
    onlyLoginForm?: boolean;

    /** The type of authentication to present to the user. */
    type?: AuthType;

    /** The handler for when the Login form submits. */
    onLogin: (data: AuthFormData) => void;

    /** The handler for when the Sign Up form submits. */
    onSignUp: (data: AuthFormData) => void;

    /** The handler that fires whenever the alternative auth form's button is clicked. */
    onAltClick: (e: React.MouseEvent) => void;
}

/** The `CompleteAuthForm` is the combination of the `AuthForm` and the `AlternativeAuthForm`
 *  to form a complete authentication experience: the user can seamlessly switch between
 *  login or sign up.
 */
const CompleteAuthForm = ({
    className,
    error,
    loading,
    onlyLoginForm = false,
    type = AuthType.login,
    onLogin,
    onSignUp,
    onAltClick
}: CompleteAuthFormProps) => {
    type = onlyLoginForm ? AuthType.login : type;

    const {hasAltBeenClicked, smallAnimationType, finalOnAltClick} = useAlternativeFormAnimation(
        type,
        onAltClick
    );

    return (
        <div
            className={classNames(
                "CompleteAuthForm",
                {
                    "CompleteAuthForm--login": type === AuthType.login,
                    "CompleteAuthForm--signup": type === AuthType.signup,
                    "CompleteAuthForm--only-login": onlyLoginForm,
                    "CompleteAuthForm--alt-clicked": hasAltBeenClicked,
                    "CompleteAuthForm--small-login-animation":
                        smallAnimationType === AuthType.login,
                    "CompleteAuthForm--small-signup-animation":
                        smallAnimationType === AuthType.signup
                },
                className
            )}
        >
            <AuthForm
                className="CompleteAuthForm-AuthForm"
                error={error}
                loading={loading}
                type={type}
                onSubmit={type === AuthType.login ? onLogin : onSignUp}
            />

            {!onlyLoginForm && (
                <AlternativeAuthForm
                    className={classNames("CompleteAuthForm-AlternativeAuthForm", {
                        "CompleteAuthForm-AlternativeAuthForm--login": type === AuthType.login,
                        "CompleteAuthForm-AlternativeAuthForm--signup": type === AuthType.signup
                    })}
                    disabled={loading}
                    type={type}
                    onClick={finalOnAltClick}
                />
            )}
        </div>
    );
};

export default CompleteAuthForm;
