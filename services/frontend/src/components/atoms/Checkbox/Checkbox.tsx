import classNames from "classnames";
import React, {useEffect, useRef} from "react";
import {Label} from "components/atoms";
import "./Checkbox.scss";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Custom class name for the Checkbox's container. */
    containerClassName?: string;

    /** Message to indicate an error, or just a boolean to indicate an error. */
    error?: string | boolean;

    /** The label of the checkbox. */
    label: string;

    /** If this checkbox controls something like the selection state of a list,
     *  passing `partiallyChecked` indicates that some (but not all) elements of the
     *  list have been selected.
     *
     *  This is used to set the `indeterminate` property of the checkbox, which shows a dash
     *  instead of a check mark. */
    partiallyChecked?: boolean;
}

/** It's a checkbox, what more do you want?
 *
 *  Well, I guess it's slightly different than a normal checkbox since it supports
 *  a "not fully checked" state, for when selecting only some elements from a list.
 *
 *  But other than that, it's just a checkbox! */
const Checkbox = React.forwardRef(
    (
        {
            className,
            containerClassName,
            error,
            label,
            partiallyChecked = false,
            title,
            ...otherProps
        }: CheckboxProps,
        ref
    ) => {
        const internalRef = useRef<HTMLInputElement | null>(null);

        useEffect(() => {
            if (internalRef?.current) {
                // Since `indeterminate` isn't actually an attribute/prop of the input,
                // we have to set it at the DOM node level (aka with a ref).
                internalRef.current.indeterminate = partiallyChecked;
            }
        }, [internalRef, partiallyChecked]);

        return (
            <Label className={classNames("Checkbox-container", containerClassName)} title={title}>
                <input
                    className={classNames("Checkbox", className)}
                    type="checkbox"
                    ref={(e: HTMLInputElement) => {
                        internalRef.current = e;

                        if (typeof ref === "function") {
                            ref(e);
                        } else if (ref) {
                            ref.current = e;
                        }
                    }}
                    {...otherProps}
                />

                <p
                    className={classNames("Checkbox-Label", {
                        "Checkbox-Label--error": !!error,
                        "Checkbox-Label--empty": !label && !error
                    })}
                >
                    {error ? error : label}
                </p>
            </Label>
        );
    }
);

export default Checkbox;
