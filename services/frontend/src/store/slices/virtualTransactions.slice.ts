import {createSelector, PayloadAction} from "@reduxjs/toolkit";
import {DateState} from "hooks/";
import {RecurringTransactionData} from "models/";
import mounts from "store/mountpoints";
import {State} from "store/types";
import {createSliceWithSelectors} from "store/utils";
import {VirtualTransactions, VirtualTransactionsData} from "structures/";
import {Id} from "utils/types";

/* State */

interface VirtualTransactionsSliceState extends VirtualTransactionsData {}

const initialState: VirtualTransactionsSliceState = {
    byId: {},
    byRecurringTransactionId: {}
};

/* Selectors */

const selectState = (state: State): VirtualTransactionsSliceState =>
    state[mounts.virtualTransactions];

const selectVirtualTransactions = createSelector([selectState], (state) => state.byId);

const selectVirtualTransactionsList = createSelector([selectState], (state) =>
    Object.values(state.byId)
);

const selectors = {
    selectState,
    selectVirtualTransactions,
    selectVirtualTransactionsList
};

/* Slice */

export const virtualTransactionsSlice = createSliceWithSelectors({
    name: mounts.virtualTransactions,
    initialState,
    reducers: {
        realizeTransactions: (
            state: VirtualTransactionsSliceState,
            action: PayloadAction<{
                recurringTransactions: Array<RecurringTransactionData>;
                endDate: string;
            }>
        ) => {
            const {recurringTransactions, endDate} = action.payload;

            // Although all VirtualTransactions methods return the state, since they also directly
            // modify the state, we don't want to do both. As such, just use the direct mutations.
            VirtualTransactions.addMany(
                state,
                recurringTransactions,
                // See the explanation in `VirtualTransactions.add` for why the start date is empty.
                // tl;dr so that all transactions are generated from the start date of each recurring
                // transaction, to ensure accurate calculations for accumulative amounts
                // (e.g. asset/liability balances).
                "",
                endDate
            );
        },
        deleteRecurringTransaction: (
            state: VirtualTransactionsSliceState,
            action: PayloadAction<Id>
        ) => {
            const {payload: recurringTransactionId} = action;
            VirtualTransactions.delete(state, recurringTransactionId);
        },
        updateRecurringTransaction: (
            state: VirtualTransactionsSliceState,
            action: PayloadAction<RecurringTransactionData>
        ) => {
            const {payload: virtualTransaction} = action;
            VirtualTransactions.update(state, virtualTransaction);
        },

        /* Saga Only Actions */
        handleDateChange: (
            state: VirtualTransactionsSliceState,
            // Calling this action without a payload means that the initial start/end dates
            // should be used.
            action: PayloadAction<DateState>
        ) => state
    },
    selectors
});
