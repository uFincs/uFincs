import {useCallback} from "react";

/** Just wraps a callback so that the event stops event propagation. */
const useStopPropagationCallback = (
    callback: (() => void) | undefined
): ((e: React.MouseEvent) => void) => {
    return useCallback(
        (e: React.MouseEvent) => {
            // Stop propagation so that things like the table row click handler aren't fired
            e.stopPropagation();

            if (callback) {
                callback();
            }
        },
        [callback]
    );
};

export default useStopPropagationCallback;
