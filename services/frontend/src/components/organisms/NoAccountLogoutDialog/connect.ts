import {connect} from "react-redux";
import {Dispatch} from "redux";
import {modalsSlice, State} from "store";

interface StateProps {
    /** Whether or not the dialog should be visible. */
    isVisible: boolean;
}

interface DispatchProps {
    /** Handler for closing the dialog. */
    onClose: () => void;

    /** Handler for confirming logout. */
    onLogout: () => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    isVisible: modalsSlice.selectors.selectNoAccountLogoutModalVisibility(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onClose: () => dispatch(modalsSlice.actions.cancelNoAccountLogoutModal()),
    onLogout: () => dispatch(modalsSlice.actions.confirmNoAccountLogoutModal())
});

export default connect(mapStateToProps, mapDispatchToProps);
