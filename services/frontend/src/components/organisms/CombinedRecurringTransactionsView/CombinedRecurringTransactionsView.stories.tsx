import type {Meta, StoryObj} from "@storybook/react";
import {PaginationProvider} from "hooks/";
import {
    smallViewport,
    storyData,
    storyUsingRedux,
    useCreateAccounts,
    useCreateRecurringTransactions
} from "utils/stories";
import CombinedRecurringTransactionsView from "./CombinedRecurringTransactionsView";

const meta: Meta<typeof CombinedRecurringTransactionsView> = {
    title: "Organisms/Combined Recurring Transactions View",
    component: CombinedRecurringTransactionsView
};

export default meta;
type Story = StoryObj<typeof CombinedRecurringTransactionsView>;

const {accounts, recurringTransactions} = storyData;

/** The default view of `CombinedRecurringTransactionsView`. */
export const Default: Story = {
    render: storyUsingRedux((args) => {
        useCreateAccounts(accounts);
        useCreateRecurringTransactions(recurringTransactions);

        return (
            <PaginationProvider totalItems={recurringTransactions.length}>
                <CombinedRecurringTransactionsView {...args} />
            </PaginationProvider>
        );
    })
};

/** The small view of `CombinedRecurringTransactionsView`. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    },
    render: storyUsingRedux((args) => {
        useCreateAccounts(accounts);
        useCreateRecurringTransactions(recurringTransactions);

        return (
            <PaginationProvider totalItems={recurringTransactions.length}>
                <CombinedRecurringTransactionsView {...args} />
            </PaginationProvider>
        );
    })
};
