import {connect} from "react-redux";
import {Dispatch} from "redux";
import {userOfflineRequestsSlice, State} from "store/";

interface StateProps {
    /** The loading state while the restore process is running. */
    loading?: boolean;
}

interface DispatchProps {
    /** Handler for restoring a backup file. */
    onRestoreBackup: (file: File) => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    loading: userOfflineRequestsSlice.restoreBackup.selectors.selectLoading(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onRestoreBackup: (file) =>
        dispatch(userOfflineRequestsSlice.restoreBackup.actions.request(file))
});

export default connect(mapStateToProps, mapDispatchToProps);
