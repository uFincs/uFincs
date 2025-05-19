import {actions} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as Settings} from "./Settings";

const meta: Meta<typeof Settings> = {
    title: "Scenes/Settings",
    component: Settings
};

export default meta;
type Story = StoryObj<typeof Settings>;

const settingsActions = actions(
    "onBack",
    "onChangelog",
    "onCheckForUpdates",
    "onLogout",
    "onNoAccountSignUp",
    "onSendFeedback"
);

/** The default view of the 'Settings' scene. */
export const Default: Story = {
    args: {},
    render: () => <Settings {...settingsActions} />
};
