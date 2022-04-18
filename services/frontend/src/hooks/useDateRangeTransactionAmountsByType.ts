import {useMemo} from "react";
import {shiftByOneInterval, DateRangeSize} from "hooks/useDateRange";
import {Transaction, TransactionData} from "models/";
import {Id} from "utils/types";
import {useDateRange} from "./useDateRange";
import useDateRangeTransactionsWithSearch from "./useDateRangeTransactionsWithSearch";

const emptyAmountsByTypes = Transaction.calculateAmountsByType([]);

const useCalculateAmountsByType = (
    transactions: Array<TransactionData>,
    accountId: Id | undefined
) => {
    if (accountId) {
        transactions = Transaction.filterByAccountId(transactions, accountId);
    }

    const amounts = Transaction.calculateAmountsByType(transactions);

    // Memoize the amounts on its actual value, so that it retains its reference between,
    // for example, adding a new transaction that doesn't affect the account these amounts
    // are selected for.
    // eslint-disable-next-line
    return useMemo(() => amounts, [JSON.stringify(amounts)]);
};

/** Gets the current sum of amounts for all transactions in the current date range,
 *  along with the sum of amounts in the previous date range interval.
 *
 *  For use with something like the `TransactionTypeFilters`. */
const useDateRangeTransactionAmountsByType = (accountId: Id | undefined) => {
    const {state} = useDateRange();
    const isAllTime = state.rangeSize === DateRangeSize.allTime;

    const previousIntervalState = {...state};
    shiftByOneInterval(previousIntervalState, "backward");

    // Get all transactions, in case the range is All Time.
    const allTimeTransactions = useDateRangeTransactionsWithSearch({
        customStartDate: "",
        customEndDate: ""
    });

    const allTimeAmounts = useCalculateAmountsByType(allTimeTransactions, accountId);

    // Get the current balances for each type.
    const currentTransactions = useDateRangeTransactionsWithSearch();
    const currentAmounts = useCalculateAmountsByType(currentTransactions, accountId);

    // Get the 'From' balances for each type.
    const fromTransactions = useDateRangeTransactionsWithSearch({
        customStartDate: previousIntervalState.startDate,
        customEndDate: previousIntervalState.endDate
    });

    const fromAmounts = useCalculateAmountsByType(fromTransactions, accountId);

    return useMemo(
        () => ({
            currentAmounts: isAllTime ? allTimeAmounts : currentAmounts,
            fromAmounts: isAllTime ? emptyAmountsByTypes : fromAmounts
        }),
        /* eslint-disable */
        [
            isAllTime,
            JSON.stringify(allTimeAmounts),
            JSON.stringify(currentAmounts),
            JSON.stringify(emptyAmountsByTypes),
            JSON.stringify(fromAmounts)
        ]
        /* eslint-enable */
    );
};

export default useDateRangeTransactionAmountsByType;
