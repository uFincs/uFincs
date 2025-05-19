import {createSelector, PayloadAction} from "@reduxjs/toolkit";
import {Account, AccountData, TransactionData} from "models/";
import mounts from "store/mountpoints";
import {State} from "store/types";
import {
    createOfflineRequestSlices,
    createSliceWithSelectors,
    crudSliceReducerFactory
} from "store/utils";
import objectReduce from "utils/objectReduce";
import {Id} from "utils/types";
import {EncryptionSchema} from "vendor/redux-e2e-encryption";

/* State */

interface AccountsSliceState {
    [id: string]: AccountData;
}

const initialState: AccountsSliceState = {};

/* Selectors */

const selectState = (state: State): AccountsSliceState => state[mounts.accounts];

const selectAccount = createSelector(
    [selectState, (_: any, id: string) => id],
    (accountsById, id) => accountsById[id]
);

const selectAccountsByType = createSelector([selectState], (accountsById) =>
    Account.categorizeByType(accountsById)
);

const selectSortedAccountsByType = createSelector([selectAccountsByType], (accountsByType) =>
    objectReduce(accountsByType, (accounts) => accounts.sort(Account.nameSortAsc))
);

const selectors = {
    selectAccounts: selectState,
    selectAccount,
    selectAccountsByType,
    selectSortedAccountsByType
};

/* Slice Helper Functions */

const addTransactionToAccount =
    (accountIdProperty: "creditAccountId" | "debitAccountId") =>
    (state: AccountsSliceState, action: PayloadAction<TransactionData>) => {
        // Expects a Transaction object as the payload
        const {id, [accountIdProperty]: accountId} = action.payload;

        if (state[accountId]) {
            state[accountId] = {...state[accountId]};

            // Make sure transactions don't get added multiple times.
            if (!state[accountId].transactionIds.includes(id)) {
                state[accountId].transactionIds = [...state[accountId].transactionIds, id];
            }
        }

        return state;
    };

const addTransactionToAccounts = (
    state: AccountsSliceState,
    action: TransactionData | PayloadAction<TransactionData>
) => {
    // Expects a Transaction object as the payload
    action = "payload" in action ? action : {type: "", payload: action};

    state = addTransactionToAccount("creditAccountId")(state, action);
    return addTransactionToAccount("debitAccountId")(state, action);
};

const removeTransactionFromAccount =
    (accountIdProperty: "creditAccountId" | "debitAccountId") =>
    (state: AccountsSliceState, action: PayloadAction<TransactionData>) => {
        // Expects a Transaction object as the payload
        const {id, [accountIdProperty]: accountId} = action.payload;

        if (state[accountId]) {
            state[accountId] = {...state[accountId]};
            state[accountId].transactionIds = state[accountId].transactionIds.filter(
                (existingId: Id) => existingId !== id
            );
        }

        return state;
    };

const removeTransactionFromAccounts = (
    state: AccountsSliceState,
    action: TransactionData | PayloadAction<TransactionData>
) => {
    action = "payload" in action ? action : {type: "", payload: action};

    state = removeTransactionFromAccount("creditAccountId")(state, action);
    return removeTransactionFromAccount("debitAccountId")(state, action);
};

/* Slice */

export const accountsSlice = createSliceWithSelectors({
    name: mounts.accounts,
    initialState,
    reducers: {
        ...crudSliceReducerFactory<AccountsSliceState, AccountData>(),

        addTransactionToAccounts: (
            state: AccountsSliceState,
            action: PayloadAction<TransactionData>
        ) => addTransactionToAccounts({...state}, action),

        addTransactionsToAccounts: (
            state: AccountsSliceState,
            action: PayloadAction<Array<TransactionData>>
        ) => action.payload.reduce(addTransactionToAccounts, {...state}),

        removeTransactionFromAccounts: (
            state: AccountsSliceState,
            action: PayloadAction<TransactionData>
        ) => removeTransactionFromAccounts({...state}, action),

        /* Saga Only Actions */
        undoableDestroyAccount: (state: AccountsSliceState, _action: PayloadAction<Id>) => state
    },
    selectors
});

/* Requests Slice */

export const accountsRequestsSlice = createOfflineRequestSlices(
    mounts.accountsRequests,
    ["create", "createMany", "destroy", "fetchAll", "update"],
    {
        create: {
            effectStart: {
                encrypt: EncryptionSchema.single("account")
            }
        },
        createMany: {
            effectStart: {
                encrypt: EncryptionSchema.arrayOf("account")
            }
        },
        destroy: {},
        fetchAll: {},
        update: {
            effectStart: {
                encrypt: EncryptionSchema.single("account")
            }
        }
    }
);
