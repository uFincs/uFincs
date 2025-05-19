import classNames from "classnames";
import {useCallback} from "react";
import * as React from "react";
import {Input, TextField} from "components/atoms";
import {InputProps} from "components/atoms/Input";
import {useOutsideCloseable} from "hooks/";
import {ValueFormatting} from "services/";
import "./CustomFormatDateInput.scss";

interface CustomFormatDateInputProps extends InputProps {}

/** A custom input that shows a properly formatted version of the date value until the
 *  user clicks/focuses into it, whereby it reverts back to showing a regular date input.
 *
 *  This is useful for the `DateRangePicker` since we want to show the user a nicely formatted
 *  date yet still allow them to change it easily. */
const CustomFormatDateInput = React.forwardRef(
    ({className, disabled, value, ...otherProps}: CustomFormatDateInputProps, ref) => {
        const {closeableContainerProps, isOpen, setIsOpen} = useOutsideCloseable<HTMLDivElement>();

        const onFocus = useCallback(() => setIsOpen(true), [setIsOpen]);

        // Need to stop key event propagation so that key events from the date inputs don't cause
        // the keyboard shortcuts of the `DateSwitcher` to trigger.
        const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
            e.stopPropagation();
        }, []);

        return (
            <div
                className={classNames("CustomFormatDateInput", className)}
                {...closeableContainerProps}
            >
                <Input
                    containerClassName={classNames("CustomFormatDateInput-input", {
                        "CustomFormatDateInput-input--visible": isOpen
                    })}
                    // This is a hack to hide the input's clear button in Firefox.
                    // Reference: https://stackoverflow.com/a/31712136
                    required={true}
                    type="date"
                    disabled={disabled}
                    value={value}
                    onFocus={onFocus}
                    onKeyDown={onKeyDown}
                    ref={(e: HTMLInputElement) => {
                        if (typeof ref === "function") {
                            ref(e);
                        } else if (ref) {
                            ref.current = e;
                        }
                    }}
                    {...otherProps}
                />

                <TextField
                    className={classNames("CustomFormatDateInput-formatted-value", {
                        "CustomFormatDateInput-formatted-value--hidden": isOpen,
                        "CustomFormatDateInput-formatted-value--disabled": disabled
                    })}
                >
                    {ValueFormatting.formatDate(value as string, {useFullYear: true})}
                </TextField>
            </div>
        );
    }
);

export default CustomFormatDateInput;
