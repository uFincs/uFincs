import {push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {BulkEditableTransactionProperty, ImportableTransaction} from "models/";
import {
    crossSliceSelectors,
    transactionsImportSlice,
    State,
    TransactionSelector,
    TransactionsSelector
} from "store/";
import {Id} from "utils/types";
import {DerivedAppModalUrls} from "values/screenUrls";

interface StateProps {
    /** The set of parsed transactions that were marked as duplicates. */
    duplicateTransactions: Array<ImportableTransaction>;

    /** A mapping version of the duplicate transactions. */
    duplicateTransactionsById: Record<Id, ImportableTransaction>;

    /** The set of parsed non-duplicate transactions. */
    transactions: Array<ImportableTransaction>;

    /** A mapping version of the transactions. */
    transactionsById: Record<Id, ImportableTransaction>;

    /** A selector that will enable the `TransactionsTable`/`TransactionsList` to connect to
     *  the transactions import slice to get transaction data on a per-transaction basis,
     *  as opposed to the default transactions slice. */
    transactionSelector: TransactionSelector;

    /** A selector that will enable the `TransactionsTable`/`TransactionsList` to connect to
     *  the transactions import slice to get their transaction data, as opposed to the default
     *  transactions slice. */
    transactionsSelector: TransactionsSelector;
}

interface DispatchProps {
    /** Handler for bulk editing a given set of transactions. */
    onBulkEditTransactions: (
        ids: Array<Id>,
        property: BulkEditableTransactionProperty,
        newValue: string
    ) => void;

    /** Handler for editing a single transaction. */
    onEditTransaction: (id: Id) => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    duplicateTransactions:
        crossSliceSelectors.transactionsImport.selectDuplicateTransactions(state),
    duplicateTransactionsById:
        crossSliceSelectors.transactionsImport.selectDuplicateTransactionsById(state),
    transactions: crossSliceSelectors.transactionsImport.selectTransactions(state),
    transactionsById: crossSliceSelectors.transactionsImport.selectTransactionsById(state),
    transactionSelector: crossSliceSelectors.transactionsImport.selectTransaction,
    transactionsSelector: crossSliceSelectors.transactionsImport.selectTransactionsById
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onBulkEditTransactions: (
        ids: Array<Id>,
        property: BulkEditableTransactionProperty,
        newValue: string
    ) =>
        dispatch(transactionsImportSlice.actions.bulkUpdateTransactions({ids, property, newValue})),
    onEditTransaction: (id: Id) =>
        dispatch(push(`${DerivedAppModalUrls.TRANSACTIONS_IMPORT_FORM}/${id}`))
});

export default connect(mapStateToProps, mapDispatchToProps);
