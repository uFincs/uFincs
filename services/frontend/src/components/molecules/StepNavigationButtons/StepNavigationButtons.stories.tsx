import type {Meta, StoryObj} from "@storybook/react";
import StepNavigationButtons from "./StepNavigationButtons";

const meta: Meta<typeof StepNavigationButtons> = {
    title: "Molecules/Step Navigation Buttons",
    component: StepNavigationButtons,
    args: {
        canMoveToNextStep: false,
        nextDisabledReason: "Transaction is invalid",
        loading: true,
        nextText: "Next"
    }
};

export default meta;
type Story = StoryObj<typeof StepNavigationButtons>;

/** The default view of `StepNavigationButtons`. */
export const Default: Story = {
    args: {
        canMoveToNextStep: false,
        nextDisabledReason: "Transaction is invalid"
    }
};

/** The loading view of `StepNavigationButtons`. */
export const Loading: Story = {
    args: {
        canMoveToNextStep: false,
        loading: true,
        nextText: "Next"
    }
};
