import {actions} from "@storybook/addon-actions";
import {number, select, text} from "@storybook/addon-knobs";
import React from "react";
import {SelectableListProvider} from "hooks/";
import {Transaction, TransactionType} from "models/";
import {
    smallViewport,
    storyData,
    storyUsingRedux,
    useCreateAccounts,
    useCreateTransactions
} from "utils/stories";
import TransactionsListItem, {
    PureComponent as PureTransactionsListItem
} from "./TransactionsListItem";

export default {
    title: "Molecules/Transactions List Item",
    component: PureTransactionsListItem
};

const itemActions = actions("onClick", "onDelete", "onEdit");

const amountKnob = () => number("Amount", 12345);
const descriptionKnob = () => text("Description", "Bought some food");
const typeKnob = () => select("Type", Transaction.TRANSACTION_TYPES, Transaction.INCOME);
const creditAccountKnob = () => text("Credit Account", "Cash");
const debitAccountKnob = () => text("Debit Account", "Food");

const transactionData = (type: TransactionType = typeKnob()) => ({
    id: "123",
    amount: amountKnob(),
    description: descriptionKnob(),
    type,
    creditAccountName: creditAccountKnob(),
    debitAccountName: debitAccountKnob()
});

/** The default view of a `TransactionsListItem` with all knobs. */
export const Default = () => <PureTransactionsListItem {...transactionData()} {...itemActions} />;

/** The more realistic view of a `TransactionsListItem`, since it's used on mobile. */
export const Small = () => <PureTransactionsListItem {...transactionData()} {...itemActions} />;

Small.parameters = smallViewport;

/** A `TransactionsListItem` with the income type. */
export const Income = () => (
    <PureTransactionsListItem {...transactionData(Transaction.INCOME)} {...itemActions} />
);

/** A `TransactionsListItem` with the expense type. */
export const Expense = () => (
    <PureTransactionsListItem {...transactionData(Transaction.EXPENSE)} {...itemActions} />
);

/** A `TransactionsListItem` with the debt type. */
export const Debt = () => (
    <PureTransactionsListItem {...transactionData(Transaction.DEBT)} {...itemActions} />
);

/** A `TransactionsListItem` with the transfer type. */
export const Transfer = () => (
    <PureTransactionsListItem {...transactionData(Transaction.TRANSFER)} {...itemActions} />
);

/** The `TransactionsListItem` with no actions (i.e. a 'read-only' list item). */
export const NoActions = () => (
    <PureTransactionsListItem {...transactionData()} actionsToShow={[]} {...itemActions} />
);

/** The disabled view of a `TransactionsListItem`. */
export const Disabled = () => (
    <PureTransactionsListItem {...transactionData()} disabled={true} {...itemActions} />
);

/** The 'error' view of a `TransactionsListItem`. */
export const HasError = () => (
    <PureTransactionsListItem {...transactionData()} hasError={true} {...itemActions} />
);

/** The selectable view of a `TransactionsListItem`. */
export const Selectable = () => (
    <SelectableListProvider>
        <PureTransactionsListItem {...transactionData()} {...itemActions} />
    </SelectableListProvider>
);

/** The importable view of a `TransactionsListItem`.
 *
 *  The target account name should be displayed differently than a regular account name. */
export const Importable = () => (
    <PureTransactionsListItem
        {...transactionData()}
        debitAccountName=""
        placeholderDebitAccountName="CANADA"
        {...itemActions}
    />
);

/** An example of a 'virtual' `TransactionsListItem`.
 *
 *  It should have the date italicized and de-emphasized, to show how this isn't a 'real' transaction. */
export const Virtual = () => (
    <PureTransactionsListItem {...transactionData()} isVirtualTransaction={true} {...itemActions} />
);

/** An example of a 'future' `TransactionsListItem`.
 *
 *  It should have a pink accent bar on the left side to indicate that it is a 'future' transaction. */
export const Future = () => (
    <PureTransactionsListItem {...transactionData()} isFutureTransaction={true} {...itemActions} />
);

/** A story that tests that the connected component is working as intended. */
export const Connected = storyUsingRedux(() => {
    useCreateAccounts(storyData.accounts);
    useCreateTransactions(storyData.transactions);

    return <TransactionsListItem id="3" />;
});
