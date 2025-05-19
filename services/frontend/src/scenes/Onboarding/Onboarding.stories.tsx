import type {Meta, StoryObj} from "@storybook/react";
import Onboarding from "./Onboarding";

const meta: Meta<typeof Onboarding> = {
    title: "Scenes/Onboarding",
    component: Onboarding
};

export default meta;
type Story = StoryObj<typeof Onboarding>;

/** The default view of `Onboarding`. */
export const Default: Story = {
    args: {}
};
