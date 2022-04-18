import classNames from "classnames";
import React, {useEffect, useRef, useState} from "react";
import {ErrorIcon} from "assets/icons";
import {IconButton, ListItemCheckbox} from "components/atoms";
import {IconButtonProps} from "components/atoms/IconButton";
import {sizes} from "utils/parsedStyles";
import "./Input.scss";

const noOp = () => {};

// This hook keeps track of the size of the input's prefix (e.g. currency symbol) so that we
// can calculate an appropriate amount of padding to give the input so that the text doesn't overlap
// the prefix.
const usePrefixPadding = (prefix?: string) => {
    const prefixRef = useRef<HTMLDivElement>(null);
    const [inputPrefixPadding, setInputPrefixPadding] = useState(sizes.size400);

    useEffect(() => {
        if (prefixRef.current?.offsetWidth) {
            setInputPrefixPadding(sizes.size400 + prefixRef.current.offsetWidth);
        }
    }, [prefix]);

    return {inputPrefixPadding, prefixRef};
};

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Custom class name for the input itself. */
    className?: string;

    /** Custom class name for the Input's container. */
    containerClassName?: string;

    /** Whether or not to focus onto this input on mount. */
    autoFocus?: boolean;

    /** Message to indicate an error, or just a boolean to indicate an error. */
    error?: string | boolean;

    /** Because of how the success icon is absolute positioned (and because it was introduced
     *  later in development), we need to opt in to the 'success state' so that it doesn't break any previous
     *  layouts that relied on the specific size of the input. */
    hasSuccessState?: boolean;

    /** Name for react-hook-form to reference the input in uncontrolled mode. */
    name?: string;

    /** Whether or not to show the error icon when there is an error.
     *  Useful for really small inputs (e.g. number inputs) where there isn't room to show the icon. */
    noErrorIcon?: boolean;

    /** The input's placeholder. */
    placeholder?: string;

    /** A prefix (e.g. a symbol like '$') to put before the input text. */
    prefix?: "%" | string;

    /** An optional icon for the right side of the input (e.g. a down chevron). */
    RightIcon?: React.ComponentType<{className?: string}>;

    /** Props for the right Icon Button. */
    rightIconButtonProps?: IconButtonProps;

    /** Can be used to toggle on a 'success' indicator. */
    showSuccess?: boolean;
}

/** A regular old input.
 *
 *  **Takes all props as a regular `input`, as well as those listed below.** */
const Input = React.forwardRef(
    (
        {
            className,
            containerClassName,
            error,
            hasSuccessState = false,
            noErrorIcon = false,
            placeholder,
            prefix,
            RightIcon,
            rightIconButtonProps,
            showSuccess = false,
            type = "text",
            ...otherProps
        }: InputProps,
        ref: React.Ref<HTMLInputElement>
    ) => {
        const {inputPrefixPadding, prefixRef} = usePrefixPadding(prefix);

        return (
            <div
                className={classNames(
                    "Input-container",
                    {
                        "Input--has-status-icon": error || showSuccess,
                        "Input--error": error,
                        "Input--error-with-icon": !noErrorIcon,
                        "Input--has-right-icon": !!RightIcon
                    },
                    containerClassName
                )}
            >
                {prefix && (
                    <div className="Input-prefix" ref={prefixRef}>
                        {prefix}
                    </div>
                )}

                <input
                    className={classNames("Input", className)}
                    style={prefix ? {paddingLeft: inputPrefixPadding} : undefined}
                    aria-invalid={error ? "true" : "false"}
                    placeholder={placeholder}
                    title={placeholder}
                    type={type}
                    {...otherProps}
                    ref={ref}
                />

                <ErrorIcon
                    className={classNames("Input-status-icon", "Input-ErrorIcon", {
                        "Input-status-icon--visible": error && !noErrorIcon
                    })}
                    title={error as string}
                />

                {hasSuccessState && (
                    // Yes, we're repurposing the ListItemCheckbox as a "Success Indicator".
                    // Yes, this is tech debt.
                    <ListItemCheckbox
                        className={classNames("Input-status-icon", {
                            "Input-status-icon--visible": showSuccess
                        })}
                        checked={showSuccess}
                        // Don't want to be able to focus this.
                        tabIndex={-1}
                        role=""
                        title="Success"
                        variant="positive"
                        onCheck={noOp}
                    />
                )}

                {RightIcon &&
                    (rightIconButtonProps ? (
                        // If we have rightIconButtonProps, then we have a button.
                        <IconButton
                            {...rightIconButtonProps}
                            // Note that we're deliberately putting the className after the other
                            // props just so that we don't have to destructure out the className
                            // prop separately.
                            className={classNames(
                                "Input-RightIcon",
                                "Input-RightIconButton",
                                rightIconButtonProps?.className
                            )}
                        >
                            <RightIcon />
                        </IconButton>
                    ) : (
                        // Otherwise, show just the icon.
                        <RightIcon className="Input-RightIcon" />
                    ))}
            </div>
        );
    }
);

export default Input;
