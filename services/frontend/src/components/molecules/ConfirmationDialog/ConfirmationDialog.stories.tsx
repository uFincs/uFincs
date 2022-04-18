import {actions} from "@storybook/addon-actions";
import {boolean, text} from "@storybook/addon-knobs";
import React from "react";
import {smallViewport} from "utils/stories";
import ConfirmationDialog from "./ConfirmationDialog";

export default {
    title: "Molecules/Confirmation Dialog",
    component: ConfirmationDialog
};

const dialogActions = actions("onClose", "onPrimaryAction");

const visibilityKnob = () => boolean("Visible", true);
const primaryLabelKnob = () => text("Primary Action Label", "Delete Account");
const secondaryLabelKnob = () => text("Secondary Action Label", "Cancel");
const titleKnob = () => text("Title", "Delete Account?");
const bodyKnob = () => text("Body", "You will permanently lose EVERYTHING!!!");

/** The 'negative' variant of the `ConfirmationDialog`. */
export const Negative = () => (
    <ConfirmationDialog
        isVisible={visibilityKnob()}
        primaryActionLabel={primaryLabelKnob()}
        secondaryActionLabel={secondaryLabelKnob()}
        title={titleKnob()}
        {...dialogActions}
    >
        <p>{bodyKnob()}</p>
    </ConfirmationDialog>
);

/** The 'negative' variant of the `ConfirmationDialog` in a small layout. */
export const SmallNegative = () => (
    <ConfirmationDialog
        isVisible={visibilityKnob()}
        primaryActionLabel={primaryLabelKnob()}
        secondaryActionLabel={secondaryLabelKnob()}
        title={titleKnob()}
        {...dialogActions}
    >
        <p>{bodyKnob()}</p>
    </ConfirmationDialog>
);

SmallNegative.parameters = smallViewport;
