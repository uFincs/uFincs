import {connect} from "react-redux";
import {modalsSlice, State} from "store/";

interface OwnProps {
    /** Whether or not the `BackgroundBlur` is visible.
     *
     *  This prop can be passed in by, e.g., a `Route` component to control the blur's visibility
     *  based on a route (as opposed to below, where it's controlled by the store). */
    isVisible?: boolean;
}

export interface ConnectedProps {
    /** Whether or not the `BackgroundBlur` is visible.
     *
     *  This store controlled prop is derived from the visibility of things like modal dialogs. */
    isVisible: boolean;
}

const mapStateToProps = (state: State, ownProps: OwnProps): ConnectedProps => ({
    isVisible: ownProps.isVisible || modalsSlice.selectors.selectAnyModalVisible(state)
});

export default connect(mapStateToProps);
