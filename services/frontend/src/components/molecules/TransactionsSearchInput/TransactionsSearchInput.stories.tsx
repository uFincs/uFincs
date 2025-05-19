import type {Meta, StoryObj} from "@storybook/react";
import {TransactionsSearchProvider} from "hooks/";
import TransactionsSearchInput from "./TransactionsSearchInput";

const meta: Meta<typeof TransactionsSearchInput> = {
    title: "Molecules/Transactions Search Input",
    decorators: [
        (Story) => (
            <TransactionsSearchProvider>
                <Story />
            </TransactionsSearchProvider>
        )
    ],
    component: TransactionsSearchInput
};

export default meta;
type Story = StoryObj<typeof TransactionsSearchInput>;

/** The default view of `TransactionsSearchInput`. */
export const Default: Story = {};
