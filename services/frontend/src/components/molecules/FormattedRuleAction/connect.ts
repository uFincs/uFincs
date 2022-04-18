import {connect} from "react-redux";
import {AccountData} from "models/";
import {accountsSlice, State} from "store/";
import {Id} from "utils/types";

interface StateProps {
    /** Need the set of accounts so that we can display account names for Account properties
     *  rather than displaying IDs. */
    accountsById: Record<Id, AccountData>;
}

export interface ConnectedProps extends StateProps {}

const mapStateToProps = (state: State): StateProps => ({
    accountsById: accountsSlice.selectors.selectAccounts(state)
});

export default connect(mapStateToProps);
