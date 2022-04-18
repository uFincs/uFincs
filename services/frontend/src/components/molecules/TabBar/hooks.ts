import {useCallback, useEffect, useRef, useState} from "react";
import {useForceRerender, useOnWindowResize} from "hooks/";
import {navigationBreakpointMatches} from "utils/mediaQueries";
import {tabBarSpacing} from "utils/parsedStyles";

export const useTabUnderline = (
    numberOfTabs: number,
    activeTab: number,
    tabRefs: React.MutableRefObject<Array<React.RefObject<any>>>
) => {
    // Need a ref to the container to its width.
    const containerRef = useRef<HTMLUListElement>(null);

    const [underlineStyle, setUnderlineStyle] = useState({});

    const [mounted, setMounted] = useState(false);
    const forceRerender = useForceRerender();

    // Due to an edge case/race condition, the resize callback can be called while the component is
    // unmounted, resulting in the 'memory leak' error (i.e. setState called on unmounted component error).
    // As such, we 'get around' it by making sure the component is mounted (through the ref) before
    // calling setState.
    //
    // Although, I'm pretty sure this doesn't actually remove the 'memory leak', but eh, good enough...
    const forceRerenderWithoutMemoryLeak = useCallback(() => {
        if (containerRef.current) {
            forceRerender();
        }
    }, [forceRerender]);

    // This is so that the component renders again right after it has mounted,
    // so that the transform style of the underline can be correctly calculated.
    // We can't exactly determine where to position it before the component
    // has mounted because we don't have any width values before rendering (duh).
    useEffect(() => {
        setMounted(true);
    }, []);

    // This is a 'hack' to force the TabBar to rerender after the window resizes,
    // so that the underline styles get recomputed. This is only really relevant
    // when going from mobile view to desktop view.
    //
    // Without this, the underline just takes up the full width of the TabBar when
    // going mobile -> desktop.
    useOnWindowResize(forceRerenderWithoutMemoryLeak);

    // This computes the transforms for the underline, by calculating the translation and
    // scaling amounts based on widths of the tabs themselves and the total container width.
    //
    // translate = X position from the left side of the container (i.e. which tab to underline)
    // scale = size (width) of the tab to underline
    useEffect(() => {
        let style = {};

        // The mounted check is so that the underline doesn't initially appear
        // as a full underline of the entire tab bar. If we only show it once the
        // component has mounted, then it isn't as much of a visual distraction to the user.
        //
        // The rest is just some boundary checking.
        if (!mounted || activeTab < 0 || activeTab >= numberOfTabs) {
            style = {display: "none"};
        } else {
            // Use `getBoundingClientRect().width` over `offsetWidth` because the former has greater
            // precision (i.e. decimal places) than the latter.
            const containerWidth = containerRef.current?.getBoundingClientRect().width || 0;

            const tabWidths = tabRefs.current.map(
                (ref) => ref.current?.getBoundingClientRect().width || 0
            );

            // This is essentially doing an `x in range(activeTab)` operation.
            // For reference, https://stackoverflow.com/a/10050831.
            const translate =
                [...Array(activeTab).keys()].reduce((acc, _, index) => {
                    return acc + tabWidths[index] + tabBarSpacing;
                }, 0) + 1; // It needs an extra 1px to be perfectly centered.

            const scale = tabWidths[activeTab] / containerWidth;

            style = {transform: `translateX(${translate}px) scaleX(${scale})`};
        }

        // Note: The underline style is computed and stored in state now, as opposed to the old
        // way where it was just computed each render without `useEffect`.
        //
        // This seems to fix an issue where the computed style seems to be 'off by 1', i.e.
        // the underline would require an extra render (computation) to be in the right spot.
        //
        // This was found to happen with the Current/Recurring tabs of the Transactions page whenever
        // switching into the page from another page (but not when refreshing). Very strange.
        setUnderlineStyle(style);

        // We want to re-compute the underline style when the navigation breakpoint changes,
        // since the length of the label might change, so the length of the underline should change
        // accordingly.
        //
        // eslint-disable-next-line
    }, [numberOfTabs, activeTab, tabRefs, mounted, navigationBreakpointMatches()]);

    return {
        containerRef,
        tabRefs,
        underlineStyle
    };
};
