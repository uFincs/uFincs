import {useCallback, useEffect, useRef, useState} from "react";
import {useOnWindowResize} from "hooks/";

/** Hook for getting the width of a 'container' element. */
const useContainerWidth = (defaultWidth: number = 0) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(defaultWidth);

    const updateWidth = useCallback(
        () => setWidth(containerRef.current?.getBoundingClientRect().width || defaultWidth),
        [defaultWidth]
    );

    // Need to fire once after mounting to establish the baseline width.
    useEffect(() => {
        // setTimeout hack is so that the container reads the right width, specifically
        // for the Account Balance Chart when switching to the Accounts page from another page.
        // I don't know; it works.
        setTimeout(() => {
            updateWidth();
        }, 0);
    }, [updateWidth]);

    // Need a fairly low throttle time to minimize render jank.
    // Specifically for something like a chart, this matters because it'll want try to resize
    // the height (to preserve the aspect ratio) if the width isn't update fast enough.
    useOnWindowResize(updateWidth, "throttle", 30);

    return {containerRef, width};
};

export default useContainerWidth;
