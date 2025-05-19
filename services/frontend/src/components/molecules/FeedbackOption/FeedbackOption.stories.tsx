import type {Meta, StoryObj} from "@storybook/react";
import {Feedback} from "models";
import FeedbackOption from "./FeedbackOption";

const meta: Meta<typeof FeedbackOption> = {
    title: "Molecules/Feedback Option",
    component: FeedbackOption,
    parameters: {
        backgrounds: {
            default: "Light"
        }
    },
    args: {
        type: Feedback.ISSUE
    }
};

export default meta;
type Story = StoryObj<typeof FeedbackOption>;

/** The default view of `FeedbackOption`. */
export const Default: Story = {};
