import {createMatchSelector, push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {Account, AccountType, RecurringTransaction, Transaction} from "models/";
import {
    crossSliceSelectors,
    recurringTransactionsRequestsSlice,
    transactionsRequestsSlice,
    State
} from "store/";
import {takeOwnPropIfDefined} from "utils/helperFunctions";
import {DerivedAppModalUrls} from "values/screenUrls";
import {DateOption} from "values/transactionForm";

interface StateProps {
    /** The map of all accounts by their type. Used for the Account option inputs. */
    accountsByType: Record<AccountType, Array<Account>>;

    /** Whether or not the form should be editing or creating a transaction.
     *  Need this flag separate from transactionForEditing to handle the case where the user
     *  tries to edit a transaction that doesn't exist (i.e. the ID in the url is wrong). */
    isEditing: boolean;

    /** The recurring transaction that is being edited. */
    recurringTransactionForEditing?: RecurringTransaction;

    /** The transaction that is being edited. */
    transactionForEditing?: Transaction;
}

interface IntermediateDispatchProps {
    /** Callback for the editing mode fallback to redirect to the creation form. */
    onNewTransaction: () => void;

    /** [intermediate] Callback to submit the form.
     *  `isEditing` is a flag to specify either updating or creating on submission. */
    onSubmit: (transaction: Transaction, isEditing: boolean) => void;

    /** [intermediate] Callback to submit the form for a recurring transaction.
     *  `isEditing` is a flag to specify either updating or creating on submission. */
    onSubmitRecurring?: (transaction: RecurringTransaction, isEditing: boolean) => void;
}

interface DispatchProps extends IntermediateDispatchProps {
    /** Callback to submit the form. */
    onSubmit: (transaction: Transaction) => void;

    /** Callback to submit the form for a recurring transaction. */
    onSubmitRecurring?: (recurringTransaction: RecurringTransaction) => void;
}

// Because we're using mergeProps, we need to explicitly specify and pass through OwnProps
// here instead of in TransactionFormProps.
interface OwnProps {
    /** Custom class name. */
    className?: string;

    /** Specifies which date options the form supports. That is, one-off, recurring, or both.
     *
     *  The standard `TransactionForm` (used for creating transactions) supports both.
     *
     *  When editing a transaction, the form will only use one of the options, depending on the type
     *  of transaction being edited.
     *
     *  Finally, when editing transactions during the import process, only one-off will be used,
     *  since the import process never deals with recurring transactions. */
    dateOptions?: Array<DateOption>;

    /** [used during transactions import process]
     *
     *  The asset/liability account that the transaction is being imported to.
     *  Used to filter the account options for non-Transfer type transactions so that
     *  the user can't pick a different asset/liability account for the transaction.
     *
     *  Unfortunately, for Transfer type transactions, since users can transfer between
     *  assets and liabilities, we can't filter them such that they only contain the
     *  account being imported to.
     *
     *  As such, technically users will be able to import a Transfer type transaction
     *  to an account that is different than the on they chose during the first step
     *  of the import process, but meh, that's fine. It still works. */
    importAccount?: Account;

    /** Placeholder value for the 'target' account.
     *
     *  The 'target' account is a concept used by `ImportableTransaction`, to specify
     *  during the import process which account is being 'targeted' (i.e which account
     *  isn't the account being imported to). */
    targetAccountPlaceholder?: string;

    /** Callback to close the form. */
    onClose: () => void;
}

export interface ConnectedProps extends StateProps, DispatchProps, OwnProps {}

const mapStateToProps = (): ((state: State) => StateProps) => {
    const transactionMatchSelector = createMatchSelector<any, {id: string}>(
        DerivedAppModalUrls.TRANSACTION_FORM_EDITING
    );

    const recurringTransactionMatchSelector = createMatchSelector<any, {id: string}>(
        DerivedAppModalUrls.RECURRING_TRANSACTION_FORM_EDITING
    );

    return (state: State) => {
        const transactionMatch = transactionMatchSelector(state);
        const recurringTransactionMatch = recurringTransactionMatchSelector(state);

        const transactions = crossSliceSelectors.transactions.selectRawTransactionsById(state);

        const recurringTransactions =
            crossSliceSelectors.recurringTransactions.selectRecurringTransactionsById(state);

        const transactionId = transactionMatch?.params?.id;
        const recurringTransactionId = recurringTransactionMatch?.params?.id;

        const transactionForEditing = transactionId ? transactions?.[transactionId] : undefined;

        const recurringTransactionForEditing = recurringTransactionId
            ? recurringTransactions?.[recurringTransactionId]
            : undefined;

        return {
            accountsByType: crossSliceSelectors.accounts.selectAccountsByType(state),
            isEditing: !!(transactionId || recurringTransactionId),
            recurringTransactionForEditing,
            transactionForEditing
        };
    };
};

const mapDispatchToProps = (dispatch: Dispatch): IntermediateDispatchProps => ({
    onNewTransaction: () => dispatch(push(DerivedAppModalUrls.TRANSACTION_FORM)),
    onSubmit: (transaction: Transaction, isEditing: boolean) => {
        transaction.convertAmountToCents();

        if (isEditing) {
            dispatch(transactionsRequestsSlice.update.actions.request(transaction));
        } else {
            dispatch(transactionsRequestsSlice.create.actions.request(transaction));
        }
    },
    onSubmitRecurring: (recurringTransaction: RecurringTransaction, isEditing: boolean) => {
        recurringTransaction.convertAmountToCents();

        if (isEditing) {
            dispatch(
                recurringTransactionsRequestsSlice.update.actions.request(recurringTransaction)
            );
        } else {
            dispatch(
                recurringTransactionsRequestsSlice.create.actions.request(recurringTransaction)
            );
        }
    }
});

const mergeProps = (
    stateProps: StateProps,
    dispatchProps: IntermediateDispatchProps,
    ownProps: OwnProps
): ConnectedProps => {
    const {onSubmit, onSubmitRecurring, ...otherDispatchProps} = dispatchProps;
    let {dateOptions, ...otherOwnProps} = ownProps;

    const finalOnSubmit = (transaction: Transaction) => {
        onSubmit(transaction, stateProps.isEditing);
    };

    const finalOnSubmitRecurring = (recurringTransaction: RecurringTransaction) => {
        onSubmitRecurring?.(recurringTransaction, stateProps.isEditing);
    };

    dateOptions = takeOwnPropIfDefined(
        dateOptions,
        stateProps.transactionForEditing
            ? [DateOption.oneOff]
            : stateProps.recurringTransactionForEditing
              ? [DateOption.recurring]
              : [DateOption.oneOff, DateOption.recurring]
    );

    return {
        ...stateProps,
        ...otherDispatchProps,
        ...otherOwnProps,
        dateOptions,
        onSubmit: finalOnSubmit,
        onSubmitRecurring: finalOnSubmitRecurring
    };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps);
