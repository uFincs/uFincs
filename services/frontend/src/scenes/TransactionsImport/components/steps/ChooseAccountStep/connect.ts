import {connect} from "react-redux";
import {Dispatch} from "redux";
import {Account, AccountType} from "models/";
import {crossSliceSelectors, transactionsImportSlice, State} from "store/";
import {Id} from "utils/types";

interface StateProps {
    /** The ID of the currently selected account. */
    accountId: Id;

    /** The type of the account being imported to.
     *
     *  Needed to determine the initial state of the AccountTypePicker when the user navigates
     *  backwards to the first step. Without this, Liability accounts get wiped out
     *  since the previous default state was just the Asset type. */
    accountType: AccountType | undefined;

    /** The complete set of accounts, categorized by type. */
    accountsByType: Record<AccountType, Array<Account>>;
}

interface DispatchProps {
    /** Handler for saving the selected account ID back to the store. */
    saveAccountId: (id: Id) => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    accountId: transactionsImportSlice.selectors.selectAccountId(state),
    accountType: crossSliceSelectors.transactionsImport.selectAccountType(state),
    accountsByType: crossSliceSelectors.accounts.selectAccountsByType(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    saveAccountId: (id) => dispatch(transactionsImportSlice.actions.setAccountId(id))
});

export default connect(mapStateToProps, mapDispatchToProps);
