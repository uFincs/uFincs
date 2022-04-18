import classNames from "classnames";
import React from "react";
import {Label, SelectInput} from "components/atoms";
import {SelectInputProps} from "components/atoms/SelectInput/SelectInput";
import "./LabelledSelectInput.scss";

export interface LabelledSelectInputProps extends SelectInputProps {
    /** A ref to the container of the input, instead of the input itself.
     *
     *  This is used by things like CSSTransition when they need a ref to the whole component
     *  instead of just the input (if you use a ref with CSSTransition directly to the input,
     *  it's not gonna look pretty). */
    containerRef?: React.Ref<HTMLDivElement>;

    /** Label for the input. */
    label: string;

    /** Any extra props to pass to the label. Needed for things like Downshift. */
    labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
}

/** A `SelectInput` with a label. */
const LabelledSelectInput = React.forwardRef(
    (
        {
            className,
            containerClassName,
            containerRef,
            error,
            label,
            labelProps,
            ...otherProps
        }: LabelledSelectInputProps,
        ref: React.Ref<HTMLSelectElement>
    ) => (
        <div
            // Tech Debt: Yes, I am intentionally re-using the classes/structure from LabelledInput,
            // just so I don't have to copy over the CSS. Deal with it.
            className={classNames("LabelledInput-container", containerClassName)}
            ref={containerRef}
        >
            <Label {...labelProps}>
                <p
                    className={classNames("LabelledInput-Label", {
                        "LabelledInput-Label--error": !!error,
                        "LabelledInput-Label--empty": !label && !error
                    })}
                >
                    {error ? error : label}
                </p>

                <SelectInput
                    className={classNames("LabelledInput", className)}
                    error={error}
                    ref={ref}
                    title={label}
                    {...otherProps}
                />
            </Label>
        </div>
    )
);

export default LabelledSelectInput;
