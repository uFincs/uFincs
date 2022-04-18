import {actions} from "@storybook/addon-actions";
import React from "react";
import SettingsNavigation from "./SettingsNavigation";

export default {
    title: "Organisms/Settings Navigation",
    component: SettingsNavigation
};

const navigationActions = actions("onLogout", "onNoAccountSignUp");

/** The desktop layout of the `SettingsNavigation`. */
export const Desktop = () => <SettingsNavigation desktopLayout={true} {...navigationActions} />;

/** The mobile layout of the `SettingsNavigation`. */
export const Mobile = () => <SettingsNavigation desktopLayout={false} {...navigationActions} />;
