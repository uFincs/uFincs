import {useLayoutEffect} from "react";
import debounce from "utils/debounce";
import throttle from "utils/throttle";

/** Wraps a callback to fire (debounced) on window resize. */
const useOnWindowResize = (
    callback: () => void,
    debounceOrThrottle: "debounce" | "throttle" = "debounce",
    timeout = 500
) => {
    useLayoutEffect(() => {
        let wrappedCallback = callback;

        if (debounceOrThrottle === "debounce") {
            wrappedCallback = debounce(callback);
        } else if (debounceOrThrottle === "throttle") {
            // 500ms was arbitrarily chosen; can be adjusted with a parameter
            // in the future if need be.
            wrappedCallback = throttle(callback, timeout);
        }

        window.addEventListener("resize", wrappedCallback);

        return () => window.removeEventListener("resize", wrappedCallback);
    }, [callback, debounceOrThrottle, timeout]);
};

export default useOnWindowResize;
