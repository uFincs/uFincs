import {createSelector} from "@reduxjs/toolkit";
import {createCachedSelector} from "re-reselect";
import {Transaction} from "models/";
import {accountsSlice, recurringTransactionsSlice, virtualTransactionsSlice} from "store/slices";
import {State} from "store/types";
import {VirtualTransactions} from "structures/";
import objectReduce from "utils/objectReduce";

const selectVirtualTransactionsById = createSelector(
    [
        virtualTransactionsSlice.selectors.selectVirtualTransactions,
        accountsSlice.selectors.selectAccounts
    ],
    (transactionsById, accountsById) =>
        objectReduce(
            transactionsById,
            // Because virtual transactions are only ever created by us, we can disable the date checks
            // to get a fairly significant speedup when dealing with thousands upon thousands of
            // virtual transactions (75ms -> 15ms for this selector with ~13000 virtual transactions).
            Transaction.populateTransaction(accountsById, {disableDateChecks: true})
        )
);

const selectVirtualTransactionsBetweenDates = createCachedSelector(
    [
        virtualTransactionsSlice.selectors.selectState,
        recurringTransactionsSlice.selectors.selectRecurringTransactionsList,
        (_: State, startDate: string) => startDate,
        (_: State, __: any, endDate: string) => endDate
    ],
    VirtualTransactions.findBetween
)((_, startDate, endDate) => `${startDate}-${endDate}`);

const virtualTransactionSelectors = {
    selectVirtualTransactionsById,
    selectVirtualTransactionsBetweenDates
};

export default virtualTransactionSelectors;
