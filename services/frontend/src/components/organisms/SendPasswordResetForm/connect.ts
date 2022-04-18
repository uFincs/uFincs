import {push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {authRequestsSlice, State} from "store/";
import ScreenUrls from "values/screenUrls";

export interface SendPasswordResetFormData {
    email: string;
}

interface StateProps {
    /** Whether or not the submitted request is progress and the form should be loading. */
    loading?: boolean;
}

interface DispatchProps {
    /** Handler for going back to the Login page. */
    onReturnToLogin: () => void;

    /** Handler for when the form submits. */
    onSubmit: (data: SendPasswordResetFormData) => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    loading: authRequestsSlice.sendPasswordReset.selectors.selectLoading(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onReturnToLogin: () => dispatch(push(ScreenUrls.LOGIN)),
    onSubmit: (data) => dispatch(authRequestsSlice.sendPasswordReset.actions.request(data))
});

export default connect(mapStateToProps, mapDispatchToProps);
