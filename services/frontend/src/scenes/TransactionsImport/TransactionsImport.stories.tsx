import type {Meta, StoryObj} from "@storybook/react";
import {storyUsingRedux, storyData, useCreateAccounts} from "utils/stories";
import TransactionsImport from "./TransactionsImport";

const meta: Meta<typeof TransactionsImport> = {
    title: "Scenes/Transactions Import/All Steps",
    component: TransactionsImport
};

export default meta;
type Story = StoryObj<typeof TransactionsImport>;

/** The connected view of `TransactionsImport`. */
export const Connected: Story = {
    args: {},
    parameters: {},
    render: storyUsingRedux(() => {
        useCreateAccounts(storyData.accounts);

        return <TransactionsImport />;
    })
};
