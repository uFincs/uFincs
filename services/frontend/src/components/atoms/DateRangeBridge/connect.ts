import {connect} from "react-redux";
import {Dispatch} from "redux";
import {DateState} from "hooks/";
import {RecurringTransactionData} from "models/";
import {recurringTransactionsSlice, virtualTransactionsSlice, State} from "store/";
import {Id} from "utils/types";

interface StateProps {
    /** The entire recurring transactions state.
     *
     *  Used so that the date range gets emitted every time the recurring transactions change,
     *  so that we can get the date range to trigger virtual realization when, e.g., a recurring
     *  transaction is created. */
    recurringTransactions: Record<Id, RecurringTransactionData>;
}

interface DispatchProps {
    /** Callback that takes the date range state and emits it to the store. */
    onDateRangeChange: (state: DateState) => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    recurringTransactions: recurringTransactionsSlice.selectors.selectRecurringTransactions(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onDateRangeChange: (state: DateState) =>
        dispatch(virtualTransactionsSlice.actions.handleDateChange(state))
});

export default connect(mapStateToProps, mapDispatchToProps);
