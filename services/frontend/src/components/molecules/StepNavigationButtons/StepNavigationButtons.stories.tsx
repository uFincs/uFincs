import {actions} from "@storybook/addon-actions";
import {boolean, text} from "@storybook/addon-knobs";
import React from "react";
import StepNavigationButtons from "./StepNavigationButtons";

export default {
    title: "Molecules/Step Navigation Buttons",
    component: StepNavigationButtons
};

const buttonActions = actions("onNextStep", "onPreviousStep");

const loadingKnob = () => boolean("Loading", true);
const nextLabelKnob = () => text("Next Label", "Next");
const nextDisabledReasonKnob = () => text("Next Disabled Reason", "Transaction is invalid");
const nextStepKnob = () => boolean("Can Move to Next Step", false);

/** The default view of `StepNavigationButtons`. */
export const Default = () => (
    <StepNavigationButtons
        canMoveToNextStep={nextStepKnob()}
        nextDisabledReason={nextDisabledReasonKnob()}
        {...buttonActions}
    />
);

/** The loading view of `StepNavigationButtons`. */
export const Loading = () => (
    <StepNavigationButtons
        canMoveToNextStep={nextStepKnob()}
        loading={loadingKnob()}
        nextText={nextLabelKnob()}
        {...buttonActions}
    />
);
