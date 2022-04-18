import {actions} from "@storybook/addon-actions";
import {boolean} from "@storybook/addon-knobs";
import React from "react";
import {PureComponent as PureAccountDeletionDialog} from "./AccountDeletionDialog";

export default {
    title: "Organisms/Account Deletion Dialog",
    component: PureAccountDeletionDialog
};

const dialogActions = actions("onClose", "onDelete");

const visibilityKnob = () => boolean("Visible", true);

/** The default view of the `AccountDeletionDialog`. */
export const Default = () => (
    <PureAccountDeletionDialog isVisible={visibilityKnob()} {...dialogActions} />
);
