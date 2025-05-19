import classNames from "classnames";
import {TextField} from "components/atoms";
import {ConfirmationDialog} from "components/molecules";
import connect, {ConnectedProps} from "./connect";
import "./PasswordResetDialog.scss";

interface PasswordResetDialogProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** A modal dialog for confirming with the user that their password should be reset and all of their
 *  account data should be wiped. */
const PasswordResetDialog = ({
    className,
    isVisible,
    onClose,
    onResetPassword
}: PasswordResetDialogProps) => (
    <ConfirmationDialog
        className={classNames("PasswordResetDialog", className)}
        isVisible={isVisible}
        primaryActionLabel="Yes, Change Password"
        title="Change Password?"
        onClose={onClose}
        onPrimaryAction={onResetPassword}
    >
        <TextField>
            By changing your password, you accept that all of your existing data will be DELETED
            because it cannot be recovered once your password is reset.
            <br /> <br />
            You also accept that you will LOSE all of your new data if you forget your password
            (again), because your new data will be encrypted with your new password.
        </TextField>
    </ConfirmationDialog>
);

export const PureComponent = PasswordResetDialog;
export const ConnectedPasswordResetDialog = connect(PasswordResetDialog);
export default ConnectedPasswordResetDialog;
