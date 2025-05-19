import {useCallback, useRef} from "react";
import * as React from "react";
import useOnBecomeInvisible from "./useOnBecomeInvisible";

/** Focuses an input when the input becomes visible. Pretty self-explanatory. */
const useFocusInputOnVisible = (isVisible: boolean): React.RefObject<HTMLInputElement | null> => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const focusInput = useCallback(() => inputRef?.current?.focus(), [inputRef]);

    useOnBecomeInvisible(!isVisible, focusInput);

    return inputRef;
};

export default useFocusInputOnVisible;
