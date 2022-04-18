import {connect} from "react-redux";
import {crossSliceSelectors, State} from "store";

interface StateProps {
    /** Whether or not to split the chart into current/future transactions. */
    showFutureTransactions?: boolean;
}

export interface ConnectedProps extends StateProps {}

const mapStateToProps = (state: State): StateProps => ({
    showFutureTransactions: crossSliceSelectors.preferences.selectShowFutureTransactions(state)
});

export default connect(mapStateToProps);
