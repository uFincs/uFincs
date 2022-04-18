import {createCachedSelector} from "re-reselect";
import {preferencesSlice, transactionsDateIndexSlice} from "store/slices";
import {State} from "store/types";
import {DateIndex} from "structures/";

// Because we can be querying many different date ranges, we want to cache based on the dates
// using re-reselect.
//
// Otherwise, if we use just a regularly cached selector and flip flop between two dates,
// we end up with no caching whatsoever.
//
// Every selector that uses this selector needs to be similarly cached.
const selectBetweenDates = createCachedSelector(
    [
        transactionsDateIndexSlice.selectors.selectDateIndex,
        (_: State, startDate: string) => startDate,
        (_: State, __: any, endDate: string) => endDate,
        preferencesSlice.selectors.selectShowFutureTransactions
    ],
    DateIndex.findBetweenWithFutureLimit
)((_, startDate, endDate) => `${startDate}-${endDate}`);

const transactionsDateIndexSelectors = {
    selectBetweenDates
};

export default transactionsDateIndexSelectors;
