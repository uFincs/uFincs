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

    /** Handler for deleting the user account on confirmation. */
    onDelete: (password: string) => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    isVisible: modalsSlice.selectors.selectUserAccountDeletionModalVisibility(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onClose: () => dispatch(modalsSlice.actions.cancelUserAccountDeletionModal()),
    onDelete: (password) => dispatch(modalsSlice.actions.confirmUserAccountDeletionModal(password))
});

export default connect(mapStateToProps, mapDispatchToProps);
