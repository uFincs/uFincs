import {actions} from "@storybook/addon-actions";
import React from "react";
import {PureComponent as UserDropdown} from "./UserDropdown";

export default {
    title: "Molecules/User Dropdown",
    component: UserDropdown
};

const dropdownActions = actions(
    "onChangelog",
    "onCheckForUpdates",
    "onLogout",
    "onSendFeedback",
    "onSettings"
);

/** The default view of the `UserDropdown`. */
export const Default = () => (
    <div className="UserDropdown--story-container">
        <UserDropdown {...dropdownActions} />
    </div>
);
