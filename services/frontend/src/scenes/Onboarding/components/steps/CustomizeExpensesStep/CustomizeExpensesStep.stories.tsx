import type {Meta, StoryObj} from "@storybook/react";
import CustomizeExpensesStep from "./CustomizeExpensesStep";

const meta: Meta<typeof CustomizeExpensesStep> = {
    title: "Scenes/Onboarding/Step/Customize Expenses",
    component: CustomizeExpensesStep
};

export default meta;
type Story = StoryObj<typeof CustomizeExpensesStep>;

/** The default view of `CustomizeExpensesStep`. */
export const Default: Story = {
    args: {}
};
