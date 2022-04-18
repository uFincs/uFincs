import {connect} from "react-redux";
import {Dispatch} from "redux";
import {crossSliceSelectors, preferencesSlice, State} from "store/";

interface StateProps {
    /** Whether or not the toggle is currently turned on. */
    active: boolean;

    /** Whether or not the toggle should even be shown (because it shouldn't be shown
     *  if there aren't any future transactions). */
    hasFutureTransactions?: boolean;
}

interface DispatchProps {
    /** Callback for when the toggle button is clicked/toggled. */
    onToggle: () => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    active: preferencesSlice.selectors.selectShowFutureTransactions(state),
    hasFutureTransactions: crossSliceSelectors.transactions.selectAnyFutureTransactions(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onToggle: () => dispatch(preferencesSlice.actions.toggleShowFutureTransactions())
});

export default connect(mapStateToProps, mapDispatchToProps);
