import {useEffect} from "react";

/** Scrolls the app back to the top of the viewport whenever something in the given
 *  dependencies changes. */
const useScrollToTopOn = (...deps: any[]) => {
    useEffect(() => {
        // The reason we have to use `scrollTo` on the AppRouter instead of, say, `window`
        // is because of how we've structured the app. In effect, what happened is that AppRouter
        // is the container that actually does the scrolling, as opposed to window or body.
        // As a result, using `scrollTo` on anything above AppRouter doesn't do anything.
        //
        // As far as implementation goes, obviously the 'idiomatic' React way of doing this
        // would have some sort of ref on the AppRouter, so that we didn't have to rely on
        // using CSS IDs. But whatever, this works fine.
        const appRouter = document.getElementById("AppRouter");
        appRouter?.scrollTo(0, 0);

        // ESLint complains that it can't statically verify the deps array.
        // Well duh, we don't have a static deps array in this case. Ignore it.
        // eslint-disable-next-line
    }, deps);
};

export default useScrollToTopOn;
