import {createSelector} from "@reduxjs/toolkit";
import {preferencesSlice} from "store/slices";
import transactionSelectors from "./transaction.selectors";

/** Combines the plain `showFutureTransactions` flag with whether or not there are actually
 *  _any_ future transactions. For things that care about whether to display or style themselves
 *  differently because of the flag, they _probably_ also care about whether or not there are event
 *  any future transactions to care about. For example, there's no point in having the charts
 *  style future data differently if there aren't any future transactions (but the flag is on by default). */
const selectShowFutureTransactions = createSelector(
    [
        preferencesSlice.selectors.selectShowFutureTransactions,
        transactionSelectors.selectAnyFutureTransactions
    ],
    (showFutureTransactions, anyFutureTransactions) =>
        showFutureTransactions && anyFutureTransactions
);

const preferenceSelectors = {
    selectShowFutureTransactions
};

export default preferenceSelectors;
