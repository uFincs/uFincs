import {connect} from "react-redux";
import {crossSliceSelectors, State} from "store/";

interface StateProps {
    /** Whether or not the user has any future transactions.
     *  Controls whether or not the `Divider` is shown, since it only needs to be shown when
     *  the `ShowFutureToggle` button is present. */
    hasFutureTransactions?: boolean;
}

export interface ConnectedProps extends StateProps {}

const mapStateToProps = (state: State): StateProps => ({
    hasFutureTransactions: crossSliceSelectors.transactions.selectAnyFutureTransactions(state)
});

export default connect(mapStateToProps);
