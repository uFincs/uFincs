import {push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {crossSliceSelectors, State} from "store/";

interface IntermediateStateProps {
    /** [intermediate] The modal compatible previous location to go to when closing the form.
     *  We need to use this because using just `goBack` can lead to some weirdness when
     *  hopping between forms by manually changing the URL. */
    previousLocation: string;
}

interface StateProps {}

interface IntermediateDispatchProps {
    /** [intermediate] Callback to close the form with the previousLocation from state. */
    onClose: (previousLocation: string) => void;
}

interface DispatchProps {
    /** Callback to close the form. */
    onClose: () => void;
}

interface OwnProps {
    /** Whether or not the `SidebarAccountForm` is visible.
     *  For controlling the form with a Route. */
    isVisible: boolean;
}

export interface ConnectedProps extends StateProps, DispatchProps, OwnProps {}

const mapStateToProps = (state: State): IntermediateStateProps => ({
    previousLocation: crossSliceSelectors.router.selectModalCompatibleCurrentRoute(state)
});

const mapDispatchToProps = (dispatch: Dispatch): IntermediateDispatchProps => ({
    onClose: (url: string) => dispatch(push(url))
});

const mergeProps = (
    stateProps: IntermediateStateProps,
    dispatchProps: IntermediateDispatchProps,
    ownProps: OwnProps
): ConnectedProps => ({
    onClose: () => dispatchProps.onClose(stateProps.previousLocation),
    ...ownProps
});

export default connect(mapStateToProps, mapDispatchToProps, mergeProps);
