import type {Meta, StoryObj} from "@storybook/react";
import AdjustTransactionsStep from "./AdjustTransactionsStep";

const meta: Meta<typeof AdjustTransactionsStep> = {
    title: "Scenes/Transactions Import/Step/Adjust Transactions",
    component: AdjustTransactionsStep
};

export default meta;
type Story = StoryObj<typeof AdjustTransactionsStep>;

/** The default view of `AdjustTransactionsStep`. */
export const Default: Story = {
    args: {}
};
