import React from "react";
import {PaginationProvider} from "hooks/";
import {
    smallViewport,
    storyData,
    storyUsingRedux,
    useCreateAccounts,
    useCreateTransactions
} from "utils/stories";
import CombinedTransactionsView from "./CombinedTransactionsView";

export default {
    title: "Organisms/Combined Transactions View",
    component: CombinedTransactionsView
};

const {accounts, transactions} = storyData;

/** The large view of `CombinedTransactionsView`. */
export const Large = storyUsingRedux(() => {
    useCreateAccounts(accounts);
    useCreateTransactions(transactions);

    return (
        <PaginationProvider totalItems={transactions.length}>
            <CombinedTransactionsView transactions={transactions} />
        </PaginationProvider>
    );
});

/** The small view of `CombinedTransactionsView`. */
export const Small = storyUsingRedux(() => {
    useCreateAccounts(accounts);
    useCreateTransactions(transactions);

    return (
        <PaginationProvider totalItems={transactions.length}>
            <CombinedTransactionsView transactions={transactions} />
        </PaginationProvider>
    );
});

Small.parameters = smallViewport;
