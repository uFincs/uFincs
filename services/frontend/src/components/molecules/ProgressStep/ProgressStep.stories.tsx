import type {Meta, StoryObj} from "@storybook/react";
import ProgressStep from "./ProgressStep";

const meta: Meta<typeof ProgressStep> = {
    title: "Molecules/Progress Step",
    component: ProgressStep,
    args: {
        label: "Choose Account",
        step: 1
    }
};

export default meta;
type Story = StoryObj<typeof ProgressStep>;

/** The default view of `ProgressStep`. */
export const Default: Story = {
    args: {
        isCompleted: false,
        isCurrentStep: false
    }
};

/** The view of `ProgressStep` when it is an upcoming step (i.e. neither completed nor current). */
export const Upcoming: Story = {
    args: {
        isCompleted: false,
        isCurrentStep: false
    }
};

/** The view of `ProgressStep` when it is the current step. */
export const Current: Story = {
    args: {
        isCurrentStep: true
    }
};

/** The view of `ProgressStep` when it is a completed step. */
export const Completed: Story = {
    args: {
        isCompleted: true
    }
};
