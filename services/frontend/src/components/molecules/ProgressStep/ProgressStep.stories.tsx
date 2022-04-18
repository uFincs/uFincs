import {actions} from "@storybook/addon-actions";
import {boolean, number, text} from "@storybook/addon-knobs";
import React from "react";
import ProgressStep from "./ProgressStep";

export default {
    title: "Molecules/Progress Step",
    component: ProgressStep
};

const stepActions = actions("onClick");

const completedKnob = () => boolean("Is Completed", false);
const currentKnob = () => boolean("Is Current Step", false);
const labelKnob = () => text("Label", "Choose Account");
const stepKnob = () => number("Step", 1);

/** The default view of `ProgressStep`. */
export const Default = () => (
    <ProgressStep
        isCompleted={completedKnob()}
        isCurrentStep={currentKnob()}
        label={labelKnob()}
        step={stepKnob()}
        {...stepActions}
    />
);

/** The view of `ProgressStep` when it is an upcoming step (i.e. neither completed nor currentV. */
export const Upcoming = () => (
    <ProgressStep label={labelKnob()} step={stepKnob()} {...stepActions} />
);

/** The view of `ProgressStep` when it is the current step. */
export const Current = () => (
    <ProgressStep isCurrentStep={true} label={labelKnob()} step={stepKnob()} {...stepActions} />
);

/** The view of `ProgressStep` when it is a completed step. */
export const Completed = () => (
    <ProgressStep isCompleted={true} label={labelKnob()} step={stepKnob()} {...stepActions} />
);
