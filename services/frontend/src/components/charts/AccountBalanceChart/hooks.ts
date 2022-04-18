import {useMemo} from "react";
import {useSelector} from "react-redux";
import {
    useDateRange,
    useDateRangeAccountStartingBalances,
    useDateRangeTransactionsByDate
} from "hooks/";
import {DateRangeSize} from "hooks/useDateRange";
import {Account, AccountData} from "models/";
import {ChartService, DateService} from "services/";
import {accountsSlice} from "store/";
import {Id, UTCDateString} from "utils/types";

export const useAccountBalanceChart = (id: Id | undefined) => {
    const {state} = useDateRange();
    const isAllTime = state.rangeSize === DateRangeSize.allTime;

    const accountsById = useSelector(accountsSlice.selectors.selectAccounts);
    const account = accountsById?.[id as string] as AccountData | undefined;

    // Get the 'From' balance (which represents the balance from the last period) and the
    // 'Starting' balance (which represents the balance at the start of the current period).
    const {fromBalance, startingBalance} = useDateRangeAccountStartingBalances(id);

    // Get the transactions.
    const transactionsByDate = useDateRangeTransactionsByDate(id);

    // Setup the start and end dates for the data generation.
    let {startDate, endDate} = state;

    // When using all time, we use the account's creation date as the start date,
    // and the current date as the end date.
    if (account && isAllTime) {
        const dates = Object.keys(transactionsByDate) as Array<UTCDateString>;

        // If the first transaction date comes before the account's creation date, use that.
        // Yes, this can happen if users decide to back date transactions.
        if (dates.length && DateService.isLessThan(dates[0], account.createdAt)) {
            startDate = dates[0];
        } else {
            // Otherwise, use the account's creation date.
            startDate = DateService.convertToUTCString(account.createdAt);
        }

        endDate = DateService.getTodayAsUTCString();
    }

    // Generate the data points.
    const data = useMemo(() => {
        if (account) {
            return ChartService.generateDateAmountData({
                amountReducer: Account.balanceReducer(account),
                transactionsByDate,
                startingBalance,
                startDate,
                endDate
            });
        } else {
            return [];
        }
    }, [account, startingBalance, transactionsByDate, startDate, endDate]);

    // Generate a description for the chart for accessibility purposes.
    const description = `A line chart showing the balance of the ${account?.name} account ${
        isAllTime ? "for all time" : `from ${state.startDate} to ${state.endDate}`
    }.`;

    const dateInterval = ChartService.calculateDateInterval(startDate, endDate);

    return {
        account,
        data,
        dateInterval,
        description: account ? description : "",
        fromBalance: account ? fromBalance : 0
    };
};
