import {useMemo} from "react";
import {useDateRange, useDateRangeAccountSummaries} from "hooks/";
import {useDateRangeTransactionsByDate} from "hooks/";
import {DateRangeSize} from "hooks/useDateRange";
import {Account} from "models/";
import {ChartService, DateService} from "services/";
import {UTCDateString} from "utils/types";

export const useNetWorthChart = () => {
    const {state} = useDateRange();
    const isAllTime = state.rangeSize === DateRangeSize.allTime;

    // Get the transactions.
    const transactionsByDate = useDateRangeTransactionsByDate();

    // Get the from balances to calculate the starting balance.
    const {fromBalances} = useDateRangeAccountSummaries();
    const startingBalance = useMemo(() => Account.calculateNetWorth(fromBalances), [fromBalances]);

    // Setup the start and end dates for the data generation.
    let {startDate, endDate} = state;

    // When using all time, we use the first transaction as the start date
    // and the current date as the end date.
    if (isAllTime) {
        startDate =
            (Object.keys(transactionsByDate) as Array<UTCDateString>)[0] ||
            // Need a default in case there aren't any transactions yet
            // (e.g. when the app first loads).
            ("1970-01-01" as UTCDateString);

        endDate = DateService.getTodayAsUTCString();
    }

    // Generate the data points.
    const data = useMemo(() => {
        return ChartService.generateDateAmountData({
            amountReducer: Account.netWorthReducer,
            transactionsByDate,
            startingBalance,
            startDate,
            endDate
        });
    }, [transactionsByDate, startingBalance, startDate, endDate]);

    // Generate a description for the chart for accessibility purposes.
    const description = `A line chart showing net worth ${
        isAllTime ? "for all time" : `from ${state.startDate} to ${state.endDate}`
    }.`;

    const dateInterval = ChartService.calculateDateInterval(startDate, endDate);

    return {
        data,
        dateInterval,
        description,
        fromAmount: startingBalance
    };
};
