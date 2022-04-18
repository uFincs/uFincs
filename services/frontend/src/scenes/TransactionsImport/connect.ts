import {goBack} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {transactionsImportSlice, State} from "store/";

interface StateProps {
    /** The index of the current step. */
    currentStep: number;
}

interface DispatchProps {
    /** Handler for jumping directly to a step.
     *  Used when clicking on a (completed) step on desktop. */
    gotoStep: (step: number) => void;

    /** Handler for navigating backwards in browser history (with the back button). */
    onBack: () => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    currentStep: transactionsImportSlice.selectors.selectCurrentStep(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    gotoStep: (step: number) => dispatch(transactionsImportSlice.actions.setCurrentStep(step)),
    onBack: () => dispatch(goBack())
});

export default connect(mapStateToProps, mapDispatchToProps);
