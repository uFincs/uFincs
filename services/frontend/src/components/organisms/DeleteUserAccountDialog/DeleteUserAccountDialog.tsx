import classNames from "classnames";
import React, {useCallback, useState} from "react";
import {Input, TextField} from "components/atoms";
import {ConfirmationDialog} from "components/molecules";
import connect, {ConnectedProps} from "./connect";
import "./DeleteUserAccountDialog.scss";

interface DeleteUserAccountDialogProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** A modal dialog for confirming with the user that their user account should be terminated. */
const DeleteUserAccountDialog = ({
    className,
    isVisible,
    onClose,
    onDelete
}: DeleteUserAccountDialogProps) => {
    const [password, setPassword] = useState("");

    const onSubmit = useCallback(() => onDelete(password), [password, onDelete]);

    return (
        <ConfirmationDialog
            className={classNames("DeleteUserAccountDialog", className)}
            data-testid="delete-user-account-dialog"
            isVisible={isVisible}
            primaryActionLabel="Delete My Account"
            title="Delete Your Account?"
            onClose={onClose}
            onPrimaryAction={onSubmit}
        >
            <>
                <TextField>You will permanently lose:</TextField>

                <ul className="DeleteUserAccountDialog-list">
                    <li>
                        <TextField>- all of your accounts</TextField>
                    </li>
                    <li>
                        <TextField>- all of your transactions</TextField>
                    </li>
                    <li>
                        <TextField>- everything else related to your account</TextField>
                    </li>
                </ul>

                <TextField>Enter your password to confirm:</TextField>

                <Input
                    containerClassName="DeleteUserAccountDialog-input"
                    aria-label="Password"
                    name="password"
                    type="password"
                    placeholder="Your password"
                    onChange={(e) => setPassword(e.target.value)}
                />
            </>
        </ConfirmationDialog>
    );
};

export const PureComponent = DeleteUserAccountDialog;
export default connect(DeleteUserAccountDialog);
