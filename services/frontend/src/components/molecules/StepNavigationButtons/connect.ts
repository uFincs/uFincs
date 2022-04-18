import {connect} from "react-redux";
import {Dispatch} from "redux";
import {transactionsImportSlice, State} from "store/";
import {takeOwnPropIfDefined} from "utils/helperFunctions";

interface StateProps {
    /** Whether or not the user can move to the next step. */
    canMoveToNextStep?: boolean;

    /** Whether or not to hide the back button.
     *  The back button should normally be hidden on the first step,
     *  since there's nothing to go back to yet. */
    hideBackButton?: boolean;

    /** A tooltip to display to explain why the Next button is disabled
     *  (i.e. what the user has to do to complete the current step). */
    nextDisabledReason?: string;
}

interface DispatchProps {
    /** Handler for moving to the next step. */
    onNextStep: () => void;

    /** Handler for moving to the previous step. */
    onPreviousStep: () => void;
}

export interface OwnProps {
    /** Whether or not the user can move to the next step.
     *
     *  Can be passed in as an OwnProp to override the connected prop and be controlled
     *  by the Step directly. */
    canMoveToNextStep?: boolean;

    /** A tooltip to display to explain why the Next button is disabled
     *  (i.e. what the user has to do to complete the current step). */
    nextDisabledReason?: string;

    /** Overrides the text of the 'Next' button. */
    nextText?: string;

    /** Handler for moving to the next step.
     *
     *  Can be passed in as an OwnProp to override the connected prop and be controlled
     *  by the Step directly. */
    customOnNextStep?: () => void;
}

export interface ConnectedProps extends StateProps, DispatchProps, OwnProps {}

const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
    const canMoveToNextStep = takeOwnPropIfDefined(
        ownProps.canMoveToNextStep,
        transactionsImportSlice.selectors.selectCanGotoNextStep(state)
    );

    const nextDisabledReason = takeOwnPropIfDefined(
        ownProps.nextDisabledReason,
        transactionsImportSlice.selectors.selectNextStepDisabledReason(state)
    );

    return {
        hideBackButton: transactionsImportSlice.selectors.selectCurrentStep(state) === 0,
        canMoveToNextStep,
        nextDisabledReason
    };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps): DispatchProps => {
    const onNextStep = takeOwnPropIfDefined(ownProps.customOnNextStep, () =>
        dispatch(transactionsImportSlice.actions.gotoNextStep())
    );

    return {
        onNextStep,
        onPreviousStep: () => dispatch(transactionsImportSlice.actions.gotoPreviousStep())
    };
};

export default connect(mapStateToProps, mapDispatchToProps);
