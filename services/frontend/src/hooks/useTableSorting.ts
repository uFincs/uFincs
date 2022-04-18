import {useCallback, useState} from "react";
import {TableSortDirection} from "utils/types";

interface SortState<T> {
    /** Which column to sort by. */
    by: T;

    /** Which direction to sort by. */
    direction: TableSortDirection;
}

/** Hook for managing the sort state of a table. */
export const useTableSorting = <T>(
    defaultColumn: T,
    defaultDirection: TableSortDirection = "desc"
) => {
    const [sortState, setSortState] = useState<SortState<T>>({
        by: defaultColumn,
        direction: defaultDirection
    });

    const onSortChange = useCallback(
        (by: T, direction: TableSortDirection) => {
            setSortState({by, direction});
        },
        [setSortState]
    );

    return {sortState, onSortChange};
};

export default useTableSorting;
