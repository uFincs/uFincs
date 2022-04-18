import classNames from "classnames";
import React from "react";
import {TextField} from "components/atoms";
import {ConfirmationDialog} from "components/molecules";
import connect, {ConnectedProps} from "./connect";
import "./AccountDeletionDialog.scss";

interface AccountDeletionDialogProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** A modal dialog for confirming with the user that an account should be deleted. */
const AccountDeletionDialog = ({
    className,
    isVisible,
    onClose,
    onDelete
}: AccountDeletionDialogProps) => (
    <ConfirmationDialog
        className={classNames("AccountDeletionDialog", className)}
        data-testid="account-deletion-dialog"
        isVisible={isVisible}
        primaryActionLabel="Yes, Delete Account"
        title="Delete Account?"
        onClose={onClose}
        onPrimaryAction={onDelete}
    >
        <>
            <TextField>You will lose:</TextField>

            <ul className="AccountDeletionDialog-list">
                <li>
                    <TextField>- the account</TextField>
                </li>
                <li>
                    <TextField>- all of its transactions</TextField>
                </li>
            </ul>

            <TextField>You sure about that?</TextField>
        </>
    </ConfirmationDialog>
);

export const PureComponent = AccountDeletionDialog;
export default connect(AccountDeletionDialog);
