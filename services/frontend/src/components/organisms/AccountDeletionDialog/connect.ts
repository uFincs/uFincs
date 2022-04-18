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

    /** Handler for deleting the account on confirmation. */
    onDelete: () => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    isVisible: modalsSlice.selectors.selectAccountDeletionModalVisibility(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onClose: () => dispatch(modalsSlice.actions.cancelAccountDeletionModal()),
    onDelete: () => dispatch(modalsSlice.actions.confirmAccountDeletionModal())
});

export default connect(mapStateToProps, mapDispatchToProps);
