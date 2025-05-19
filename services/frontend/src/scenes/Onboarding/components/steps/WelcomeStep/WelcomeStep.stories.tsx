import type {Meta, StoryObj} from "@storybook/react";
import WelcomeStep from "./WelcomeStep";

const meta: Meta<typeof WelcomeStep> = {
    title: "Scenes/Onboarding/Step/Welcome",
    component: WelcomeStep
};

export default meta;
type Story = StoryObj<typeof WelcomeStep>;

/** The default view of `WelcomeStep`. */
export const Default: Story = {
    args: {}
};
