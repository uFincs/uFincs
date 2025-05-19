import {useMemo} from "react";
import {useDateRangeTransactions} from "hooks/";
import {Transaction, TransactionData} from "models/";
import {Id, UTCDateString} from "utils/types";

/** Selects the transactions in the current date range and indexes back by date. */
const useDateRangeTransactionsByDate = (
    id?: Id | undefined
): Record<UTCDateString, Array<TransactionData>> => {
    // Get the transactions in the current interval.
    const transactions = useDateRangeTransactions();

    // Index transactions by date and filter out any that don't pertain to this account.
    const transactionsByDate = useMemo(
        () => Transaction.indexByDate(transactions, id),
        [transactions, id]
    );

    return transactionsByDate;
};

export default useDateRangeTransactionsByDate;
