import {useMemo} from "react";
import {useKeyboardNavigation, usePagination} from "hooks/";

/** A helper function that wraps a pagination callback so that
 *  rows maintain their focus between page changes. */
const maintainRowFocus = (navCallback: () => void) => () => {
    // Yes, we're being cheaty here by just storing the index state in the DOM, but I figured
    // it'd be easier than managing a giant list of refs.

    // Get the index of the active row.
    const index = document.activeElement?.getAttribute("data-index");

    navCallback();

    // Need to use setTimeout 0 so that the row re-focus happens on the next event loop.
    // Basically, so that the focus happens after the page has already changed and rendered.
    // Otherwise, it happens before (or during) the page render, and the focus doesn't do anything.
    setTimeout(() => {
        const row: any = document.querySelector(`[data-index='${index}']`);

        if (row) {
            // Focus onto the same index in the new page.
            row?.focus();
        } else {
            // Focus onto the first row if the old index doesn't exist in the new page.
            (document.querySelector("[data-index]") as any)?.focus();
        }
    }, 0);
};

/** Hook for generating the keyboard handler for something like a table to enable pagination navigation. */
const usePaginationNavigation = () => {
    const {
        dispatch: {decrementPage, incrementPage, gotoFirstPage, gotoLastPage}
    } = usePagination();

    const onFirst = useMemo(() => maintainRowFocus(gotoFirstPage), [gotoFirstPage]);
    const onLast = useMemo(() => maintainRowFocus(gotoLastPage), [gotoLastPage]);
    const onNext = useMemo(() => maintainRowFocus(incrementPage), [incrementPage]);
    const onPrevious = useMemo(() => maintainRowFocus(decrementPage), [decrementPage]);

    const onKeyDown = useKeyboardNavigation({
        onFirst,
        onLast,
        onNext,
        onPrevious,
        disableKeys: {up: true, down: true}
    });

    return onKeyDown;
};

export default usePaginationNavigation;
