import {actions} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import FeedbackOptions from "./FeedbackOptions";

const meta: Meta<typeof FeedbackOptions> = {
    title: "Molecules/Feedback Options",
    component: FeedbackOptions,
    parameters: {
        backgrounds: {
            default: "Light"
        }
    }
};

export default meta;
type Story = StoryObj<typeof FeedbackOptions>;

const optionActions = actions("onTypeSelected");

/** The default view of `FeedbackOptions`. */
export const Default: Story = {
    args: {
        ...optionActions
    }
};
