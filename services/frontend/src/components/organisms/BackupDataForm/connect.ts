import {connect} from "react-redux";
import {Dispatch} from "redux";
import {userRequestsSlice} from "store/";

interface DispatchProps {
    /** Handler for performing a regular backup. */
    onBackup: () => void;

    /** Handler for performing an encrypted backup. */
    onEncryptedBackup: () => void;
}

export interface ConnectedProps extends DispatchProps {}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onBackup: () => dispatch(userRequestsSlice.createBackup.actions.request()),
    onEncryptedBackup: () => dispatch(userRequestsSlice.createEncryptedBackup.actions.request())
});

export default connect(null, mapDispatchToProps);
