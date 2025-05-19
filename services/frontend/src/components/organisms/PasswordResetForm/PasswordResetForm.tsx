import classNames from "classnames";
import {useForm} from "react-hook-form";
import {Card, OverlineHeading} from "components/atoms";
import {LabelledInput, SubmitButton} from "components/molecules";
import connect, {ConnectedProps, PasswordResetFormData} from "./connect";
import "./PasswordResetForm.scss";

interface PasswordResetFormProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The form that is shown to a user once they click on the link sent to them by the
 * `SendPasswordResetForm`. Enables them to change their password (and delete all their data). */
const PasswordResetForm = ({className, error, loading, onSubmit}: PasswordResetFormProps) => {
    const {errors, handleSubmit, register, watch} = useForm<PasswordResetFormData>();

    return (
        <Card className={classNames("PasswordResetForm", className)}>
            <OverlineHeading>Change Password</OverlineHeading>

            <form className="PasswordResetForm-form" onSubmit={handleSubmit(onSubmit)}>
                <LabelledInput
                    name="password"
                    type="password"
                    label="New Password"
                    placeholder="Enter your new password"
                    autoFocus={true}
                    disabled={loading}
                    error={errors?.password?.message}
                    ref={register({required: "New Password is missing"})}
                />

                <LabelledInput
                    name="confirmPassword"
                    type="password"
                    label="Confirm Password"
                    placeholder="Confirm your new password"
                    disabled={loading}
                    error={errors?.confirmPassword?.message}
                    ref={register({
                        required: "Confirm Password is missing",
                        validate: (value) => value === watch("password") || "Password doesn't match"
                    })}
                />

                <SubmitButton
                    data-testid="password-reset-form-submit"
                    error={error}
                    loading={loading}
                >
                    Change Password
                </SubmitButton>
            </form>
        </Card>
    );
};

export const PureComponent = PasswordResetForm;
export const ConnectedPasswordResetForm = connect(PasswordResetForm);
export default ConnectedPasswordResetForm;
