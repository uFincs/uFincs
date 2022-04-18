import {useSelector} from "react-redux";
import {TransactionData, TransactionSortOption} from "models/";
import {crossSliceSelectors} from "store/";
import {TransactionsSelector} from "store/types";
import {TableSortDirection} from "utils/types";
import useMapObjectsToIds from "./useMapObjectsToIds";
import usePaginateObjects from "./usePaginateObjects";
import useSortTransactions from "./useSortTransactions";

/** Sorts and paginates the list of transactions before mapping them to IDs.
 *
 *  Useful for transaction tables or lists for performing the final transformations after
 *  all other filtering (e.g. by date, by type, etc) has been performed. */
const useTransformTransactionsList = (
    transactions: Array<TransactionData>,
    transactionsSelector: TransactionsSelector = crossSliceSelectors.transactions
        .selectTransactionsById,
    sortBy: TransactionSortOption = "date",
    sortDirection: TableSortDirection = "desc"
) => {
    const transactionsById = useSelector(transactionsSelector);

    // When sorting by the account names, we need to use the populated transactions instead of the raw
    // transaction data, since only the populated transactions have the accounts present.
    //
    // Otherwise, account-based sorting doesn't work.
    if (sortBy === "from" || sortBy === "to") {
        transactions = transactions.map(({id}) => transactionsById[id]);
    }

    const sorted = useSortTransactions(transactions, sortBy, sortDirection);
    const paginated = usePaginateObjects(sorted);
    const ids = useMapObjectsToIds(paginated);

    return {ids, filteredTransactions: paginated};
};

export default useTransformTransactionsList;
