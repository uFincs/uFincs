import classNames from "classnames";
import React from "react";
import {ChangeEmailForm, ChangePasswordForm, DeleteUserAccountForm} from "components/organisms";
import "./UserAccount.scss";

interface UserAccountProps {
    /** Custom class name. */
    className?: string;
}

/** The combined layout for the User Account section of the Settings. */
const UserAccount = ({className}: UserAccountProps) => (
    <div className={classNames("UserAccount", className)}>
        <ChangeEmailForm />
        <ChangePasswordForm />
        <DeleteUserAccountForm />
    </div>
);

export default UserAccount;
