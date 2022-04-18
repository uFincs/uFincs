import {actions} from "@storybook/addon-actions";
import {boolean} from "@storybook/addon-knobs";
import React from "react";
import {PureComponent as NoAccountLogoutDialog} from "./NoAccountLogoutDialog";

export default {
    title: "Organisms/No Account Logout Dialog",
    component: NoAccountLogoutDialog
};

const dialogActions = actions("onClose", "onLogout");

const visibilityKnob = () => boolean("Visible", true);

/** The default view of `NoAccountLogoutDialog`. */
export const Default = () => (
    <NoAccountLogoutDialog isVisible={visibilityKnob()} {...dialogActions} />
);
