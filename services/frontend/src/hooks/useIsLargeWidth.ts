import {useCallback, useLayoutEffect, useRef, useState} from "react";
import {useOnWindowResize} from "hooks/";

/** A hook that basically simulates media queries on an element's width, instead of the
 *  screen's width. This hook merely checks whether an element has surpassed a certain
 *  width and returns the result (hence, `isLargeWidth`).
 *
 *  It also updates whenever the window size changes, to try and mimic normal media queries. */
const useIsLargeWidth = <T extends HTMLElement>(largeWidthBreakpoint: number) => {
    const [isLargeWidth, setIsLargeWidth] = useState(false);
    const containerRef = useRef<T | null>(null);
    const width = containerRef.current?.getBoundingClientRect().width;

    const resizeTable = useCallback(() => {
        // Only update the state if the container actually exists. Otherwise, it could end up performing
        // a state update on an unmounted component, which React is _not_ happy about.
        if (containerRef.current) {
            const newWidth = containerRef.current?.getBoundingClientRect().width;
            setIsLargeWidth(!!newWidth && newWidth > largeWidthBreakpoint);
        }

        // We're using width in the dependencies list as a cache-busting argument so that
        // resizeTable re-runs whenever the table itself renders (at a different width).
        //
        // This is relevant, for example, now that date ranges have been implemented.
        // If the table renders the empty area first (due to no transactions), then it'll
        // have 0 width, so it won't be large width.
        //
        // But once it _does_ render some transactions, then it'll be large width, but since
        // the window size didn't change, resizeTable won't be triggered.
        //
        // So we get around this by adding another mechanism for triggering the resize; in effect,
        // width allows us to proxy the number transactions without passing them in.
        //
        // eslint-disable-next-line
    }, [containerRef, largeWidthBreakpoint, width, setIsLargeWidth]);

    useLayoutEffect(() => {
        // IDK man. When rendering the `TransactionsTable` in a `TabBarWithSections`, the width
        // is always read as the wrong value on the first render, resulting in the wrong
        // layout being used. I guess waiting for the next event loop gives it enough time to finish
        // rendering (since the tab bar has animations) that it gets the right width. Oh well, it works.
        setTimeout(() => {
            resizeTable();
        }, 0);
    }, [resizeTable]);

    // Use throttle instead of debounce to get closer to the native media query experience.
    useOnWindowResize(resizeTable, "throttle");

    return {isLargeWidth, containerRef};
};

export default useIsLargeWidth;
