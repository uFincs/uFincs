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

    /** Handler for resetting the user's password upon dialog submission. */
    onResetPassword: () => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    isVisible: modalsSlice.selectors.selectPasswordResetModalVisibility(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onClose: () => dispatch(modalsSlice.actions.cancelPasswordResetModal()),
    onResetPassword: () => dispatch(modalsSlice.actions.confirmPasswordResetModal())
});

export default connect(mapStateToProps, mapDispatchToProps);
