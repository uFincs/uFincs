import {useMemo} from "react";
import {Transaction, TransactionData, TransactionSortOption} from "models/";
import {TableSortDirection} from "utils/types";

/** A small wrapper hook for sorting a list of transactions any which way. */
const useSortTransactions = (
    transactions: Array<TransactionData>,
    sortBy: TransactionSortOption = "date",
    sortDirection: TableSortDirection = "desc"
) =>
    useMemo(
        () => Transaction.sort(transactions, sortBy, sortDirection),
        [transactions, sortBy, sortDirection]
    );

export default useSortTransactions;
