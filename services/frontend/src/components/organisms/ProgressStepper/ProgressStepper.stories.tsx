import {actions} from "@storybook/addon-actions";
import {number} from "@storybook/addon-knobs";
import React from "react";
import {StepNavigationButtons} from "components/molecules";
import ProgressStepper from "./ProgressStepper";

export default {
    title: "Organisms/Progress Stepper",
    component: ProgressStepper
};

const STEP_TITLES = [
    "Choose Account",
    "Choose CSV File",
    "Match CSV Columns",
    "Adjust Transactions",
    "Finish Import"
];

const stepperActions = actions("gotoStep");
const currentStepKnob = () => number("Current Step", 0);

/** The default view of `ProgressStepper`. */
export const Default = () => (
    <ProgressStepper
        currentStep={currentStepKnob()}
        steps={STEP_TITLES}
        {...stepperActions}
        StepNavigationButtons={StepNavigationButtons}
    />
);
