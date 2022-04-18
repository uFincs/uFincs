import {connect} from "react-redux";
import {Dispatch} from "redux";
import {fileDownloadSlice, State} from "store/";

interface StateProps {
    /** The (string) contents of the file to download. */
    fileContents: string;

    /** The name of the file when it is downloaded. */
    fileName: string;
}

interface DispatchProps {
    /** Handler for clearing the file contents after a file has been downloaded. */
    clearFileState: () => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    fileContents: fileDownloadSlice.selectors.selectFileContents(state),
    fileName: fileDownloadSlice.selectors.selectFileName(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    clearFileState: () => dispatch(fileDownloadSlice.actions.resetState())
});

export default connect(mapStateToProps, mapDispatchToProps);
