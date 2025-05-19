import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as FeedbackDialog} from "./FeedbackDialog";

const meta: Meta<typeof FeedbackDialog> = {
    title: "Organisms/Feedback Dialog",
    component: FeedbackDialog,
    args: {
        isVisible: true
    }
};

export default meta;
type Story = StoryObj<typeof FeedbackDialog>;

/** The default view of `FeedbackDialog`. */
export const Default: Story = {
    args: {
        // isVisible is already defined in meta args
    }
};

/** The Unhandled Error view of the `FeedbackDialog`. */
export const UnhandledError: Story = {
    args: {
        isVisible: true,
        unhandledError: new Error("oops")
    }
};
