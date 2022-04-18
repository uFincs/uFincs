import {connect} from "react-redux";
import {Dispatch} from "redux";
import {billingRequestsSlice, State} from "store/";
import userFriendlyErrorMessages from "utils/userFriendlyErrorMessages";

interface StateProps {
    error?: string;
    loading?: boolean;
}

interface DispatchProps {
    /** Handler for redirecting the user to the Customer Portal. */
    gotoCustomerPortal: () => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    error: userFriendlyErrorMessages(
        billingRequestsSlice.gotoCustomerPortal.selectors.selectErrorMessage(state)
    ),
    loading: billingRequestsSlice.gotoCustomerPortal.selectors.selectLoading(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    gotoCustomerPortal: () => dispatch(billingRequestsSlice.gotoCustomerPortal.actions.request())
});

export default connect(mapStateToProps, mapDispatchToProps);
