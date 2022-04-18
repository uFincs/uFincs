import classNames from "classnames";
import React, {useCallback, useMemo} from "react";
import {TableColumnHeader} from "components/molecules";
import {Transaction, TransactionSortOption} from "models/";
import {TableSortDirection} from "utils/types";
import "./TransactionsTableColumnHeaders.scss";

const DEFAULT_SORT = "date";

// Need two sets for the header data so that we can ensure that the DOM order matches the visual
// order. Since we do some fancy CSS grid re-ordering in the compressed view (here, with HEADERS),
// that means we need to change the DOM order to match in order for the tab index to match.
const HEADERS = [
    {id: "type", label: ""},
    {id: "date", label: "Date"},
    {id: "description", label: "Description"},
    {id: "from", label: "From"},
    {id: "to", label: "To"},
    {id: "amount", label: "Amount"},
    {id: "actions", label: ""}
] as const;

const HEADERS_WITH_RUNNING_BALANCE = [
    ...HEADERS.slice(0, 6),
    {id: "balance", label: "Balance"},
    HEADERS[6]
] as const;

const HEADERS_LARGE = [
    {id: "type", label: ""},
    {id: "date", label: "Date"},
    {id: "description", label: "Description"},
    {id: "amount", label: "Amount"},
    {id: "from", label: "From"},
    {id: "to", label: "To"},
    {id: "actions", label: ""}
] as const;

const HEADERS_WITH_RUNNING_BALANCE_LARGE = [
    ...HEADERS_LARGE.slice(0, 6),
    {id: "balance", label: "Balance"},
    HEADERS_LARGE[6]
] as const;

const determineHeaders = (isLargeWidth: boolean, enableRunningBalance: boolean = false) => {
    if (isLargeWidth) {
        if (enableRunningBalance) {
            return HEADERS_WITH_RUNNING_BALANCE_LARGE;
        } else {
            return HEADERS_LARGE;
        }
    } else {
        if (enableRunningBalance) {
            return HEADERS_WITH_RUNNING_BALANCE;
        } else {
            return HEADERS;
        }
    }
};

interface TransactionsTableColumnHeadersProps {
    /** Custom class name. */
    className?: string;

    /** Whether or not to enable the 'Balance' (i.e. running balance) column. */
    enableRunningBalance?: boolean;

    /** Whether or not to use the 'large' layout. */
    isLargeWidth?: boolean;

    /** Whether or not the transactions being displayed are recurring transactions.
     *  Currently, this is only relevant for the `TransactionsTable` to change the `Date` column
     *  label to `Start Date`. */
    isRecurringTransactions?: boolean;

    /** Header to sort the table rows by.  */
    sortBy?: TransactionSortOption;

    /** The direction to sort the table rows by. */
    sortDirection?: TableSortDirection;

    /** Handler for changing which header to sort by, and with which direction. */
    onSortChange: (sortBy: TransactionSortOption, sortDirection: TableSortDirection) => void;
}

/** The headers for the `TransactionsTable`. Changes the order/layout of the columns depending
 *  on how large the table is.  */
const TransactionsTableColumnHeaders = ({
    className,
    enableRunningBalance = false,
    isLargeWidth = true,
    isRecurringTransactions = false,
    sortBy = DEFAULT_SORT,
    sortDirection = Transaction.SORT_DEFAULT_DIRECTION[DEFAULT_SORT],
    onSortChange
}: TransactionsTableColumnHeadersProps) => {
    const onHeaderClick = useCallback(
        (id: TransactionSortOption | "type" | "actions" | "balance") => () => {
            // The type and actions 'columns' don't have headers and thus shouldn't
            // be sortable; ignore them. Additionally, there's no point in allowing sorting by
            // running balance, since it's just tied to the date, so it shouldn't be sortable.
            if (id !== "type" && id !== "actions" && id !== "balance") {
                // Prettier doesn't really format these ternaries nicely.
                // prettier-ignore
                const newSortDirection = sortBy === id ? (
                    // When the user clicks on the currently sorted header, flip the direction.
                    sortDirection === "asc" ? "desc" : "asc"
                ) : (
                    Transaction.SORT_DEFAULT_DIRECTION[id]
                );

                onSortChange(id, newSortDirection);
            }
        },
        [sortBy, sortDirection, onSortChange]
    );

    const headers = useMemo(
        () =>
            determineHeaders(isLargeWidth, enableRunningBalance).map(({id, label}) => (
                <TableColumnHeader
                    key={id}
                    className={`TransactionsTableColumnHeaders-${id}`}
                    data-testid={`transactions-table-column-header-${id}`}
                    disableSort={id === "type" || id === "actions" || id === "balance"}
                    isActiveSort={id === sortBy}
                    sortDirection={sortDirection}
                    // TECH DEBT:
                    // Yes, it's kinda hacky that we implement the label as just a conditional here,
                    // but it works!
                    text={isRecurringTransactions && label === "Date" ? "Start Date" : label}
                    onClick={onHeaderClick(id)}
                />
            )),
        [
            enableRunningBalance,
            isLargeWidth,
            isRecurringTransactions,
            sortBy,
            sortDirection,
            onHeaderClick
        ]
    );

    return <tr className={classNames("TransactionsTableColumnHeaders", className)}>{headers}</tr>;
};

export default TransactionsTableColumnHeaders;
