import {actions} from "@storybook/addon-actions";
import {select} from "@storybook/addon-knobs";
import React from "react";
import {Feedback} from "models/";
import {PureComponent as FeedbackForm} from "./FeedbackForm";

export default {
    title: "Molecules/Feedback Form",
    component: FeedbackForm,
    parameters: {
        backgrounds: {
            default: "Light"
        }
    }
};

const formActions = actions("onSubmit");
const typeKnob = () => select("Type", Feedback.FEEDBACK_TYPES, Feedback.ISSUE);

/** The default view of `FeedbackForm`. */
export const Default = () => <FeedbackForm feedbackType={typeKnob()} {...formActions} />;

/** The `FeedbackForm` with an unhandled error to submit. */
export const UnhandledError = () => (
    <FeedbackForm feedbackType={typeKnob()} unhandledError={new Error("oops")} {...formActions} />
);
