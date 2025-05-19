import classNames from "classnames";
import {IntervalSwitcher, TextField} from "components/atoms";
import {useKeyboardNavigation, usePagination} from "hooks/";
import {MathUtils} from "services/";
import "./PaginationSwitcher.scss";

interface PaginationSwitcherProps {
    /** Custom class name. */
    className?: string;
}

/** A switcher for changing the pages of .. something. Since this component
 *  leverages React context for the pagination state, whatever _uses_ the pages is
 *  completely separate from this component. */
const PaginationSwitcher = ({className}: PaginationSwitcherProps) => {
    const {
        state: {currentPage, totalPages},
        dispatch: {decrementPage, incrementPage, gotoFirstPage, gotoLastPage}
    } = usePagination();

    const onKeyDown = useKeyboardNavigation({
        onFirst: gotoFirstPage,
        onLast: gotoLastPage,
        onPrevious: decrementPage,
        onNext: incrementPage,
        reverseUpDown: true
    });

    // Make the pages 1-indexed for display purposes.
    const pageLabel = `${MathUtils.indexBy1(currentPage)} of ${MathUtils.indexBy1(totalPages)}`;

    return (
        <IntervalSwitcher
            className={classNames("PaginationSwitcher", className)}
            role="navigation"
            aria-label="Pagination Navigation"
            onKeyDown={onKeyDown}
            decrementButtonProps={{
                disabled: currentPage === 0,
                title: "Go to Previous Page",
                onClick: decrementPage
            }}
            incrementButtonProps={{
                disabled: currentPage === totalPages,
                title: "Go to Next Page",
                onClick: incrementPage
            }}
        >
            <TextField className="PaginationSwitcher-text" title={`Page ${pageLabel}`}>
                {pageLabel}
            </TextField>
        </IntervalSwitcher>
    );
};

export default PaginationSwitcher;
