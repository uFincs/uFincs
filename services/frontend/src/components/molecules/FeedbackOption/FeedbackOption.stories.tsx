import {actions} from "@storybook/addon-actions";
import {select} from "@storybook/addon-knobs";
import React from "react";
import {Feedback} from "models/";
import FeedbackOption from "./FeedbackOption";

export default {
    title: "Molecules/Feedback Option",
    component: FeedbackOption,
    parameters: {
        backgrounds: {
            default: "Light"
        }
    }
};

const optionActions = actions("onSelected");
const typeKnob = () => select("Type", Feedback.FEEDBACK_TYPES, Feedback.ISSUE);

/** The default view of `FeedbackOption`. */
export const Default = () => <FeedbackOption type={typeKnob()} {...optionActions} />;
