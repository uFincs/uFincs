import type {Meta, StoryObj} from "@storybook/react";
import CustomizeAssetsStep from "./CustomizeAssetsStep";

const meta: Meta<typeof CustomizeAssetsStep> = {
    title: "Scenes/Onboarding/Step/Customize Assets",
    component: CustomizeAssetsStep
};

export default meta;
type Story = StoryObj<typeof CustomizeAssetsStep>;

/** The default view of `CustomizeAssetsStep`. */
export const Default: Story = {};
