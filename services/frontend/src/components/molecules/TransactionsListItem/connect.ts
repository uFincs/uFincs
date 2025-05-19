import {push} from "connected-react-router";
import {createCachedSelector} from "re-reselect";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {ListItemProps} from "components/molecules/ListItem";
import {ImportableTransaction, Transaction, TransactionType} from "models/";
import {
    crossSliceSelectors,
    transactionsSlice,
    State,
    TransactionSelector,
    transactionsImportSlice
} from "store/";
import {ListItemActions} from "utils/componentTypes";
import {takeOwnPropIfDefined} from "utils/helperFunctions";
import {Cents, Id} from "utils/types";
import {DerivedAppModalUrls} from "values/screenUrls";

interface StateProps {
    /** The raw amount of the transaction, in cents. */
    amount: Cents | undefined;

    /** The date of the transaction, as a timestamp string. */
    date?: string | undefined;

    /** The description of the transaction. */
    description: string | undefined;

    /** Whether or not this row is 'disabled'.
     *
     *  In practice, this 'disabled' state is really used to indicate the 'excluded from import' state
     *  that is necessary while editing transactions during the import process. */
    disabled?: boolean;

    /** Whether or not a red outline should be shown around the transaction to indicate that it
     *  is invalid/has an error/has a problem of some sort.
     *
     *  The current use case for this is to mark a transaction as invalid during the import process. */
    hasError?: boolean;

    /** Whether or not this is a 'future' transaction, aka a transaction with a date in the future.
     *
     *  This is used to visually differentiate these transactions from regular transactions. */
    isFutureTransaction?: boolean;

    /** Whether or not this is a 'virtual' transaction, aka a future transaction that is derived
     *  from a recurring transaction.
     *
     *  This is used to visually differentiate these transactions from regular transactions. */
    isVirtualTransaction?: boolean;

    /** The type of the transaction. */
    type: TransactionType | undefined;

    /** The name of the credit account for the transaction. */
    creditAccountName: string | undefined;

    /** The name of the debit account for the transaction. */
    debitAccountName: string | undefined;

    /** A placeholder for the credit account name. What makes it a placeholder is that it is just a name;
     *  it doesn't necessarily have to correspond to an actual uFincs account.
     *
     *  This can be used for the 'target account' during the import process, where the name is taken from
     *  the file that the user is importing from.
     *  See `ImportableTransaction.ts` for more details. */
    placeholderCreditAccountName?: string;

    /** A placeholder for the debit account name. What makes it a placeholder is that it is just a name;
     *  it doesn't necessarily have to correspond to an actual uFincs account.
     *
     *  This can be used for the 'target account' during the import process, where the name is taken from
     *  the file that the user is importing from.
     *  See `ImportableTransaction.ts` for more details. */
    placeholderDebitAccountName?: string;
}

interface DispatchProps {
    /** Handler for clicking the item itself (for viewing the transaction). */
    onClick: () => void;

    /** Handler for clicking on the `Delete` action. */
    onDelete: () => void;

    /** Handler for clicking on the `Edit` action. */
    onEdit: () => void;
}

interface IntermediateOwnProps
    extends Omit<ListItemProps, "children" | "onClick" | "onDelete" | "onEdit"> {
    /** The actions to show. Useful for hiding delete/edit during the import process. */
    actionsToShow?: ListItemActions;

    /** The ID of the Transaction to connect to. */
    id: Id;

    /** Whether or not the transaction is supposed to represent a RecurringTransaction.
     *
     *  Currently only used to display extra information in the "Delete" action tooltip. */
    isRecurringTransaction?: boolean;

    /** [intermediate] A custom selector for picking the transaction information out of the store.
     *
     *  Useful when using the `TransactionsList` with a non-standard transactions store
     *  (e.g. the transactions import slice). */
    transactionSelector?: TransactionSelector;

    /** Handler for clicking on the `Delete` action.
     *
     *  Used for overriding the default connected handler (e.g. when using the Transactions list
     *  with a different slice of transactions). */
    customOnDelete?: () => void;

    /** Handler for clicking on the `Edit` action.
     *
     *  Used for overriding the default connected handler (e.g. when using the Transactions list
     *  with a different slice of transactions). */
    customOnEdit?: () => void;
}

