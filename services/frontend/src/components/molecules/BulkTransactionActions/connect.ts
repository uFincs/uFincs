import {connect} from "react-redux";
import {AccountData, AccountType} from "models/";
import {crossSliceSelectors, State} from "store/";

interface StateProps {
    /** A map of all accounts by type. Used for the `account` action. */
    accountsByType: Record<AccountType, Array<AccountData>>;
}

export interface ConnectedProps extends StateProps {}

const mapStateToProps = (state: State): ConnectedProps => ({
    accountsByType: crossSliceSelectors.accounts.selectAccountsByType(state)
});

export default connect(mapStateToProps);
