import {connect} from "react-redux";
import {Dispatch} from "redux";
import {authRequestsSlice, billingRequestsSlice, State} from "store/";
import userFriendlyErrorMessages from "utils/userFriendlyErrorMessages";

interface StateProps {
    error?: string;
    loading?: boolean;
}

interface DispatchProps {
    onCancel: () => void;
    onCheckout: (priceId: string) => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const errorMessageMap = (error: string) => {
    switch (error) {
        default:
            return userFriendlyErrorMessages(error);
    }
};

const mapStateToProps = (state: State): StateProps => ({
    error: errorMessageMap(billingRequestsSlice.checkout.selectors.selectErrorMessage(state)),
    loading: billingRequestsSlice.checkout.selectors.selectLoading(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onCancel: () => dispatch(authRequestsSlice.logout.actions.request()),
    onCheckout: (priceId: string) =>
        dispatch(billingRequestsSlice.checkout.actions.request(priceId))
});

export default connect(mapStateToProps, mapDispatchToProps);
