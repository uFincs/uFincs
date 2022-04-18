import {push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {TransactionData} from "models/";
import {
    crossSliceSelectors,
    recurringTransactionsSlice,
    State,
    TransactionSelector,
    TransactionsSelector
} from "store/";
import {Id} from "utils/types";
import {DerivedAppModalUrls} from "values/screenUrls";

interface StateProps {
    /** The set of parsed non-duplicate transactions. */
    transactions: Array<TransactionData>;

    /** A selector that will enable the `TransactionsTable`/`TransactionsList` to connect to
     *  the recurring transactions slice to get transaction data on a per-transaction basis,
     *  as opposed to the default transactions slice. */
    transactionSelector: TransactionSelector;

    /** A selector that will enable the `TransactionsTable`/`TransactionsList` to connect to
     *  the recurring transactions slice to get their transaction data, as opposed to the default
     *  transactions slice. */
    transactionsSelector: TransactionsSelector;
}

interface DispatchProps {
    /** Handler for deleting a single transaction. */
    onDeleteTransaction: (id: Id) => void;

    /** Handler for editing a single transaction. */
    onEditTransaction: (id: Id) => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    transactions:
        crossSliceSelectors.recurringTransactions.selectRecurringAsRegularTransactions(state),
    transactionSelector:
        crossSliceSelectors.recurringTransactions.selectRecurringAsRegularTransaction,
    transactionsSelector:
        crossSliceSelectors.recurringTransactions.selectRecurringAsRegularTransactionsById
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onDeleteTransaction: (id: Id) =>
        dispatch(recurringTransactionsSlice.actions.undoableDestroyRecurringTransaction(id)),
    onEditTransaction: (id: Id) =>
        dispatch(push(`${DerivedAppModalUrls.RECURRING_TRANSACTION_FORM}/${id}`))
});

export default connect(mapStateToProps, mapDispatchToProps);
