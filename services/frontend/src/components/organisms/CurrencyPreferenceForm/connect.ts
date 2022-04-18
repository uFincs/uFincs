import {connect} from "react-redux";
import {Dispatch} from "redux";
import {preferencesSlice, preferencesRequestsSlice, State} from "store/";
import {DefaultCurrency} from "values/currencies";

interface StateProps {
    /** The current currency code (i.e. the 3-letter code, not the symbol). */
    currentCurrency: string;

    /** Error state of the request. */
    error?: string;

    /** Loading state of the request. */
    loading?: boolean;
}

interface DispatchProps {
    /** Callback for saving the change to the currency. */
    onSave: (currency: string) => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    currentCurrency: preferencesSlice.selectors.selectCurrency(state) || DefaultCurrency,
    error: preferencesRequestsSlice.patch.selectors.selectErrorMessage(state),
    loading: preferencesRequestsSlice.patch.selectors.selectLoading(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onSave: (currency: string) =>
        dispatch(preferencesRequestsSlice.patch.actions.request({currency}))
});

export default connect(mapStateToProps, mapDispatchToProps);
