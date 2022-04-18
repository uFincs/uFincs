import {actions} from "@storybook/addon-actions";
import {boolean} from "@storybook/addon-knobs";
import React from "react";
import DialogContainer from "./DialogContainer";

export default {
    title: "Atoms/Dialog Container",
    component: DialogContainer
};

const dialogActions = actions("onClose");
const visibilityKnob = () => boolean("isVisible", true);

/** The default view of `DialogContainer`. */
export const Default = () => (
    <DialogContainer isVisible={visibilityKnob()} title="Test Dialog" {...dialogActions}>
        <p>This is a dialog</p>
    </DialogContainer>
);
