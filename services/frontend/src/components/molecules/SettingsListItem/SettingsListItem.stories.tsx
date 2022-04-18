import {actions} from "@storybook/addon-actions";
import {boolean, text} from "@storybook/addon-knobs";
import React from "react";
import {LogoutIcon} from "assets/icons";
import SettingsListItem from "./SettingsListItem";

export default {
    title: "Molecules/Settings List Item",
    component: SettingsListItem
};

const itemActions = actions("onClick");

const active = () => boolean("Active", true);
const description = () => text("Description", "Change your email and password");
const title = () => text("Title", "User Account");

const customIcon = <LogoutIcon />;

/** What the desktop version of the `SettingsListItem` looks like. */
export const Desktop = () => (
    <SettingsListItem
        desktopLayout={true}
        description={description()}
        title={title()}
        active={active()}
        {...itemActions}
    />
);

/** What the mobile version of the `SettingsListItem` looks like. */
export const Mobile = () => (
    <SettingsListItem
        desktopLayout={false}
        description={description()}
        title={title()}
        {...itemActions}
    />
);

/** The `SettingsListItem` with a custom icon. */
export const CustomIcon = () => (
    <SettingsListItem
        desktopLayout={false}
        description={description()}
        icon={customIcon}
        title={title()}
        active={active()}
        {...itemActions}
    />
);
