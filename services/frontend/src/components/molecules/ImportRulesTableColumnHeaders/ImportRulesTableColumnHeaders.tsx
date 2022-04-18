import classNames from "classnames";
import React, {useCallback, useMemo} from "react";
import {TableColumnHeader} from "components/molecules";
import {ImportRule, ImportRuleSortOption} from "models/";
import {TableSortDirection} from "utils/types";
import "./ImportRulesTableColumnHeaders.scss";

const DEFAULT_SORT = "date";

const HEADERS = [
    {id: "date", label: "Updated"},
    {id: "rule", label: "Rule"}
] as const;

interface ImportRulesTableColumnHeadersProps {
    /** Custom class name. */
    className?: string;

    /** Header to sort the table rows by.  */
    sortBy?: ImportRuleSortOption;

    /** The direction to sort the table rows by. */
    sortDirection?: TableSortDirection;

    /** Handler for changing which header to sort by, and with which direction. */
    onSortChange: (sortBy: ImportRuleSortOption, sortDirection: TableSortDirection) => void;
}

/** The column headers for the `ImportRulesTable`. */
const ImportRulesTableColumnHeaders = ({
    className,
    sortBy = DEFAULT_SORT,
    sortDirection = ImportRule.SORT_DEFAULT_DIRECTION[DEFAULT_SORT],
    onSortChange
}: ImportRulesTableColumnHeadersProps) => {
    const onHeaderClick = useCallback(
        (id: ImportRuleSortOption) => () => {
            // Prettier doesn't really format these ternaries nicely.
            // prettier-ignore
            const newSortDirection = sortBy === id ? (
                // When the user clicks on the currently sorted header, flip the direction.
                sortDirection === "asc" ? "desc" : "asc"
            ) : (
                ImportRule.SORT_DEFAULT_DIRECTION[id]
            );

            onSortChange(id, newSortDirection);
        },
        [sortBy, sortDirection, onSortChange]
    );

    const headers = useMemo(
        () =>
            HEADERS.map(({id, label}) => (
                <TableColumnHeader
                    key={id}
                    className={`ImportRulesTableColumnHeaders-${id}`}
                    data-testid={`import-rules-table-column-header-${id}`}
                    isActiveSort={id === sortBy}
                    sortDirection={sortDirection}
                    text={label}
                    onClick={onHeaderClick(id)}
                />
            )),
        [sortBy, sortDirection, onHeaderClick]
    );

    return <tr className={classNames("ImportRulesTableColumnHeaders", className)}>{headers}</tr>;
};

export default ImportRulesTableColumnHeaders;
