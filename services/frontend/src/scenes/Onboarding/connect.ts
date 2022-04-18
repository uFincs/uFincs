import {connect} from "react-redux";
import {Dispatch} from "redux";
import {onboardingSlice, onboardingRequestsSlice, State} from "store/";

interface StateProps {
    /** The index of the current step. */
    currentStep: number;
}

interface DispatchProps {
    /** Handler that is called on the 'Next' button to finish the import process. */
    finishOnboarding: () => void;

    /** Handler for jumping directly to a step.
     *  Used when clicking on a (completed) step on desktop. */
    gotoStep: (step: number) => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    currentStep: onboardingSlice.selectors.selectCurrentStep(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    finishOnboarding: () => dispatch(onboardingRequestsSlice.finishOnboarding.actions.request()),
    gotoStep: (step: number) => dispatch(onboardingSlice.actions.setCurrentStep(step))
});

export default connect(mapStateToProps, mapDispatchToProps);
