import classNames from "classnames";
import {useEffect} from "react";
import {useForm} from "react-hook-form";
import {TextField} from "components/atoms";
import {LabelledInput, SubmitButton} from "components/molecules";
import connect, {ConnectedProps} from "./connect";
import "./ChangePasswordForm.scss";

interface ChangePasswordFormData {
    oldPassword: string;
    newPassword: string;
}

const defaultValues: ChangePasswordFormData = {
    oldPassword: "",
    newPassword: ""
};

interface ChangePasswordFormProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The form that allows a user to change their password in the settings for their user account. */
const ChangePasswordForm = ({className, error, loading, onSubmit}: ChangePasswordFormProps) => {
    const {errors, register, handleSubmit, reset} = useForm<ChangePasswordFormData>({
        defaultValues
    });

    const finalOnSubmit = handleSubmit(({oldPassword, newPassword}) => {
        onSubmit(oldPassword, newPassword);
    });

    useEffect(() => {
        // When the form switches from loading to not loading, we want to clear the inputs.
        // Note: Yes, this will technically run on (after) first render, but whatever.
        if (!loading) {
            reset();
        }
    }, [loading, reset]);

    return (
        <form className={classNames("ChangePasswordForm", className)} onSubmit={finalOnSubmit}>
            <h3 className="ChangePasswordForm-header">Change Password</h3>

            <TextField>
                Changing your password will re-encrypt all of your data under your new password.
            </TextField>

            <LabelledInput
                containerClassName="ChangePasswordForm-LabelledInput"
                name="oldPassword"
                label="Old Password"
                placeholder="Your old, insecure password"
                type="password"
                disabled={loading}
                error={errors?.oldPassword?.message as string}
                ref={register({
                    required: "Old Password is missing"
                })}
            />

            <LabelledInput
                containerClassName="ChangePasswordForm-LabelledInput"
                name="newPassword"
                label="New Password"
                placeholder="Your new, totally secure password"
                type="password"
                disabled={loading}
                error={errors?.newPassword?.message as string}
                ref={register({
                    required: "New Password is missing"
                })}
            />

            <SubmitButton
                containerClassName="ChangePasswordForm-SubmitButton"
                data-testid="change-password-form-submit"
                error={error as string}
                loading={loading}
            >
                Change Password
            </SubmitButton>
        </form>
    );
};

export const PureComponent = ChangePasswordForm;
export const ConnectedChangePasswordForm = connect(ChangePasswordForm);
export default ConnectedChangePasswordForm;
