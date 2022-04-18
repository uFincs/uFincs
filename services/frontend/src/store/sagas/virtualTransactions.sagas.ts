import {PayloadAction} from "@reduxjs/toolkit";
import {all, put, select, takeEvery} from "redux-saga/effects";
import {DateState} from "hooks/";
import {DateRangeSize} from "hooks/useDateRange";
import {RecurringTransactionData} from "models/";
import {recurringTransactionsSlice, virtualTransactionsSlice} from "store/";
import {Id} from "utils/types";

/** Handles realizing the recurring transactions over the current date range and storing
 *  the results in the `virtualTransactions` slice.
 *
 *  If the action was called without a payload, then this means that we are triggering realization
 *  at app boot, right after fetching and storing the recurring transactions. As such, we should
 *  use the initial date range for the start/end dates.
 *
 *  Otherwise, the action should have a payload containing the date range state. This happens
 *  as a result of the `DateRangeBridge` component, which issues the action whenever the date range
 *  context state changes. */
function* realizeTransactions({payload}: PayloadAction<DateState>) {
    const {endDate, rangeSize} = payload;

    // Since "All Time" doesn't cause the start/end date to change (and because "All Time" only means
    // up-to-and-including-today, i.e. no future), there's no reason to do anything.
    if (rangeSize === DateRangeSize.allTime) {
        return;
    }

    const recurringTransactions = yield select(
        recurringTransactionsSlice.selectors.selectRecurringTransactionsList
    );

    yield put(
        virtualTransactionsSlice.actions.realizeTransactions({recurringTransactions, endDate})
    );
}

function* handleRecurringTransactionDelete({payload}: PayloadAction<Id>) {
    yield put(virtualTransactionsSlice.actions.deleteRecurringTransaction(payload));
}

function* handleRecurringTransactionUpdate({payload}: PayloadAction<RecurringTransactionData>) {
    yield put(virtualTransactionsSlice.actions.updateRecurringTransaction(payload));
}

function* virtualTransactionsSaga() {
    yield all([
        takeEvery(virtualTransactionsSlice.actions.handleDateChange, realizeTransactions),
        takeEvery(recurringTransactionsSlice.actions.delete, handleRecurringTransactionDelete),
        takeEvery(recurringTransactionsSlice.actions.update, handleRecurringTransactionUpdate)
    ]);
}

export default virtualTransactionsSaga;
