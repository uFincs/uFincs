import {actions} from "@storybook/addon-actions";
import {number, select, text} from "@storybook/addon-knobs";
import React from "react";
import {SelectableListProvider} from "hooks/";
import {Transaction} from "models/";
import TransactionsTableRow, {
    PureComponent as PureTransactionsTableRow
} from "./TransactionsTableRow";

export default {
    title: "Molecules/Transactions Table Row",
    component: TransactionsTableRow
};

const transactionData = () => ({
    id: "123",
    amount: number("Amount", 12345),
    date: text("Date", "2020-07-11"),
    description: text("Description", "Bought a whole metric ton of food."),
    type: select("Type", Transaction.TRANSACTION_TYPES, Transaction.EXPENSE),
    creditAccountName: text("From", "Cash"),
    debitAccountName: text("To", "Food")
});

const runningBalanceKnob = () => number("Running Balance", 67890);

const rowActions = actions("onClick", "onEdit", "onDelete");

/** The compressed (default) view of the `TransactionsTableRow  where the From and To accounts
 *  are compressed into one column underneath Description. */
export const Compressed = () => <PureTransactionsTableRow {...transactionData()} {...rowActions} />;

/** The compressed view of the `TransactionsTableRow` with the running balance enabled. */
export const CompressedWithRunningBalance = () => (
    // This uses `TransactionsTable--running-balance` class to force the running balance view.
    // Also, need to force 100% width on the container for story purposes, so that it looks nice.
    <div className="TransactionsTable--running-balance" style={{width: "100%"}}>
        <PureTransactionsTableRow
            runningBalance={runningBalanceKnob()}
            {...transactionData()}
            {...rowActions}
        />
    </div>
);

/** The full view of the `TransactionsTableRow` where each piece of data gets its own column, */
export const Full = () => (
    // This uses the `TransactionsTable--full` class to force the full view.
    <div className="TransactionsTable--full" style={{width: "100%"}}>
        <PureTransactionsTableRow {...transactionData()} {...rowActions} />
    </div>
);

/** The full view of the `TransactionsTableRow` with the running balance enabled. */
export const FullWithRunningBalance = () => (
    <div
        className="TransactionsTable--full TransactionsTable--running-balance"
        style={{width: "100%"}}
    >
        <PureTransactionsTableRow
            runningBalance={runningBalanceKnob()}
            {...transactionData()}
            {...rowActions}
        />
    </div>
);

/** The disabled view of the `TransactionsTableRow`. */
export const Disabled = () => (
    <div className="TransactionsTable--full" style={{width: "100%"}}>
        <PureTransactionsTableRow {...transactionData()} disabled={true} {...rowActions} />
    </div>
);

/** The 'error' view of the `TransactionsTableRow`. */
export const HasError = () => (
    <div className="TransactionsTable--full" style={{width: "100%"}}>
        <PureTransactionsTableRow {...transactionData()} hasError={true} {...rowActions} />
    </div>
);

/** Enabling the selectable view of the `TransactionsTableRow`. */
export const Selectable = () => (
    <SelectableListProvider>
        <div className="TransactionsTable--full" style={{width: "100%"}}>
            <PureTransactionsTableRow {...transactionData()} {...rowActions} />
        </div>
    </SelectableListProvider>
);

/** An example of an 'importable' `TransactionsTableRow`.
 *
 *  The target account name should be displayed differently than a regular account name. */
export const Importable = () => (
    <div className="TransactionsTable--full" style={{width: "100%"}}>
        <PureTransactionsTableRow
            {...transactionData()}
            debitAccountName=""
            placeholderDebitAccountName="CANADA"
            {...rowActions}
        />
    </div>
);

/** An example of a 'recurring' `TransactionsTableRow`.
 *
 *  The only change should be that the Delete action has a different tooltip, emphasizing how deleting
 *  a recurring transaction won't delete its realized transactions. */
export const Recurring = () => (
    <div className="TransactionsTable--full" style={{width: "100%"}}>
        <PureTransactionsTableRow
            {...transactionData()}
            isRecurringTransaction={true}
            {...rowActions}
        />
    </div>
);

/** An example of a 'virtual' `TransactionsTableRow` (i.e. a future transaction that was derived from
 *  a recurring transaction).
 *
 *  It should have the date italicized and de-emphasized, to show how this isn't a 'real' transaction. */
export const Virtual = () => (
    <div className="TransactionsTable--full" style={{width: "100%"}}>
        <PureTransactionsTableRow
            {...transactionData()}
            isVirtualTransaction={true}
            {...rowActions}
        />
    </div>
);

/** An example of a 'future' `TransactionsTableRow` (i.e. a transaction that happens in the future).
 *
 *  It should have a pink accent bar on the left side to indicate that it is a 'future' transaction. */
export const Future = () => (
    <div className="TransactionsTable--full" style={{width: "100%"}}>
        <PureTransactionsTableRow
            {...transactionData()}
            isFutureTransaction={true}
            {...rowActions}
        />
    </div>
);
