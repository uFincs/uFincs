import {useLayoutEffect, useRef, useState} from "react";
import {useOnWindowResize} from "hooks/";

/** This hook essentially just tries to replicate CSS media queries by returning a true/false
 *  value that indicates whether or not the breakpoint (as specified by arbitrary function
 *  `breakpointMatcher`) has been met.
 *
 *  In general, in this 'arbitrary' function would be one of the functions from `utils/mediaQueries`. */
const useWindowWidthBreakpoint = (breakpointMatcher: () => boolean) => {
    const mountedRef = useRef(false);
    const [matchesBreakpoint, setMatchesBreakpoint] = useState(false);

    useLayoutEffect(() => {
        // Need to run it once after mounting to get the right right size for the first render.
        setMatchesBreakpoint(breakpointMatcher());

        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
        };
    }, [breakpointMatcher]);

    useOnWindowResize(() => {
        // There appears to a minor edge case where this callback is called while the component
        // is unmounted, resulting in one of those 'memory leak' errors that React puts out.
        // As such, to make sure we can't at least call setState on an unmounted component,
        // we add the mounted guard.
        if (mountedRef.current) {
            setMatchesBreakpoint(breakpointMatcher());
        }
    }, "throttle");

    return matchesBreakpoint;
};

export default useWindowWidthBreakpoint;
