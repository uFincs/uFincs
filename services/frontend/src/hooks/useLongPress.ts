import {useCallback, useRef, useMemo, useEffect} from "react";

/** Enables a component to be long pressed as well as clicked normally.
 *  Inspired by https://stackoverflow.com/a/30180774. */
const useLongPress = (onLongPress: () => void) => {
    const ref = useRef<any | null>(null);

    const wrappedOnLongPress = useCallback(
        (e: MouseEvent) => {
            // When used on desktop, this prevents the default right-click action.
            // https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event
            e.preventDefault();

            onLongPress();
        },
        [onLongPress]
    );

    useEffect(() => {
        const element = ref?.current;

        element?.addEventListener("contextmenu", wrappedOnLongPress);

        return () => element?.removeEventListener("contextmenu", wrappedOnLongPress);
    }, [wrappedOnLongPress]);

    return useMemo(
        () => ({
            ref: ref
        }),
        []
    );
};

export default useLongPress;
