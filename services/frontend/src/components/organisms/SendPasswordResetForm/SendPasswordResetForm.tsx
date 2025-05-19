import classNames from "classnames";
import {useEffect, useState} from "react";
import {useForm} from "react-hook-form";
import {Card, OverlineHeading, ShadowButton, TextField} from "components/atoms";
import {LabelledInput, SubmitButton} from "components/molecules";
import {useRegisterEmailInput} from "components/molecules/AuthForm/hooks";
import connect, {ConnectedProps, SendPasswordResetFormData} from "./connect";
import "./SendPasswordResetForm.scss";

interface SendPasswordResetFormProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The form used when a user clicks the 'Forgot your password' link to send them a password reset link. */
const SendPasswordResetForm = ({
    className,
    loading,
    onReturnToLogin,
    onSubmit
}: SendPasswordResetFormProps) => {
    const [submitted, setSubmitted] = useState(false);
    const [showRequestReceived, setShowRequestReceived] = useState(false);

    const {errors, handleSubmit, register} = useForm<SendPasswordResetFormData>();
    const registerEmailInput = useRegisterEmailInput(register);

    const finalOnSubmit = (data: SendPasswordResetFormData) => {
        onSubmit(data);
        setSubmitted(true);
    };

    useEffect(() => {
        if (submitted && !loading) {
            // Once the form is submitted and the request has stopped loading,
            // then we can show that the request has been 'received', regardless if there was an error.
            setShowRequestReceived(true);
        }
    }, [submitted, loading]);

    return (
        <Card className={classNames("SendPasswordResetForm", className)}>
            {showRequestReceived ? (
                <>
                    <OverlineHeading>Reset Request Received</OverlineHeading>

                    <TextField>
                        Check your email for a link to reset your password. If it doesn&apos;t
                        appear within a few minutes, check your spam folder.
                    </TextField>

                    <ShadowButton onClick={onReturnToLogin}>Return to Login</ShadowButton>
                </>
            ) : (
                <>
                    <OverlineHeading>Forgot your Password?</OverlineHeading>

                    <TextField>
                        Enter your account&apos;s email address and we&apos;ll send you a password
                        reset link.
                    </TextField>

                    <form
                        className="SendPasswordResetForm-form"
                        onSubmit={handleSubmit(finalOnSubmit)}
                    >
                        <LabelledInput
                            name="email"
                            type="email"
                            aria-label="Email"
                            label=""
                            placeholder="Enter your email"
                            autoFocus={true}
                            disabled={loading}
                            error={errors?.email?.message}
                            ref={registerEmailInput}
                        />

                        <SubmitButton loading={loading}>Send password reset email</SubmitButton>
                    </form>
                </>
            )}
        </Card>
    );
};

export const PureComponent = SendPasswordResetForm;
export const ConnectedSendPasswordResetForm = connect(SendPasswordResetForm);
export default ConnectedSendPasswordResetForm;
