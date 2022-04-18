import {actions} from "@storybook/addon-actions";
import {boolean} from "@storybook/addon-knobs";
import React from "react";
import {PureComponent as DeleteUserAccountDialog} from "./DeleteUserAccountDialog";

export default {
    title: "Organisms/Delete User Account Dialog",
    component: DeleteUserAccountDialog
};

const dialogActions = actions("onClose", "onDelete");

const visibilityKnob = () => boolean("Visible", true);

/** The default view of `DeleteUserAccountDialog`. */
export const Default = () => (
    <DeleteUserAccountDialog isVisible={visibilityKnob()} {...dialogActions} />
);
