import {connect} from "react-redux";
import {Transaction} from "models/";
import {
    transactionsImportSlice,
    crossSliceSelectors,
    State,
    TransactionSelector,
    TransactionsSelector
} from "store/";
import {Cents} from "utils/types";

interface StateProps {
    /** The name of the account to import to. */
    accountName: string;

    /** The name of the file being imported from. */
    fileName: string;

    /** The name of the import profile that parsed the file. */
    importProfileName: string;

    /** The net change in the balance of the account. */
    netBalanceChange: Cents;

    /** The final set of transactions to import. */
    transactions: Array<Transaction>;

    /** The selector that points the transactions table/list to the transactions import store for
     *  individual transactions. */
    transactionSelector: TransactionSelector;

    /** The selector that points the transactions table/list to the transactions import store. */
    transactionsSelector: TransactionsSelector;
}

export type ConnectedProps = StateProps;

const mapStateToProps = (state: State): StateProps => ({
    accountName: crossSliceSelectors.transactionsImport.selectAccountName(state),
    fileName: transactionsImportSlice.selectors.selectFileName(state),
    importProfileName: crossSliceSelectors.transactionsImport.selectProfileName(state),
    netBalanceChange: crossSliceSelectors.transactionsImport.selectNetBalanceChange(state),
    transactions: crossSliceSelectors.transactionsImport.selectCleanTransactions(state),
    transactionSelector: crossSliceSelectors.transactionsImport.selectCleanTransaction,
    transactionsSelector: crossSliceSelectors.transactionsImport.selectCleanTransactionsById
});

export default connect(mapStateToProps);
