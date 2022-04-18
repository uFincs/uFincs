import classNames from "classnames";
import React from "react";
import {TextField} from "components/atoms";
import {ConfirmationDialog} from "components/molecules";
import connect, {ConnectedProps} from "./connect";
import "./NoAccountLogoutDialog.scss";

interface NoAccountLogoutDialogProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** A modal dialog for confirming with the user that they want to logout when they try to logout
 *  in no-account mode. */
const NoAccountLogoutDialog = ({
    className,
    isVisible,
    onClose,
    onLogout
}: NoAccountLogoutDialogProps) => (
    <ConfirmationDialog
        className={classNames("NoAccountLogoutDialog", className)}
        data-testid="no-account-logout-dialog"
        isVisible={isVisible}
        primaryActionLabel="Yes, Logout"
        title="Logout and Lose Data?"
        onClose={onClose}
        onPrimaryAction={onLogout}
    >
        <>
            <TextField>
                You are using uFincs without an account.
                <br /> <br />
                If you logout, you will lose all the data stored locally in your browser, unless you
                make a backup from the Settings.
                <br /> <br />
                Are you sure you want to logout?
            </TextField>
        </>
    </ConfirmationDialog>
);

export const PureComponent = NoAccountLogoutDialog;
export default connect(NoAccountLogoutDialog);
