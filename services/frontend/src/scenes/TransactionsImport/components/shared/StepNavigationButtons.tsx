import {connect as reactReduxConnect} from "react-redux";
import {Dispatch} from "redux";
import {StepNavigationButtons} from "components/molecules";
import {StepNavigationButtonsProps} from "components/molecules/StepNavigationButtons/StepNavigationButtons";
import {transactionsImportSlice, State, transactionsImportRequestsSlice} from "store/";
import {STEP_INDICES} from "values/transactionsImportSteps";

interface StateProps
    extends Pick<
        StepNavigationButtonsProps,
        "canMoveToNextStep" | "hideBackButton" | "loading" | "nextDisabledReason" | "nextText"
    > {}

interface IntermediateStateProps extends StateProps {
    /** [intermediate] The current step of the import process.
     *  Need this to pass to the intermediate `onNextStep`. */
    currentStep: number;

    isNewProfileSection: boolean;
}

interface DispatchProps
    extends Pick<
        StepNavigationButtonsProps,
        "onNextStep" | "onPreviousStep" | "disabledOnNextStep"
    > {}

interface IntermediateDispatchProps extends Omit<DispatchProps, "onNextStep"> {
    /** [intermediate] The handler needs the `currentStep` in order to determine which action to output. */
    onNextStep: (currentStep: number, isNewProfileSection: boolean) => () => void;
}

interface OwnProps {
    /** Whether or not to use shorter custom 'Next' button labels.
     *  This is used by the StepNavigationButtons in the ProgressStepper. */
    useShortNextText?: boolean;
}

interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State, ownProps: OwnProps): IntermediateStateProps => {
    const currentStep = transactionsImportSlice.selectors.selectCurrentStep(state);
    const isNewProfileSection = transactionsImportSlice.selectors.selectIsNewProfileSection(state);

    const nextText = (() => {
        switch (currentStep) {
            case STEP_INDICES.COMPLETE_IMPORT:
                if (ownProps.useShortNextText) {
                    return "Import";
                } else {
                    return "Looks good, import!";
                }
            case STEP_INDICES.MAP_FIELDS:
                if (!ownProps.useShortNextText && isNewProfileSection) {
                    return "Save & Next";
                } else {
                    // We don't have the room to show anything more when using short text.
                    return "Next";
                }
            default:
                return "Next";
        }
    })();

    return {
        canMoveToNextStep: transactionsImportSlice.selectors.selectCanGotoNextStep(state),
        currentStep,
        hideBackButton: transactionsImportSlice.selectors.selectCurrentStep(state) === 0,
        isNewProfileSection,
        loading: transactionsImportSlice.selectors.selectLoadingStep(state),
        nextDisabledReason: transactionsImportSlice.selectors.selectNextStepDisabledReason(state),
        nextText
    };
};

const mapDispatchToProps = (dispatch: Dispatch): IntermediateDispatchProps => {
    const onNextStep = (currentStep: number, isNewProfileSection: boolean) => () => {
        switch (currentStep) {
            case STEP_INDICES.MAP_FIELDS:
                if (isNewProfileSection) {
                    dispatch(transactionsImportRequestsSlice.createImportProfile.actions.request());
                } else {
                    dispatch(transactionsImportSlice.actions.startMoveToAdjustTransactionsStep());
                }

                break;
            case STEP_INDICES.COMPLETE_IMPORT:
                dispatch(transactionsImportRequestsSlice.import.actions.request());
                break;
            default:
                dispatch(transactionsImportSlice.actions.gotoNextStep());
                break;
        }
    };

    return {
        onNextStep,
        onPreviousStep: () => dispatch(transactionsImportSlice.actions.gotoPreviousStep()),
        disabledOnNextStep: () =>
            dispatch(transactionsImportSlice.actions.setMarkInvalidTransactions(true))
    };
};

const mergeProps = (
    stateProps: IntermediateStateProps,
    dispatchProps: IntermediateDispatchProps,
    ownProps: OwnProps
): ConnectedProps => {
    const {currentStep, isNewProfileSection, ...otherStateProps} = stateProps;
    const {onNextStep, ...otherDispatchProps} = dispatchProps;

    const finalOnNextStep = onNextStep(currentStep, isNewProfileSection);

    return {
        ...otherStateProps,
        ...otherDispatchProps,
        ...ownProps,
        onNextStep: finalOnNextStep
    };
};

export const connect = reactReduxConnect(mapStateToProps, mapDispatchToProps, mergeProps);
export default connect(StepNavigationButtons);
