import {AccountData, ImportRule, TransactionData} from "models/";
import {TransactionSelector, TransactionsSelector} from "store/types";
import {Cents, Id} from "utils/types";

export type ListItemActions = Array<"edit" | "delete">;
export const DefaultListItemActions: ListItemActions = ["edit", "delete"];

// This separate types file exists because we needed to be able import from models without
// creating a circular dependency. If we put these types in `utils/types`, that would create
// circular dependencies (since some models depend on it).

// These are the props that are shared between `TransactionsList`, `TransactionsTable`, and
// `CombinedTransactionsView`. The list and table are each individually referred to as 'transaction views',
// hence the name of this interface.
export interface TransactionViewProps {
    /** Custom class name. */
    className?: string;

    /** Just the test ID for e2e testing that can be passed in. */
    "data-testid"?: string;

    /** The (optional) account that is used for calculating the running balances.
     *  If running balances are to be used, the account _must_ be provided. */
    account?: AccountData;

    /** The (optional) starting balance use for calculating the running balances.
     *  The starting balance should be the balance at the end of the day before the first day
     *  in the current date range (i.e. if the start of the date range is July 1st, then the
     *  starting balance should be the account's balance at the end of June 30th). */
    accountStartingBalance?: Cents;

    /** The actions to show. Useful for hiding delete/edit during the import process. */
    actionsToShow?: ListItemActions;

    /** Whether or not the transactions being displayed are recurring transactions.
     *  Currently, this is only relevant for the `TransactionsTable` to change the `Date` column
     *  label to `Start Date`. */
    isRecurringTransactions?: boolean;

    /** The transactions to display. */
    transactions: Array<TransactionData>;

    /** A custom selector for picking the transaction information out of the store. */
    transactionSelector?: TransactionSelector;

    /** A custom selector for picking the 'transactionsById' information out of the store. */
    transactionsSelector?: TransactionsSelector;

    /** Custom handler for the 'Delete' action of the `TransactionsTableRow`. */
    onDeleteTransaction?: (id: Id) => void;

    /** Custom handler for the 'Edit' action of the `TransactionsTableRow`. */
    onEditTransaction?: (id: Id) => void;
}

export interface ImportRulesViewProps {
    /** Custom class name. */
    className?: string;

    /** The actions to show. Useful for hiding delete/edit during the import process. */
    actionsToShow?: ListItemActions;

    /** The list of import rules to display. */
    importRules: Array<ImportRule>;
}
