import {push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {DerivedAppScreenUrls} from "values/screenUrls";

interface DispatchProps {
    /** Callback to put the user into the CSV import process. */
    onImportCSV: () => void;
}

export interface ConnectedProps extends DispatchProps {}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onImportCSV: () => dispatch(push(DerivedAppScreenUrls.TRANSACTIONS_IMPORT))
});

export default connect(null, mapDispatchToProps);
