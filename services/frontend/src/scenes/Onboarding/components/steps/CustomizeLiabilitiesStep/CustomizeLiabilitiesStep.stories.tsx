import type {Meta, StoryObj} from "@storybook/react";
import CustomizeLiabilitiesStep from "./CustomizeLiabilitiesStep";

const meta: Meta<typeof CustomizeLiabilitiesStep> = {
    title: "Scenes/Onboarding/Step/Customize Liabilities",
    component: CustomizeLiabilitiesStep
};

export default meta;
type Story = StoryObj<typeof CustomizeLiabilitiesStep>;

/** The default view of `CustomizeLiabilitiesStep`. */
export const Default: Story = {
    args: {}
};
