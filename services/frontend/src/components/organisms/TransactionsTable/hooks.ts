import {usePaginationNavigation, useTableSorting, useTransformTransactionsList} from "hooks/";
import {TransactionData, TransactionSortOption} from "models/";
import {TransactionsSelector} from "store/";

/** The hook with all of the primary logic of the `TransactionsTable`. */
export const useTransactionsTable = (
    transactions: Array<TransactionData>,
    transactionsSelector: TransactionsSelector
) => {
    const {sortState, onSortChange} = useTableSorting<TransactionSortOption>("date");

    const {ids} = useTransformTransactionsList(
        transactions,
        transactionsSelector,
        sortState.by,
        sortState.direction
    );

    const onKeyDown = usePaginationNavigation();

    return {ids, sortState, onKeyDown, onSortChange};
};
