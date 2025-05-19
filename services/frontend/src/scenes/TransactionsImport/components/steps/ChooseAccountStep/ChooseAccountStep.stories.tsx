import type {Meta, StoryObj} from "@storybook/react";
import ChooseAccountStep from "./ChooseAccountStep";

const meta: Meta<typeof ChooseAccountStep> = {
    title: "Scenes/Transactions Import/Step/Choose Account",
    component: ChooseAccountStep
};

export default meta;
type Story = StoryObj<typeof ChooseAccountStep>;

/** The default view of `ChooseAccountStep`. */
export const Default: Story = {};
