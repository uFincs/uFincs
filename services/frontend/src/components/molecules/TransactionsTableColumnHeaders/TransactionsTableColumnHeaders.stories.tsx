import React from "react";
import {useTableSorting} from "hooks/";
import {TransactionSortOption} from "models/";
import TransactionsTableColumnHeaders from "./TransactionsTableColumnHeaders";

export default {
    title: "Molecules/Transactions Table Column Headers",
    component: TransactionsTableColumnHeaders
};

/** The compressed view of the `TransactionsTableColumnHeaders` where the From and To accounts
 *  are compressed into one column alongside Description, as a comma separated list. */
export const Compressed = () => {
    const {sortState, onSortChange} = useTableSorting<TransactionSortOption>("date");

    return (
        <TransactionsTableColumnHeaders
            sortBy={sortState.by}
            sortDirection={sortState.direction}
            onSortChange={onSortChange}
        />
    );
};

/** The compressed view of the `TransactionsTableColumnHeaders` with the running balance column
 *  enabled. The Balance column comes after the Amount column. */
export const CompressedWithRunningBalance = () => {
    const {sortState, onSortChange} = useTableSorting<TransactionSortOption>("date");

    return (
        // This uses `TransactionsTable--running-balance` class to force the running balance view.
        <div className="TransactionsTable--running-balance" style={{width: "100%"}}>
            <TransactionsTableColumnHeaders
                enableRunningBalance={true}
                sortBy={sortState.by}
                sortDirection={sortState.direction}
                onSortChange={onSortChange}
            />
        </div>
    );
};

/** The Full view of the `TransactionsTableColumnHeaders` where each header gets its own column. */
export const Full = () => {
    const {sortState, onSortChange} = useTableSorting<TransactionSortOption>("date");

    return (
        // This uses the `TransactionsTable--full` class to force the full view.
        <div className="TransactionsTable--full" style={{width: "100%"}}>
            <TransactionsTableColumnHeaders
                sortBy={sortState.by}
                sortDirection={sortState.direction}
                onSortChange={onSortChange}
            />
        </div>
    );
};

/** The Full view of the `TransactionsTableColumnHeaders` with the running balance column
 *  enabled. The Balance column comes after the To column. */
export const FullWithRunningBalance = () => {
    const {sortState, onSortChange} = useTableSorting<TransactionSortOption>("date");

    return (
        <div
            className="TransactionsTable--full TransactionsTable--running-balance"
            style={{width: "100%"}}
        >
            <TransactionsTableColumnHeaders
                enableRunningBalance={true}
                sortBy={sortState.by}
                sortDirection={sortState.direction}
                onSortChange={onSortChange}
            />
        </div>
    );
};
