import {actions} from "@storybook/addon-actions";
import React from "react";
import FeedbackOptions from "./FeedbackOptions";

export default {
    title: "Molecules/Feedback Options",
    component: FeedbackOptions,
    parameters: {
        backgrounds: {
            default: "Light"
        }
    }
};

const optionActions = actions("onTypeSelected");

/** The default view of `FeedbackOptions`. */
export const Default = () => <FeedbackOptions {...optionActions} />;
