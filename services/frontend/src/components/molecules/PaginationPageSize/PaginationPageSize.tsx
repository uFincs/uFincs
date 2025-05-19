import classNames from "classnames";
import {useCallback} from "react";
import * as React from "react";
import {SelectInput} from "components/atoms";
import {usePagination} from "hooks/";
import "./PaginationPageSize.scss";

const PAGE_SIZE_OPTIONS = [
    {label: "25", value: "25"},
    {label: "50", value: "50"},
    {label: "100", value: "100"},
    {label: "200", value: "200"},

    // We use a large number to denote 'all' just so that we don't need to
    // update all of the logic to support an extra special case.
    //
    // Why 10 million? Cause it's big.
    {label: "all", value: "10000000"}
];

interface PaginationPageSizeProps {
    /** Custom class name. */
    className?: string;
}

/** Controls the number of items in a single page for paginated contexts. */
const PaginationPageSize = ({className}: PaginationPageSizeProps) => {
    const {state, dispatch} = usePagination();

    const onChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            dispatch.setPageSize(parseInt(e.target.value));
        },
        [dispatch]
    );

    return (
        <div className={classNames("PaginationPageSize", className)}>
            <SelectInput
                data-testid="pagination-page-size"
                aria-label="Pagination Page Size"
                title="Pagination Page Size"
                value={state.pageSize}
                values={PAGE_SIZE_OPTIONS}
                onChange={onChange}
            />
        </div>
    );
};

export default PaginationPageSize;
