import {createSelector, PayloadAction} from "@reduxjs/toolkit";
import {createCachedSelector} from "re-reselect";
import {TransactionData} from "models/";
import mounts from "store/mountpoints";
import {State} from "store/types";
import {createSliceWithSelectors} from "store/utils";
import {DateIndex} from "structures/";
import deepCopy from "utils/deepCopy";
import {AnyDate, Id} from "utils/types";

/* State */

export interface TransactionsDateIndexSliceState {
    byDate: DateIndex;
}

export const initialState: TransactionsDateIndexSliceState = {
    byDate: {}
};

/* Selectors */

const selectState = (state: State): TransactionsDateIndexSliceState =>
    state[mounts.transactionsDateIndex];

const selectDateIndex = createSelector([selectState], (state) => state.byDate);

const selectAtDate = createCachedSelector(
    [selectDateIndex, (_: State, date: AnyDate) => date],
    DateIndex.find
)((_, date) => date);

const selectFuture = createSelector([selectDateIndex], DateIndex.findFuture);

const selectors = {
    selectTransactionsIndex: selectState,
    selectDateIndex,
    selectAtDate,
    selectFuture
};

/* Slice Helper Functions */

const addTransaction = (
    state: TransactionsDateIndexSliceState,
    action: PayloadAction<TransactionData>
) => {
    DateIndex.add(state.byDate, action.payload);
};

const addTransactions = (
    state: TransactionsDateIndexSliceState,
    action: PayloadAction<Array<TransactionData>>
) => {
    const {payload: transactions} = action;
    transactions.forEach((transaction) => addTransaction(state, {type: "", payload: transaction}));
};

/* Slice */

export const transactionsDateIndexSlice = createSliceWithSelectors({
    name: mounts.transactionsDateIndex,
    initialState,
    reducers: {
        addTransaction,
        addTransactions,
        setTransactions: (
            state: TransactionsDateIndexSliceState,
            action: PayloadAction<Record<Id, TransactionData>>
        ): TransactionsDateIndexSliceState => {
            const {payload: transactionsById} = action;

            // Deep copy initialState to reset the state.
            // Can't use a shallow copy (like a spread) since the
            // underlying objects of initialState will still be the same --
            // bad since then the original initialState gets modified.
            const newState = deepCopy(initialState);

            addTransactions(newState, {type: "", payload: Object.values(transactionsById)});
            return newState;
        },
        deleteTransaction: (state: TransactionsDateIndexSliceState, action: PayloadAction<Id>) => {
            const {payload: id} = action;
            DateIndex.delete(state.byDate, id);
        },
        updateTransaction: (
            state: TransactionsDateIndexSliceState,
            action: PayloadAction<TransactionData>
        ) => {
            const {payload: transaction} = action;
            DateIndex.update(state.byDate, transaction);
        }
    },
    selectors
});
