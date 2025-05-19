import type {Meta, StoryObj} from "@storybook/react";
import {Feedback} from "models/";
import {PureComponent as FeedbackForm} from "./FeedbackForm";

const meta: Meta<typeof FeedbackForm> = {
    title: "Molecules/Feedback Form",
    component: FeedbackForm,
    parameters: {
        backgrounds: {
            default: "Light"
        }
    },
    args: {
        feedbackType: Feedback.ISSUE,
        unhandledError: undefined
    }
};

export default meta;
type Story = StoryObj<typeof FeedbackForm>;

/** The default view of `FeedbackForm`. */
export const Default: Story = {};

/** The `FeedbackForm` with an unhandled error to submit. */
export const UnhandledError: Story = {
    args: {
        unhandledError: new Error("oops")
    }
};
