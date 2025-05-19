import type {Meta, StoryObj} from "@storybook/react";
import {PaginationProvider} from "hooks/";
import {
    smallViewport,
    storyData,
    storyUsingRedux,
    useCreateAccounts,
    useCreateTransactions
} from "utils/stories";
import CombinedTransactionsView from "./CombinedTransactionsView";

const meta: Meta<typeof CombinedTransactionsView> = {
    title: "Organisms/Combined Transactions View",
    component: CombinedTransactionsView
};

export default meta;
type Story = StoryObj<typeof CombinedTransactionsView>;

const {accounts, transactions} = storyData;

/** The large view of `CombinedTransactionsView`. */
export const Large: Story = {
    render: storyUsingRedux((args) => {
        useCreateAccounts(accounts);
        useCreateTransactions(transactions);

        return (
            <PaginationProvider totalItems={transactions.length}>
                <CombinedTransactionsView {...args} transactions={transactions} />
            </PaginationProvider>
        );
    })
};

/** The small view of `CombinedTransactionsView`. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    },
    render: storyUsingRedux((args) => {
        useCreateAccounts(accounts);
        useCreateTransactions(transactions);

        return (
            <PaginationProvider totalItems={transactions.length}>
                <CombinedTransactionsView {...args} transactions={transactions} />
            </PaginationProvider>
        );
    })
};
