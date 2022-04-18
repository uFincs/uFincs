import {actions} from "@storybook/addon-actions";
import {boolean} from "@storybook/addon-knobs";
import React from "react";
import {PureComponent as PasswordResetDialog} from "./PasswordResetDialog";

export default {
    title: "Organisms/Password Reset Dialog",
    component: PasswordResetDialog
};

const dialogActions = actions("onClose", "onResetPassword");
const isVisible = () => boolean("Is Visible", true);

/** The default view of `PasswordResetDialog`. */
export const Default = () => <PasswordResetDialog isVisible={isVisible()} {...dialogActions} />;
