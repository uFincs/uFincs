import {push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {AccountData, AccountType} from "models/";
import {accountsSlice, State} from "store/";
import {DerivedAppModalUrls} from "values/screenUrls";

interface StateProps {
    /** The accounts to display, grouped by type. */
    accountsByType: Record<AccountType, Array<AccountData>>;
}

interface DispatchProps {
    /** Handler for adding a new account when there are no accounts at all. */
    onAddAccount: () => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    accountsByType: accountsSlice.selectors.selectSortedAccountsByType(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onAddAccount: () => dispatch(push(DerivedAppModalUrls.ACCOUNT_FORM))
});

export default connect(mapStateToProps, mapDispatchToProps);
