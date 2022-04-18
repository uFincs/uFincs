import {createMatchSelector} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {Account, AccountType, Transaction} from "models/";
import {crossSliceSelectors, transactionsImportSlice, State} from "store/";
import {DerivedAppModalUrls} from "values/screenUrls";

interface StateProps {
    /** The map of all accounts by their type. Used for the Account option inputs. */
    accountsByType: Record<AccountType, Array<Account>>;

    /** Used for filtering the account input options to just the account being imported to. */
    importAccount?: Account;

    /** Placeholder value for the 'target' account.
     *
     *  The 'target' account is a concept used by `ImportableTransaction`, to specify
     *  during the import process which account is being 'targeted' (i.e which account
     *  isn't the account being imported to). */
    targetAccountPlaceholder?: string;

    /** The transaction that is being edited. */
    transactionForEditing?: Transaction;
}

interface DispatchProps {
    /** Callback to submit the form. */
    onSubmit: (transaction: Transaction) => void;
}

// Because we're using mergeProps, we need to explicitly specify and pass through OwnProps
// here instead of in AccountFormProps.
interface OwnProps {
    /** Custom class name. */
    className?: string;

    /** Callback to close the form. */
    onClose: () => void;
}

export interface ConnectedProps extends StateProps, DispatchProps, OwnProps {}

const mapStateToProps = (): ((state: State) => StateProps) => {
    const matchSelector = createMatchSelector<any, {id: string}>(
        DerivedAppModalUrls.TRANSACTIONS_IMPORT_FORM_EDITING
    );

    return (state: State) => {
        const match = matchSelector(state);
        const id = match?.params?.id;

        const transactions =
            crossSliceSelectors.transactionsImport.selectAllTransactionsById(state);

        const transactionForEditing = id ? transactions?.[id] : undefined;
        const targetAccountPlaceholder = transactionForEditing?.targetAccount;

        const importAccount = crossSliceSelectors.transactionsImport.selectAccount(state);

        return {
            accountsByType: crossSliceSelectors.accounts.selectAccountsByType(state),
            importAccount,
            targetAccountPlaceholder,
            isEditing: !!id,
            transactionForEditing
        };
    };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onSubmit: (transaction: Transaction) => {
        transaction.convertAmountToCents();
        dispatch(transactionsImportSlice.actions.updateTransaction(transaction));
    }
});

export default connect(mapStateToProps, mapDispatchToProps);
