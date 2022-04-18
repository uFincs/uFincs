import {actions} from "@storybook/addon-actions";
import React from "react";
import UndoToast from "./UndoToast";

export default {
    title: "Molecules/Undo Toast",
    component: UndoToast
};

const toastActions = actions("onClose", "onUndo");

/** The default view of an `UndoToast`. */
export const Default = () => <UndoToast message="Deleted account 123" {...toastActions} />;
