import {useEffect, useRef} from "react";
import {useSpring} from "react-spring";
import {useScroll} from "react-use-gesture";

/** Hook that uses `react-spring` to enable an animated 'hide on scroll' effect.
 *
 *  The returned value is a `SpringValue`, so it must be passed as a style or interpolated into
 *  one on an `animated` element. */
const useHideOnScroll = ({translateAmount}: {translateAmount: number}) => {
    const routerRef = useRef<HTMLElement | null>(null);
    const [{y}, set] = useSpring(() => ({y: 0}));

    const bind = useScroll(
        ({xy: [, y], direction: [_, yDirection]}) => {
            // Need to make sure the scroll position is positive, to account for the stupid 'overflow bounce'
            // that Safari/Chrome do in iOS. This way, users can just slam scroll to the top without having
            // the item hide away.
            if (y > 0) {
                set({y: yDirection < 0 ? 0 : translateAmount});
            }
        },
        {
            domTarget: routerRef
        }
    );

    useEffect(() => {
        // Just like in `useScrollToTopOn`, we need to use the AppRouter as the scrolling
        // container, as opposed to window or document.
        routerRef.current = document.getElementById("AppRouter");
    }, []);

    // Using useEffect to bind the handlers doesn't seem to be mentioned in the docs (anymore),
    // but it _is_ mentioned by https://stackoverflow.com/a/60558948.
    // @ts-expect-error Seems like TypeScript doesn't like this.
    useEffect(bind, [bind]);

    return y;
};

export default useHideOnScroll;
