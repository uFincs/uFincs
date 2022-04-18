import classNames from "classnames";
import React from "react";
import {ChevronDownIcon, ErrorIcon} from "assets/icons";
import {ListItemCheckbox} from "components/atoms";
import {SuggestionOption} from "utils/types";
import "./SelectInput.scss";

const noOp = () => {};

export interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    /** Custom class name for the select input itself. */
    className?: string;

    /** Custom class name for the SelectInput's container. */
    containerClassName?: string;

    /** Whether or not to indicate an error.
     *  Can be a string just for consuming component convenience; any string indicates an error,
     *  whereas an empty string is not an error. */
    error?: string | boolean;

    /** Because of how the success icon is absolute positioned (and because it was introduced
     *  later in development), we need to opt in to the 'status state' so that it doesn't break any previous
     *  layouts that relied on the specific size of the input. */
    hasStatusState?: boolean;

    /** A placeholder for the input. */
    placeholder?: string;

    /** Can be used to toggle on a 'success' indicator. */
    showSuccess?: boolean;

    /** The set of label/value options for the select input to display. */
    values: Array<SuggestionOption>;
}

/** A custom `select` input that is really just a standard `select` input with the stylings
 *  of our regular `Input`. */
const SelectInput = React.forwardRef(
    (
        {
            className,
            containerClassName,
            "aria-label": ariaLabel,
            error,
            hasStatusState = false,
            placeholder,
            showSuccess = false,
            title,
            value,
            values = [],
            ...otherProps
        }: SelectInputProps,
        ref: React.Ref<HTMLSelectElement>
    ) => {
        const label = ariaLabel || title;

        return (
            <div
                className={classNames(
                    "SelectInput-container",
                    {
                        "SelectInput--has-status-icon": hasStatusState && (showSuccess || error),
                        "SelectInput--error": error
                    },
                    containerClassName
                )}
            >
                <select
                    className={classNames("SelectInput", className)}
                    ref={ref}
                    aria-label={label}
                    title={label}
                    value={value}
                    {...otherProps}
                >
                    {values.map(({label, value}) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>

                <ChevronDownIcon className="SelectInput-arrow-icon" />

                {hasStatusState && (
                    <ErrorIcon
                        className={classNames("Input-status-icon", "Input-ErrorIcon", {
                            "Input-status-icon--visible": error
                        })}
                        title={error as string}
                    />
                )}

                {hasStatusState && (
                    // Yes, we're repurposing the ListItemCheckbox as a "Success Indicator".
                    // Yes, this is tech debt.
                    <ListItemCheckbox
                        // Tech Debt: Yes, we're also re-purposing the CSS classes from `Input`.
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

                {!value && placeholder && <p className="SelectInput-placeholder">{placeholder}</p>}
            </div>
        );
    }
);

export default SelectInput;
