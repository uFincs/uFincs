import {useCallback} from "react";
import KeyCodes from "values/keyCodes";

/** This is just small wrapper hook for turning a callback into a callback
 *  that is triggered by an 'active key', 'Enter' or 'Space'.
 *  (i.e. the keys that trigger an active state on a focused element) */
const useOnActiveKey = (callback: (e: any | undefined) => void) =>
    useCallback(
        (e: any) => {
            if (e?.keyCode === KeyCodes.ENTER || e?.keyCode === KeyCodes.SPACE) {
                e.preventDefault();
                callback(e);
            }
        },
        [callback]
    );

export default useOnActiveKey;
