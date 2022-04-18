import {useCallback, useEffect, useMemo} from "react";
import {useOptionsKeyboardControl} from "hooks/";
import KeyCodes from "values/keyCodes";
import {RadioGroupOption} from "./RadioGroup";

export const useRadioGroup = (
    options: Array<RadioGroupOption>,
    value: string,
    onChange: (value: string) => void,
    autoFocus: boolean | undefined,
    onKeyDown?: (e: React.KeyboardEvent<any>) => void
) => {
    // useOptionsKeyboardControl works only with indexes.
    // As such, we need to turn the current value into an index for it to use.
    const activeIndex = useMemo(
        () => options.findIndex((option) => option.value === value),
        [options, value]
    );

    // This maps back the index change from useOptionsKeyboardControl to an actual option value.
    const onIndexChange = useCallback(
        (index: number) => {
            onChange(options[index].value);
        },
        [options, onChange]
    );

    const {onContainerKeyDown, onItemKeyDown, optionRefs} = useOptionsKeyboardControl(
        options.length,
        activeIndex,
        onIndexChange
    );

    // Add the (external) key handler for "Enter" to the normal (internal) key handler.
    const finalOnContainerKeyDown = useCallback(
        (e: React.KeyboardEvent<any>) => {
            if (e.keyCode === KeyCodes.ENTER) {
                onKeyDown?.(e);
            } else {
                onContainerKeyDown(e);
            }
        },
        [onContainerKeyDown, onKeyDown]
    );

    useEffect(() => {
        if (autoFocus) {
            optionRefs.current[activeIndex]?.current?.focus();
        }

        // We don't want to specify activeIndex as a dep because we only want to auto focus
        // on first mount. Otherwise this effect will needlessly run every time the option changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoFocus, optionRefs]);

    return {onContainerKeyDown: finalOnContainerKeyDown, onItemKeyDown, optionRefs};
};
