import classNames from "classnames";
import {TextField} from "components/atoms";
import {usePagination} from "hooks/";
import {MathUtils} from "services/";
import "./PaginationSummary.scss";

interface PaginationSummaryProps {
    /** Custom class name. */
    className?: string;

    /** Name of the items being paginated. For example, 'transactions'. */
    itemName: string;
}

/** Presents a summary of the current pagination summary. That is, a short text snippet
 *  showing which slice of items the current page represents, out of the total number of items.
 */
const PaginationSummary = ({className, itemName = ""}: PaginationSummaryProps) => {
    const {
        state: {currentPage, pageSize, totalItems}
    } = usePagination();

    // Index by 1 for display purposes, except when there aren't any items at all.
    const sliceStart = totalItems === 0 ? 0 : MathUtils.indexBy1(currentPage * pageSize);

    // Need to bound it by the totalItems so that it doesn't exceed it.
    const sliceEnd = Math.min(totalItems, (currentPage + 1) * pageSize);

    const label = `${sliceStart} - ${sliceEnd} of ${totalItems} ${itemName}`;

    return <TextField className={classNames("PaginationSummary", className)}>{label}</TextField>;
};

export default PaginationSummary;
