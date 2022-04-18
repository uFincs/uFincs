import {connect} from "react-redux";
import {Dispatch} from "redux";
import {modalsSlice, State, unhandledErrorsSlice} from "store";

interface StateProps {
    /** Whether or not the dialog should be visible. */
    isVisible: boolean;

    /** An error that was unhandled and must now be sent to us for debugging. */
    unhandledError?: Error;
}

interface IntermediateDispatchProps {
    /** [intermediate] Handler for closing the dialog. */
    onClose: (unhandledError?: Error) => void;
}

interface DispatchProps {
    /** Handler for closing the dialog. */
    onClose: () => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => {
    return {
        isVisible: modalsSlice.selectors.selectFeedbackModalVisibility(state),
        unhandledError: unhandledErrorsSlice.selectors.selectHeadError(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): IntermediateDispatchProps => ({
    onClose: (unhandledError?: Error) => {
        if (unhandledError) {
            dispatch(unhandledErrorsSlice.actions.removeHead());
        } else {
            dispatch(modalsSlice.actions.hideFeedbackModal());
        }
    }
});

const mergeProps = (
    stateProps: StateProps,
    dispatchProps: IntermediateDispatchProps
): ConnectedProps => ({
    ...stateProps,
    ...dispatchProps,
    onClose: () => dispatchProps.onClose(stateProps.unhandledError)
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps);
