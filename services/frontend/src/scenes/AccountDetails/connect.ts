import {push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {AccountData} from "models/";
import {accountsSlice, State} from "store/";
import {Id} from "utils/types";
import {DerivedAppModalUrls, DerivedAppScreenUrls} from "values/screenUrls";

interface StateProps {
    /** The accounts to display, grouped by type. */
    account: AccountData | undefined;
}

interface DispatchProps {
    /** Handler for going back to the Accounts List page. */
    onBack: () => void;

    /** Handler for clicking on the `Delete` action. */
    onDelete: () => void;

    /** Handler for clicking on the `Edit` action. */
    onEdit: () => void;
}

interface OwnProps {
    /** The ID of the account. */
    id: Id | undefined;
}

export interface ConnectedProps extends StateProps, DispatchProps, OwnProps {}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => ({
    account: accountsSlice.selectors.selectAccount(state, ownProps.id as string)
});

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps): DispatchProps => ({
    onBack: () => dispatch(push(DerivedAppScreenUrls.ACCOUNTS)),
    // Here it's fine to force cast the ID as a string, since the user can't click the Delete
    // button if the account didn't exist to begin with.
    onDelete: () => dispatch(accountsSlice.actions.undoableDestroyAccount(ownProps.id as string)),
    onEdit: () => dispatch(push(`${DerivedAppModalUrls.ACCOUNT_FORM}/${ownProps.id}`))
});

export default connect(mapStateToProps, mapDispatchToProps);
