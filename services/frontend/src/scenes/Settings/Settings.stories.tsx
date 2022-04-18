import {actions} from "@storybook/addon-actions";
import React from "react";
import {PureComponent as Settings} from "./Settings";

export default {
    title: "Scenes/Settings",
    component: Settings
};

const settingsActions = actions(
    "onBack",
    "onChangelog",
    "onCheckForUpdates",
    "onLogout",
    "onNoAccountSignUp",
    "onSendFeedback"
);

/** The default view of the 'Settings' scene. */
export const Default = () => <Settings {...settingsActions} />;
