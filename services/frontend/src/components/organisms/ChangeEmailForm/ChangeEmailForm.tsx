import classNames from "classnames";
import {useEffect} from "react";
import {useForm} from "react-hook-form";
import {TextField} from "components/atoms";
import {LabelledInput, SubmitButton} from "components/molecules";
import InputValidation from "values/inputValidation";
import connect, {ConnectedProps} from "./connect";
import "./ChangeEmailForm.scss";

interface ChangeEmailFormData {
    newEmail: string;
}

const defaultValues: ChangeEmailFormData = {
    newEmail: ""
};

interface ChangeEmailFormProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The form that allows a user to change their email in the settings for their user account. */
const ChangeEmailForm = ({
    className,
    error,
    currentEmail,
    loading,
    onSubmit
}: ChangeEmailFormProps) => {
    const {errors, register, handleSubmit, reset} = useForm<ChangeEmailFormData>({
        defaultValues
    });

    const finalOnSubmit = handleSubmit(({newEmail}) => {
        onSubmit(newEmail);
    });

    useEffect(() => {
        // When the form switches from loading to not loading, we want to clear the inputs.
        // Note: Yes, this will technically run on (after) first render, but whatever.
        if (!loading) {
            reset();
        }
    }, [loading, reset]);

    return (
        <form className={classNames("ChangeEmailForm", className)} onSubmit={finalOnSubmit}>
            <h3 className="ChangeEmailForm-header">Change Email</h3>

            <TextField>
                Your current email address is <strong>{currentEmail}</strong>.
            </TextField>

            <LabelledInput
                containerClassName="ChangeEmailForm-LabelledInput"
                name="newEmail"
                label="New Email"
                placeholder="Enter your new email address"
                type="email"
                disabled={loading}
                error={errors?.newEmail?.message as string}
                ref={register({
                    required: "New Email is missing",
                    pattern: {
                        value: InputValidation.emailRegex,
                        message: "New Email is malformed"
                    }
                })}
            />

            <SubmitButton
                containerClassName="ChangeEmailForm-SubmitButton"
                data-testid="change-email-form-submit"
                error={error as string}
                loading={loading}
            >
                Change Email
            </SubmitButton>
        </form>
    );
};

export const PureComponent = ChangeEmailForm;
export const ConnectedChangeEmailForm = connect(ChangeEmailForm);
export default ConnectedChangeEmailForm;
