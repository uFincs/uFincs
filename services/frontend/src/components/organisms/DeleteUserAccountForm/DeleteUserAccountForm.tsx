import classNames from "classnames";
import {TextField} from "components/atoms";
import {SubmitButton} from "components/molecules";
import connect, {ConnectedProps} from "./connect";
import "./DeleteUserAccountForm.scss";

interface DeleteUserAccountFormProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The form that allows users to delete their user account in the Settings. */
const DeleteUserAccountForm = ({
    className,
    error,
    loading,
    onSubmit
}: DeleteUserAccountFormProps) => (
    <div className={classNames("DeleteUserAccountForm", className)}>
        <h3 className="DeleteUserAccountForm-header">Delete Account</h3>

        <TextField>
            Yeah, once you delete your user account, <strong>it&apos;s gone</strong>.
            <br /> <br />
            All your transactions, all your accounts, poof! Reduced to atoms.
            <br />
            So you better be certain.
        </TextField>

        <SubmitButton
            containerClassName="DeleteUserAccountForm-SubmitButton"
            data-testid="delete-user-account-form-submit"
            error={error as string}
            loading={loading}
            variant="negative"
            onClick={onSubmit}
        >
            Delete Your Account
        </SubmitButton>
    </div>
);

export const PureComponent = DeleteUserAccountForm;
export const ConnectedDeleteUserAccountForm = connect(DeleteUserAccountForm);
export default ConnectedDeleteUserAccountForm;
