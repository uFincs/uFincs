import React from "react";
import {PaginationProvider} from "hooks/";
import {
    smallViewport,
    storyData,
    storyUsingRedux,
    useCreateAccounts,
    useCreateRecurringTransactions
} from "utils/stories";
import CombinedRecurringTransactionsView from "./CombinedRecurringTransactionsView";

export default {
    title: "Organisms/Combined Recurring Transactions View",
    component: CombinedRecurringTransactionsView
};

const {accounts, recurringTransactions} = storyData;

/** The default view of `CombinedRecurringTransactionsView`. */
export const Default = storyUsingRedux(() => {
    useCreateAccounts(accounts);
    useCreateRecurringTransactions(recurringTransactions);

    return (
        <PaginationProvider totalItems={recurringTransactions.length}>
            <CombinedRecurringTransactionsView />
        </PaginationProvider>
    );
});

/** The small view of `CombinedRecurringTransactionsView`. */
export const Small = storyUsingRedux(() => {
    useCreateAccounts(accounts);
    useCreateRecurringTransactions(recurringTransactions);

    return (
        <PaginationProvider totalItems={recurringTransactions.length}>
            <CombinedRecurringTransactionsView />
        </PaginationProvider>
    );
});

Small.parameters = smallViewport;
