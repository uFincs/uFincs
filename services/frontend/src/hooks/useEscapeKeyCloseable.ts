import {useEffect} from "react";
import KeyCodes from "values/keyCodes";

/** Hook that can be used to provide components with the ability to be closed by
 *  pressing the Escape key. */
const useEscapeKeyCloseable = (isVisible: boolean, onClose: () => void) => {
    useEffect(() => {
        const onEscapeKey = (e: KeyboardEvent): void => {
            if (e.keyCode === KeyCodes.ESCAPE) {
                onClose();
            }
        };

        if (isVisible) {
            // Only activate the event listener when the element becomes visible.
            // Otherwise, it'll fire for every instance of ESC, for every instance of
            // useEscapeKeyCloseable.
            document.addEventListener("keydown", onEscapeKey);
        } else {
            document.removeEventListener("keydown", onEscapeKey);
        }

        return () => {
            document.removeEventListener("keydown", onEscapeKey);
        };
    }, [isVisible, onClose]);
};

export default useEscapeKeyCloseable;
