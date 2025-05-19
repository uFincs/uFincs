import type {Meta, StoryObj} from "@storybook/react";
import CustomizeIncomeStep from "./CustomizeIncomeStep";

const meta: Meta<typeof CustomizeIncomeStep> = {
    title: "Scenes/Onboarding/Step/Customize Income",
    component: CustomizeIncomeStep
};

export default meta;
type Story = StoryObj<typeof CustomizeIncomeStep>;

/** The default view of `CustomizeIncomeStep`. */
export const Default: Story = {
    args: {}
};
