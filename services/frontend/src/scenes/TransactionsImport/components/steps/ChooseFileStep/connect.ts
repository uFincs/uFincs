import {connect} from "react-redux";
import {Dispatch} from "redux";
import {transactionsImportSlice, State} from "store/";

interface StateProps {
    /** The name of the file that the user uploaded. */
    fileName: string;

    /** The possible number of transactions as calculated by the number of rows in the file. */
    possibleTransactionsCount: number;
}

interface DispatchProps {
    /** Callback for triggering the parsing of the user's file once their file is uploaded. */
    parseFile: (file: File) => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    fileName: transactionsImportSlice.selectors.selectFileName(state),
    possibleTransactionsCount: transactionsImportSlice.selectors.selectFileContents(state).length
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    parseFile: (file: File) => dispatch(transactionsImportSlice.actions.parseFile(file))
});

export default connect(mapStateToProps, mapDispatchToProps);
