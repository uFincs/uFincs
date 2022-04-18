import {actions} from "@storybook/addon-actions";
import React from "react";
import {TransactionsSearchProvider} from "hooks/";
import {
    smallViewport,
    storyData,
    storyUsingRedux,
    useCreateAccounts,
    useCreateRecurringTransactions,
    useCreateTransactions
} from "utils/stories";
import TransactionForm, {PureComponent as PureTransactionForm} from "./TransactionForm";

export default {
    title: "Organisms/Transaction Form",
    component: PureTransactionForm
};

const formActions = actions("onClose", "onSubmit", "onSubmitRecurring", "onNewTransaction");

const useMakeFunctional = () => {
    useCreateAccounts(storyData.accounts);
    useCreateTransactions(storyData.transactions);
    useCreateRecurringTransactions(storyData.recurringTransactions);
};

/** The default view of the `TransactionForm`. */
export const Default = storyUsingRedux(() => {
    useMakeFunctional();

    return (
        <TransactionsSearchProvider>
            <PureTransactionForm
                accountsByType={storyData.accountsByType}
                isEditing={false}
                {...formActions}
            />
        </TransactionsSearchProvider>
    );
});

/** Small is the more realistic view of the `TransactionForm`, since the form only takes up
 *  limited horizontal screen space when displayed in a `Sidebar`. */
export const Small = storyUsingRedux(() => {
    useMakeFunctional();

    return (
        <TransactionsSearchProvider>
            <PureTransactionForm
                accountsByType={storyData.accountsByType}
                isEditing={false}
                {...formActions}
            />
        </TransactionsSearchProvider>
    );
});

Small.parameters = smallViewport;

/** The view of the `TransactionForm` when editing a transaction. */
export const Editing = storyUsingRedux(() => {
    useMakeFunctional();

    return (
        <TransactionsSearchProvider>
            <PureTransactionForm
                accountsByType={storyData.accountsByType}
                isEditing={true}
                transactionForEditing={storyData.transactions[0]}
                {...formActions}
            />
        </TransactionsSearchProvider>
    );
});

Editing.parameters = smallViewport;

/** The view of the `TransactionForm` when editing a recurring transaction. */
export const EditingRecurring = storyUsingRedux(() => {
    useMakeFunctional();

    return (
        <TransactionsSearchProvider>
            <PureTransactionForm
                accountsByType={storyData.accountsByType}
                isEditing={true}
                recurringTransactionForEditing={storyData.recurringTransactions[0]}
                {...formActions}
            />
        </TransactionsSearchProvider>
    );
});

EditingRecurring.parameters = smallViewport;

/** The view of the `TransactionForm` when editing an invalid transaction. */
export const InvalidEditingTransaction = storyUsingRedux(() => {
    useMakeFunctional();

    return (
        <TransactionsSearchProvider>
            <PureTransactionForm
                accountsByType={storyData.accountsByType}
                isEditing={true}
                {...formActions}
            />
        </TransactionsSearchProvider>
    );
});

InvalidEditingTransaction.parameters = smallViewport;

/** A story for testing that the connected `TransactionForm` is working. */
export const Connected = storyUsingRedux(() => {
    useMakeFunctional();

    return (
        <TransactionsSearchProvider>
            <TransactionForm {...formActions} />
        </TransactionsSearchProvider>
    );
});
