import {connect} from "react-redux";
import {Account, AccountType} from "models/";
import {crossSliceSelectors, State} from "store/";

interface StateProps {
    /** The map of all accounts by their type. Used for the Account option input. */
    accountsByType: Record<AccountType, Array<Account>>;
}

export interface ConnectedProps extends StateProps {}

const mapStateToProps = (state: State): StateProps => ({
    accountsByType: crossSliceSelectors.accounts.selectAccountsByType(state)
});

export default connect(mapStateToProps);
