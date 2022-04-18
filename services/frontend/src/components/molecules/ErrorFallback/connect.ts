import {connect} from "react-redux";
import {Dispatch} from "redux";
import {unhandledErrorsSlice} from "store";
import {objectifyError} from "store/utils";

interface DispatchProps {
    onSendFeedback: (error: Error) => void;
}

export interface ConnectedProps extends DispatchProps {}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onSendFeedback: (error) => dispatch(unhandledErrorsSlice.actions.push(objectifyError(error)))
});

export default connect(null, mapDispatchToProps);
