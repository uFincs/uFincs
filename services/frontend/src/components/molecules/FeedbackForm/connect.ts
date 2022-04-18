import {connect} from "react-redux";
import {Dispatch} from "redux";
import {FeedbackData} from "models/";
import {feedbackRequestsSlice, State} from "store/";
import userFriendlyErrorMessages from "utils/userFriendlyErrorMessages";

interface StateProps {
    /** Error state of the request. */
    error?: string;

    /** Loading state of the request. */
    loading?: boolean;
}

interface DispatchProps {
    /** Callback for submitting the form. */
    onSubmit: (feedback: FeedbackData) => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    error: userFriendlyErrorMessages(
        feedbackRequestsSlice.create.selectors.selectErrorMessage(state)
    ),
    loading: feedbackRequestsSlice.create.selectors.selectLoading(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onSubmit: (feedback) => dispatch(feedbackRequestsSlice.create.actions.request(feedback))
});

export default connect(mapStateToProps, mapDispatchToProps);
