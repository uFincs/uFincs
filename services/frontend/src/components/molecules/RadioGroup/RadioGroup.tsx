import classNames from "classnames";
import {Label} from "components/atoms";
import {useRadioGroup} from "./hooks";
import "./RadioGroup.scss";

export interface RadioGroupOption {
    /** The label of the option. */
    label: string;

    /** The value of the option emitted in `onOptionChange`. */
    value: string;

    /** An optional custom component to display for the option.
     *  Should have an `active` prop. */
    Component?: React.ComponentType<{active?: boolean; disabled?: boolean}>;
}

interface RadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
    /** Custom class name for the container. */
    containerClassName?: string;

    /** ID must be provided for this component to work. */
    id: string;

    /** Whether or not to focus the active option after mounting. */
    autoFocus?: boolean;

    /** Whether or not the Radio buttons should be disabled. */
    disabled?: boolean;

    /** A plain text label for the `RadioGroup`. */
    label?: string;

    /** A custom label component for the `RadioGroup`. */
    LabelComponent?: React.ComponentType<React.LabelHTMLAttributes<HTMLLabelElement>>;

    /** The set of options that the user can choose from. */
    options: Array<RadioGroupOption>;

    /** The currently selected value. */
    value: string;

    /** Callback for whenever the selected option changes.
     *  Need to omit it from the interface because it has a different signature. */
    onChange: (value: string) => void;

    /** Key handler. Useful for doing things like adding a handler to submit a form on 'Enter'. */
    onKeyDown?: (e: React.KeyboardEvent<any>) => void;
}

/** A radio group wraps a bunch of radio options together and enables accessible interaction
 *  with them (i.e. keyboard navigation).
 */
const RadioGroup = ({
    className,
    containerClassName,
    id,
    autoFocus,
    disabled = false,
    label,
    LabelComponent,
    options,
    value,
    onChange,
    onKeyDown,
    ...otherProps
}: RadioGroupProps) => {
    const {onContainerKeyDown, onItemKeyDown, optionRefs} = useRadioGroup(
        options,
        value,
        onChange,
        autoFocus,
        onKeyDown
    );

    // Need the label ID for accessibility.
    const labelId = `${id}-label`;

    return (
        <div className={classNames("RadioGroup-container", containerClassName)}>
            {label ? (
                <Label className="RadioGroup-label" id={labelId}>
                    {label}
                </Label>
            ) : null}

            {LabelComponent ? <LabelComponent className="RadioGroup-label" id={labelId} /> : null}

            <div
                className={classNames("RadioGroup", className)}
                id={id}
                aria-disabled={disabled}
                aria-labelledby={labelId}
                role="radiogroup"
                onKeyDown={disabled ? undefined : onContainerKeyDown}
                {...otherProps}
            >
                {options.map(
                    ({label, value: optionValue, Component, ...otherOptionProps}, index) => (
                        <div
                            key={label}
                            // Note: We explicitly have 'button' in the className so that these
                            // options can be clicked with Vimium.
                            // For reference: https://stackoverflow.com/a/53922489.
                            className={classNames("RadioGroup-option-button", {
                                "RadioGroup-option-button--disabled": disabled
                            })}
                            aria-checked={value === optionValue}
                            aria-disabled={disabled}
                            aria-label={label}
                            role="radio"
                            // eslint-disable-next-line
                            // According to https://www.w3.org/TR/2017/WD-wai-aria-practices-1.1-20170628/examples/radio/radio-1/radio-1.html#:~:text=ARIA%20Roles%2C%20Properties%20and%20States&text=The%20role%3D%22radiogroup%22%20attribute,that%20contains%20the%20label%20text,
                            // only the currently radio option should be focusable.
                            tabIndex={value === optionValue && !disabled ? 0 : -1}
                            title={label}
                            ref={optionRefs.current[index]}
                            onClick={disabled ? undefined : () => onChange(optionValue)}
                            onKeyDown={disabled ? undefined : onItemKeyDown(index)}
                        >
                            {Component ? (
                                <Component
                                    active={value === optionValue}
                                    disabled={disabled}
                                    {...otherOptionProps}
                                />
                            ) : (
                                <>
                                    {/* Just for the record, these 'default' radio options aren't
                                properly styled; they aren't used for anything, so they should just
                                be ignored until actually needed. */}
                                    <input
                                        id={`${id}-input-${optionValue}`}
                                        type="radio"
                                        name={label}
                                        checked={value === optionValue}
                                        disabled={disabled}
                                        // Needed, otherwise React complains about a missing onChange.
                                        readOnly={true}
                                        // Don't want the input focusable when it's the container
                                        // that's supposed to be focusable.
                                        tabIndex={-1}
                                    />

                                    <Label htmlFor={`${id}-input-${optionValue}`}>{label}</Label>
                                </>
                            )}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default RadioGroup;
