import React, {useCallback, useRef} from "react";
import useOnBecomeInvisible from "./useOnBecomeInvisible";

/** Focuses an input when the input becomes visible. Pretty self-explanatory. */
const useFocusInputOnVisible = (isVisible: boolean): React.RefObject<HTMLInputElement> => {
    const inputRef = useRef<HTMLInputElement>(null);
    const focusInput = useCallback(() => inputRef?.current?.focus(), [inputRef]);

    useOnBecomeInvisible(!isVisible, focusInput);

    return inputRef;
};

export default useFocusInputOnVisible;
