import {createSelector} from "@reduxjs/toolkit";
import {createCachedSelector} from "re-reselect";
import {Transaction, TransactionData} from "models/";
import {SearchService} from "services/";
import {
    accountsSlice,
    preferencesSlice,
    transactionsSlice,
    transactionsDateIndexSlice,
    transactionsIndexSlice,
    virtualTransactionsSlice
} from "store/slices";
import {State} from "store/types";
import objectReduce from "utils/objectReduce";
import {Id} from "utils/types";
import transactionsDateIndexSelectors from "./transactionsDateIndex.selectors";
import {idMap, idsMap} from "./utils";
import virtualTransactionSelectors from "./virtualTransaction.selectors";

// Memoize the concrete transactionsById separately from the combined concrete + virtual,
// for performance reasons. This way, transactions aren't re-populated whenever the virtual
// transactions change.
const selectRawTransactionsById = createSelector(
    [transactionsSlice.selectors.selectTransactions, accountsSlice.selectors.selectAccounts],
    (transactionsById, accountsById) =>
        objectReduce(transactionsById, Transaction.populateTransaction(accountsById))
);

const selectTransactionsById = createSelector(
    [
        selectRawTransactionsById,
        virtualTransactionSelectors.selectVirtualTransactionsById,
        preferencesSlice.selectors.selectShowFutureTransactions
    ],
    (transactionsById, virtualTransactionsById, showFutureTransactions) => {
        if (!showFutureTransactions) {
            return transactionsById;
        } else {
            return {...transactionsById, ...virtualTransactionsById};
        }
    }
);

const selectTransactions = createSelector([selectTransactionsById], (byId) => Object.values(byId));

const selectTransaction = (id: Id) =>
    createSelector([selectTransactionsById], (byId) => idMap<Transaction>()(id, byId));

const selectTransactionsBetweenDates = createCachedSelector(
    [
        transactionsDateIndexSelectors.selectBetweenDates,
        // Use the un-populated transactions primarily as a performance optimization.
        // This way, the output transactions won't have their accounts on them, which means there'll
        // be fewer re-computations as a result of the transactions themselves being added to the
        // transaction IDs lists.
        //
        // This works perfectly fine since all downstream calculations only requires the Transaction data
        // itself (mainly types, amounts, and dates) and not their associated accounts.
        transactionsSlice.selectors.selectTransactions,
        virtualTransactionSelectors.selectVirtualTransactionsBetweenDates,
        preferencesSlice.selectors.selectShowFutureTransactions
    ],
    (transactionIds, transactionsById, virtualTransactions, showFutureTransactions) => {
        const transactions = idsMap<TransactionData>()(transactionIds, transactionsById);

        if (showFutureTransactions) {
            transactions.push(...virtualTransactions);
        }

        return transactions;
    }
)((_, startDate, endDate) => `${startDate}-${endDate}`);

// "any future transactions" = "any future transactions?" aka, boolean
const selectAnyFutureTransactions = createSelector(
    [
        transactionsDateIndexSlice.selectors.selectFuture,
        virtualTransactionsSlice.selectors.selectVirtualTransactionsList
    ],
    (futureTransactions, virtualTransactions) =>
        futureTransactions.length > 0 || virtualTransactions.length > 0
);

// This is a selector factory; it generates the selector needed for searching the transactions.
// It is a factory so that it can be memoized correctly at the consumer level;
// see https://react-redux.js.org/next/api/hooks#using-memoizing-selectors for more details.
const makeSearchTransactionsSelector = (keepLatestDuplicateTransaction: boolean = true) =>
    createSelector(
        [
            transactionsIndexSlice.selectors.searchBigrams,
            transactionsIndexSlice.selectors.searchWords,
            selectTransactionsById,
            (_: State, query: string) => query
        ],
        (bigramIds, wordIds, byId, query) => {
            const bigramTransactions = bigramIds
                .map((id) => idMap<Transaction>()(id, byId))
                .filter((transaction) =>
                    SearchService.stringStartsWithQuery(transaction?.description, query)
                );

            const wordTransactions = idsMap<Transaction>()(wordIds, byId);

            return SearchService.orderTransactions(
                [...bigramTransactions, ...wordTransactions],
                keepLatestDuplicateTransaction
            );
        }
    );

const selectTransactionsByRecurringTransactionId = createSelector(
    [transactionsSlice.selectors.selectTransactionsList],
    Transaction.indexByRecurringTransaction
);

const selectTransactionsForRecurringTransaction = (id: Id) =>
    createSelector([transactionsSlice.selectors.selectTransactionsList], (transactions) =>
        transactions.filter(({recurringTransactionId}) => recurringTransactionId === id)
    );

const transactionSelectors = {
    selectTransaction,
    selectTransactions,
    selectRawTransactionsById,
    selectTransactionsById,
    selectTransactionsBetweenDates,
    selectAnyFutureTransactions,
    makeSearchTransactionsSelector,
    selectTransactionsByRecurringTransactionId,
    selectTransactionsForRecurringTransaction
};

export default transactionSelectors;
