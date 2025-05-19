import {useMemo} from "react";
import {useSelector} from "react-redux";
import {shiftByOneInterval, DateRangeSize} from "hooks/useDateRange";
import {Account} from "models/";
import {DateService} from "services/";
import {crossSliceSelectors, State} from "store/";
import {useDateRange} from "./useDateRange";

/** Calculates the complete account balance summaries using the current date range. */
const useDateRangeAccountSummaries = () => {
    const {state} = useDateRange();

    const previousIntervalState = {...state};
    shiftByOneInterval(previousIntervalState, "backward");

    // The 'current changes' represent the sum of all transaction amounts in the current
    // date range. By adding these together with the 'from changes', we can get the accurate
    // balances for each type in the current date range.
    const currentChanges = useSelector((storeState: State) =>
        crossSliceSelectors.accounts.selectBalanceChangesByTypeBetweenDates(
            storeState,
            state.startDate,
            state.endDate
        )
    );

    // The 'from changes' represent the sum of all transaction amounts before the current date
    // range. In particular, these are only used for the Asset and Liability types,
    // since Income and Expense totals are calculated using the 'previous interval changes',
    // found below.
    const fromChanges = useSelector((storeState: State) =>
        crossSliceSelectors.accounts.selectBalanceChangesByTypeBetweenDates(
            storeState,
            "",
            // Need to subtract a day since the selector is date-inclusive, and we don't
            // want to include the current range's start date in the 'from changes'.
            DateService.convertToUTCString(DateService.subtractDays(state.startDate, 1))
        )
    );

    // As stated above, the 'previous interval changes' represent the sum of all transaction
    // amounts in the date range interval before the current interval. These are used
    // for calculating the totals of the Income/Expense types, since they reset
    // interval-to-interval, unlike Assets and Liabilities, which accumulate over time.
    const previousIntervalChanges = useSelector((storeState: State) =>
        crossSliceSelectors.accounts.selectBalanceChangesByTypeBetweenDates(
            storeState,
            previousIntervalState.startDate,
            previousIntervalState.endDate
        )
    );

    // The 'all time changes' are just that: the sum of all transaction amounts from the beginning
    // time up till the present time. These are used when the date is 'All Time', to show the
    // user all the Assets/Liabilities/Income/Expenses they've totalled.
    const allTimeChanges = useSelector((storeState: State) =>
        crossSliceSelectors.accounts.selectBalanceChangesByTypeBetweenDates(storeState, "", "")
    );

    // Since all of the above are 'changes' (i.e. only transaction amount totals), they aren't
    // enough to derive a complete 'balance'. To do that, we need the opening balance
    // for each account. Here, we sum together the opening balances for each Account type,
    // just so that we can add them to the changes more easily.
    const openingBalances = useSelector(crossSliceSelectors.accounts.selectOpeningBalancesByType);

    // And now we combine the opening balances with the 'from changes' and
    // 'previous interval changes' to get the final 'from balances'.
    const fromBalances = useMemo(
        () =>
            ({
                [Account.ASSET]: openingBalances[Account.ASSET] + fromChanges[Account.ASSET],
                [Account.LIABILITY]:
                    openingBalances[Account.LIABILITY] + fromChanges[Account.LIABILITY],
                // Note: Income/Expense accounts don't have an opening balance.
                [Account.INCOME]: previousIntervalChanges[Account.INCOME],
                [Account.EXPENSE]: previousIntervalChanges[Account.EXPENSE]
            }) as typeof fromChanges,
        [fromChanges, openingBalances, previousIntervalChanges]
    );

    // For the 'current balances', we need to use the 'from balances' to derive the accumulated
    // totals for the Assets and Liabilities, whereas Income and Expenses are just the changes.
    const currentBalances = useMemo(
        () =>
            ({
                [Account.ASSET]: fromBalances[Account.ASSET] + currentChanges[Account.ASSET],
                [Account.LIABILITY]:
                    fromBalances[Account.LIABILITY] + currentChanges[Account.LIABILITY],
                [Account.INCOME]: currentChanges[Account.INCOME],
                [Account.EXPENSE]: currentChanges[Account.EXPENSE]
            }) as typeof currentChanges,
        [currentChanges, fromBalances]
    );

    // The 'all time balances' just combines the opening balances with the
    // 'all time changes' to get the complete look at the user's finances.
    const allTimeBalances = useMemo(
        () =>
            ({
                [Account.ASSET]: openingBalances[Account.ASSET] + allTimeChanges[Account.ASSET],
                [Account.LIABILITY]:
                    openingBalances[Account.LIABILITY] + allTimeChanges[Account.LIABILITY],
                // Note: Income/Expense accounts don't have an opening balance.
                [Account.INCOME]: allTimeChanges[Account.INCOME],
                [Account.EXPENSE]: allTimeChanges[Account.EXPENSE]
            }) as typeof allTimeChanges,
        [allTimeChanges, openingBalances]
    );

    // Finally, the 'all time from balances' are just the opening balances for the accounts;
    // obviously, Income and Expense accounts don't have an opening balance, so they are 0.
    const allTimeFromBalances = useMemo(
        () =>
            ({
                [Account.ASSET]: openingBalances[Account.ASSET],
                [Account.LIABILITY]: openingBalances[Account.LIABILITY],
                [Account.INCOME]: 0,
                [Account.EXPENSE]: 0
            }) as typeof allTimeBalances,
        [openingBalances]
    );

    const isAllTime = state.rangeSize === DateRangeSize.allTime;

    return useMemo(
        () => ({
            currentBalances: isAllTime ? allTimeBalances : currentBalances,
            fromBalances: isAllTime ? allTimeFromBalances : fromBalances
        }),
        [allTimeBalances, allTimeFromBalances, currentBalances, fromBalances, isAllTime]
    );
};

export default useDateRangeAccountSummaries;
