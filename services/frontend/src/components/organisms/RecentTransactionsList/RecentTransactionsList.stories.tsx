import type {Meta, StoryObj} from "@storybook/react";
import {storyData, storyUsingRedux, useCreateAccounts, useCreateTransactions} from "utils/stories";
import {PureComponent as RecentTransactionsList} from "./RecentTransactionsList";

const meta: Meta<typeof RecentTransactionsList> = {
    title: "Organisms/Recent Transactions List",
    component: RecentTransactionsList
};

export default meta;
type Story = StoryObj<typeof RecentTransactionsList>;

/** The default view of `RecentTransactionsList`. */
export const Default: Story = {
    render: storyUsingRedux(() => {
        const {accounts, transactions} = storyData;

        useCreateAccounts(accounts);
        useCreateTransactions(transactions);

        return <RecentTransactionsList transactions={transactions} />;
    })
};
