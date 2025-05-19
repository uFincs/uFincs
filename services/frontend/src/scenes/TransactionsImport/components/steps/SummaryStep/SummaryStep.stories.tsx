import type {Meta, StoryObj} from "@storybook/react";
import SummaryStep from "./SummaryStep";

const meta: Meta<typeof SummaryStep> = {
    title: "Scenes/Transactions Import/Step/Summary",
    component: SummaryStep
};

export default meta;
type Story = StoryObj<typeof SummaryStep>;

/** The default view of `SummaryStep`. */
export const Default: Story = {
    args: {}
};
