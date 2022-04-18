import classNames from "classnames";
import React, {useMemo} from "react";
import {Dropdown, UserAvatar} from "components/atoms";
import {useNoAccount} from "hooks/";
import {NativePlatformsService} from "services/";
import {MarketingUrls} from "values/screenUrls";
import connect, {ConnectedProps} from "./connect";
import "./UserDropdown.scss";

const useGenerateItems = (
    noAccount: boolean,
    onCheckForUpdates: () => void,
    onLogout: () => void,
    onSendFeedback: () => void,
    onSettings: () => void
) =>
    useMemo(
        () => [
            {label: "Settings", onClick: onSettings},
            ...(noAccount ? [] : [{label: "Send Feedback", onClick: onSendFeedback}]),
            {label: "Changelog", link: MarketingUrls.CHANGELOG},
            ...(NativePlatformsService.isMobilePlatform()
                ? []
                : [{label: "Check for Updates", onClick: onCheckForUpdates}]),
            {label: "Logout", onClick: onLogout}
        ],
        [noAccount, onCheckForUpdates, onLogout, onSendFeedback, onSettings]
    );

interface UserDropdownProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** Combines the `UserAvatar` with a `Dropdown` to form the menu where the user can logout
 *  and perform other administrative actions. */
const UserDropdown = ({
    className,
    onCheckForUpdates,
    onLogout,
    onSendFeedback,
    onSettings
}: UserDropdownProps) => {
    const noAccount = useNoAccount();
    const items = useGenerateItems(
        noAccount,
        onCheckForUpdates,
        onLogout,
        onSendFeedback,
        onSettings
    );

    return (
        <Dropdown
            className={classNames("UserDropdown", className)}
            TriggerButton={UserAvatar}
            items={items}
            alignment="right"
            data-testid="user-dropdown"
        />
    );
};

export const PureComponent = UserDropdown;
export default connect(UserDropdown);
