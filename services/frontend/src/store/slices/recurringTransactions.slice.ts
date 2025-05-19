import {createSelector, PayloadAction} from "@reduxjs/toolkit";
import {RecurringTransactionData} from "models/";
import mounts from "store/mountpoints";
import {State} from "store/types";
import {
    createOfflineRequestSlices,
    createSliceWithSelectors,
    crudSliceReducerFactory
} from "store/utils";
import {Id} from "utils/types";
import {EncryptionSchema} from "vendor/redux-e2e-encryption";

/* State */

interface RecurringTransactionsSliceState {
    [id: string]: RecurringTransactionData;
}

const initialState: RecurringTransactionsSliceState = {};

/* Selectors */

const selectState = (state: State): RecurringTransactionsSliceState =>
    state[mounts.recurringTransactions];

const selectRecurringTransaction = (id: Id) => createSelector([selectState], (byId) => byId[id]);

const selectRecurringTransactionsList = createSelector([selectState], (byId) =>
    Object.values(byId)
);

const selectors = {
    selectRecurringTransactions: selectState,
    selectRecurringTransaction,
    selectRecurringTransactionsList
};

/* Slice */

export const recurringTransactionsSlice = createSliceWithSelectors({
    name: mounts.recurringTransactions,
    initialState,
    reducers: {
        ...crudSliceReducerFactory<RecurringTransactionsSliceState, RecurringTransactionData>(),

        /* Saga Only Actions */
        triggerConcreteRealizations: (state: RecurringTransactionsSliceState) => state,

        undoableDestroyRecurringTransaction: (
            state: RecurringTransactionsSliceState,
            _action: PayloadAction<Id>
        ) => state
    },
    selectors
});

/* Requests Slice */

export const recurringTransactionsRequestsSlice = createOfflineRequestSlices(
    mounts.recurringTransactionsRequests,
    ["create", "createMany", "destroy", "fetchAll", "update"],
    {
        create: {
            effectStart: {
                encrypt: EncryptionSchema.single("recurringTransaction")
            }
        },
        createMany: {
            effectStart: {
                encrypt: EncryptionSchema.arrayOf("recurringTransaction")
            }
        },
        destroy: {},
        fetchAll: {},
        update: {
            effectStart: {
                encrypt: EncryptionSchema.single("recurringTransaction")
            }
        }
    }
);
