import {actions} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as UserDropdown} from "./UserDropdown";

const meta: Meta<typeof UserDropdown> = {
    title: "Molecules/User Dropdown",
    component: UserDropdown
};

export default meta;
type Story = StoryObj<typeof UserDropdown>;

const dropdownActions = actions(
    "onChangelog",
    "onCheckForUpdates",
    "onLogout",
    "onSendFeedback",
    "onSettings"
);

/** The default view of the `UserDropdown`. */
export const Default: Story = {
    args: {
        ...dropdownActions
    }
};
