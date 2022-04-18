import {connect} from "react-redux";
import {Dispatch} from "redux";
import {StepNavigationButtons} from "components/molecules";
import {StepNavigationButtonsProps} from "components/molecules/StepNavigationButtons/StepNavigationButtons";
import {onboardingRequestsSlice, onboardingSlice, State} from "store/";
import {takeOwnPropIfDefined} from "utils/helperFunctions";

interface StateProps
    extends Pick<
        StepNavigationButtonsProps,
        "canMoveToNextStep" | "hideBackButton" | "loading" | "nextDisabledReason"
    > {}

export interface DispatchProps
    extends Pick<StepNavigationButtonsProps, "onNextStep" | "onPreviousStep"> {}

export interface OwnProps
    extends Pick<
        StepNavigationButtonsProps,
        "canMoveToNextStep" | "nextDisabledReason" | "customOnNextStep"
    > {}

export const mapStateToProps = (state: State, ownProps: OwnProps): StateProps => {
    const canMoveToNextStep = takeOwnPropIfDefined(
        ownProps.canMoveToNextStep,
        onboardingSlice.selectors.selectCanGotoNextStep(state)
    );

    const nextDisabledReason = takeOwnPropIfDefined(
        ownProps.nextDisabledReason,
        onboardingSlice.selectors.selectNextStepDisabledReason(state)
    );

    return {
        hideBackButton: onboardingSlice.selectors.selectCurrentStep(state) === 0,
        loading: onboardingRequestsSlice.finishOnboarding.selectors.selectLoading(state),
        canMoveToNextStep,
        nextDisabledReason
    };
};

export const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps): DispatchProps => {
    const onNextStep = takeOwnPropIfDefined(ownProps.customOnNextStep, () =>
        dispatch(onboardingSlice.actions.gotoNextStep())
    );

    return {
        onNextStep,
        onPreviousStep: () => dispatch(onboardingSlice.actions.gotoPreviousStep())
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(StepNavigationButtons);
