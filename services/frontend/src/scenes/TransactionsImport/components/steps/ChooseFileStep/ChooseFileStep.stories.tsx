import type {Meta, StoryObj} from "@storybook/react";
import ChooseFileStep from "./ChooseFileStep";

const meta: Meta<typeof ChooseFileStep> = {
    title: "Scenes/Transactions Import/Step/Choose File",
    component: ChooseFileStep
};

export default meta;
type Story = StoryObj<typeof ChooseFileStep>;

/** The default view of `ChooseFileStep`. */
export const Default: Story = {};
