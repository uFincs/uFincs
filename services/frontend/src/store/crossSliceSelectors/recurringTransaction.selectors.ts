import {createSelector} from "@reduxjs/toolkit";
import {RecurringTransaction} from "models/";
import {accountsSlice, recurringTransactionsSlice} from "store/slices";
import objectReduce from "utils/objectReduce";
import {Id} from "utils/types";
import {idMap} from "./utils";

const selectRecurringTransactionsById = createSelector(
    [
        recurringTransactionsSlice.selectors.selectRecurringTransactions,
        accountsSlice.selectors.selectAccounts
    ],
    (transactionsById, accountsById) =>
        objectReduce(transactionsById, RecurringTransaction.populateTransaction(accountsById))
);

const selectRecurringTransactions = createSelector([selectRecurringTransactionsById], (byId) =>
    Object.values(byId)
);

const selectRecurringTransaction = (id: Id) =>
    createSelector([selectRecurringTransactionsById], (byId) =>
        idMap<RecurringTransaction>()(id, byId)
    );

// This is used as a 'hack' to re-purpose the `CombinedTransactionsView` to display the
// recurring transactions. We basically just treat each recurring transaction as a regular transaction,
// except the `startDate` is the `date`.
const selectRecurringAsRegularTransactionsById = createSelector(
    [selectRecurringTransactionsById],
    (byId) => objectReduce(byId, RecurringTransaction.convertToRegularTransaction)
);

const selectRecurringAsRegularTransactions = createSelector(
    [selectRecurringTransactions],
    (recurringTransactions) =>
        recurringTransactions.map(RecurringTransaction.convertToRegularTransaction)
);

const selectRecurringAsRegularTransaction = (id: Id) =>
    createSelector([selectRecurringTransactionsById], (byId) =>
        RecurringTransaction.convertToRegularTransaction(byId[id])
    );

const recurringTransactionSelectors = {
    selectRecurringTransactionsById,
    selectRecurringTransactions,
    selectRecurringTransaction,
    selectRecurringAsRegularTransactionsById,
    selectRecurringAsRegularTransactions,
    selectRecurringAsRegularTransaction
};

export default recurringTransactionSelectors;
