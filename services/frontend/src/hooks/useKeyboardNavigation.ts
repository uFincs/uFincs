import {useCallback} from "react";
import KeyCodes from "values/keyCodes";

type NavigationKeys = "home" | "end" | "left" | "right" | "up" | "down";

interface NavigationOptions {
    /** Go to the first item. */
    onFirst?: () => void;

    /** Go to the last item. */
    onLast?: () => void;

    /** Go to the previous item. */
    onPrevious?: () => void;

    /** Go to the next item. */
    onNext?: () => void;

    /** A map of keys to disable. Use `{[key]: true}` to disable a key. */
    disableKeys?: {[K in NavigationKeys]?: boolean};

    /** `reverseUpDown` is used to reverse the up/down arrows to perform the opposite navigation.
     *  The default direction is up = previous, down = next. This is because this navigation
     *  was originally created for things like Radio Groups where items are stacked vertically
     *  and the next item was downwards.
     *
     *  However, for things like Pagination it makes more sense to reverse the direction since
     *  'up' is more like incrementing the page counter. Hence, reversing up/down then means
     *  that up = next and down = previous. */
    reverseUpDown?: boolean;
}

/** Hook for enabling navigation between items using the arrow keys and home/end. */
const useKeyboardNavigation = ({
    onFirst,
    onLast,
    onPrevious,
    onNext,
    reverseUpDown = false,
    disableKeys
}: NavigationOptions) =>
    useCallback(
        (e: React.KeyboardEvent) => {
            switch (e.keyCode) {
                case KeyCodes.END:
                    if (disableKeys?.end) {
                        break;
                    }

                    e.preventDefault();
                    onLast?.();
                    break;
                case KeyCodes.HOME:
                    if (disableKeys?.home) {
                        break;
                    }

                    e.preventDefault();
                    onFirst?.();
                    break;
                case KeyCodes.LEFT_ARROW:
                    if (disableKeys?.left) {
                        break;
                    }

                    e.preventDefault();
                    onPrevious?.();
                    break;
                case KeyCodes.UP_ARROW:
                    if (disableKeys?.up) {
                        break;
                    }

                    e.preventDefault();

                    if (reverseUpDown) {
                        onNext?.();
                    } else {
                        onPrevious?.();
                    }

                    break;
                case KeyCodes.RIGHT_ARROW:
                    if (disableKeys?.right) {
                        break;
                    }

                    e.preventDefault();
                    onNext?.();
                    break;
                case KeyCodes.DOWN_ARROW:
                    if (disableKeys?.down) {
                        break;
                    }

                    e.preventDefault();

                    if (reverseUpDown) {
                        onPrevious?.();
                    } else {
                        onNext?.();
                    }

                    break;
            }
        },
        [onFirst, onLast, onPrevious, onNext, reverseUpDown, disableKeys]
    );

export default useKeyboardNavigation;