// Discard the transactionSelector, so that it doesn't get passed to the component.
// The reason to do this is so that it doesn't get picked up under 'otherProps' and
// subsequently passed down until it hits a DOM element that it shouldn't be on.
interface OwnProps extends Omit<IntermediateOwnProps, "transactionSelector"> {}

export interface ConnectedProps extends StateProps, DispatchProps, OwnProps {}

const mapStateToProps = (
    _: State,
    ownProps: IntermediateOwnProps
): ((state: State) => StateProps) => {
    const {id} = ownProps;

    const selectTransaction = takeOwnPropIfDefined(
        ownProps.transactionSelector,
        crossSliceSelectors.transactions.selectTransaction
    )(id);

    return (state: State): StateProps => {
        // TECH DEBT: It's kinda jank how we just directly reference the import state here,
        // even though this component is supposed to be as generic as possible.
        //
        // However, since the only (current) use case for `hasError` is in the import process,
        // and because there shouldn't any significant performance hit to including this calculation
        // when not in the import process, I think this is the easiest way to introduce this
        // functionality without having to pass a bunch of props down through the various
        // layers of the list/table.
        const hasError =
            transactionsImportSlice.selectors.selectMarkInvalidTransactions(state) &&
            id === transactionsImportSlice.selectors.selectInvalidTransactionId(state);

        return {
            ...selectStateProps(selectTransaction(state)),
            hasError
        };
    };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps): DispatchProps => {
    const onDelete = takeOwnPropIfDefined(ownProps.customOnDelete, () =>
        dispatch(transactionsSlice.actions.undoableDestroyTransaction(ownProps.id))
    );

    const onEdit = takeOwnPropIfDefined(ownProps.customOnEdit, () =>
        dispatch(push(`${DerivedAppModalUrls.TRANSACTION_FORM}/${ownProps.id}`))
    );

    return {
        onClick: onEdit,
        onDelete,
        onEdit
    };
};

const mergeProps = (
    stateProps: StateProps,
    dispatchProps: DispatchProps,
    ownProps: IntermediateOwnProps
): ConnectedProps => {
    // Remove the transactionSelector from the OwnProps so that it doesn't get passed in
    // and treated as an 'otherProp' (which'll throw an error since it gets passed down
    // to a DOM element).
    const {transactionSelector: _transactionSelector, ...otherOwnProps} = ownProps;

    return {
        ...stateProps,
        ...dispatchProps,
        ...otherOwnProps
    };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps);

/* Custom Selectors */

const selectStateProps = createCachedSelector(
    [(transaction: Transaction) => transaction],
    (transaction: Transaction | undefined): StateProps => {
        if (!transaction) {
            return {
                amount: undefined,
                date: undefined,
                description: undefined,
                isFutureTransaction: false,
                isVirtualTransaction: false,
                type: undefined,
                creditAccountName: undefined,
                debitAccountName: undefined,
                placeholderCreditAccountName: undefined,
                placeholderDebitAccountName: undefined
            };
        }

        const amount = transaction.amount;
        const type = transaction.type;

        const targetAccountName = (transaction as ImportableTransaction).targetAccount;
        const {targetAccount} = ImportableTransaction.determineTargetTransactionSides(type);

        const placeholderCreditAccountName =
            targetAccount === "credit" ? targetAccountName : undefined;

        const placeholderDebitAccountName =
            targetAccount === "debit" ? targetAccountName : undefined;

        const disabled =
            transaction && "includeInImport" in transaction
                ? !(transaction as ImportableTransaction)?.includeInImport
                : false;

        const isFutureTransaction = Transaction.isFutureTransaction(transaction);
        const isVirtualTransaction = Transaction.isVirtualTransaction(transaction);

        return {
            amount: typeof amount === "number" ? amount : parseFloat(amount),
            date: transaction.date,
            description: transaction.description,
            disabled,
            isFutureTransaction,
            isVirtualTransaction,
            type: transaction.type,
            creditAccountName: transaction.creditAccount?.name,
            debitAccountName: transaction.debitAccount?.name,
            placeholderCreditAccountName,
            placeholderDebitAccountName
        };
    }
)((transaction) => `${transaction?.id}`);
