import {createSelector, PayloadAction} from "@reduxjs/toolkit";
import {TransactionData} from "models/";
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

interface TransactionsSliceState {
    [id: string]: TransactionData;
}

const initialState: TransactionsSliceState = {};

/* Selectors */

const selectState = (state: State): TransactionsSliceState => state[mounts.transactions];

const selectTransaction = (id: Id) =>
    createSelector([selectState], (transactionsById) => transactionsById[id]);

const selectTransactionsList = createSelector([selectState], (byId) => Object.values(byId));

const selectors = {
    selectTransactions: selectState,
    selectTransaction,
    selectTransactionsList
};

/* Slice */

export const transactionsSlice = createSliceWithSelectors({
    name: mounts.transactions,
    initialState,
    reducers: {
        ...crudSliceReducerFactory<TransactionsSliceState, TransactionData>(),

        /* Saga Only Actions */
        undoableDestroyTransaction: (state: TransactionsSliceState, _action: PayloadAction<Id>) =>
            state
    },
    selectors
});

/* Requests Slice */

export const transactionsRequestsSlice = createOfflineRequestSlices(
    mounts.transactionsRequests,
    ["create", "createMany", "destroy", "update"],
    {
        create: {
            effectStart: {
                encrypt: EncryptionSchema.single("transaction")
            }
        },
        createMany: {
            effectStart: {
                encrypt: EncryptionSchema.arrayOf("transaction")
            }
        },
        destroy: {},
        update: {
            effectStart: {
                encrypt: EncryptionSchema.single("transaction")
            }
        }
    }
);
