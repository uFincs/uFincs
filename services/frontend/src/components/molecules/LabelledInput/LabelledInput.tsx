import classNames from "classnames";
import * as React from "react";
import {Label, Input} from "components/atoms";
import {InputProps} from "components/atoms/Input";
import "./LabelledInput.scss";

export interface LabelledInputProps extends InputProps {
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

/** An input with a label. More often than not, this should be used over the regular Input.
 *
 *  **Refer to `Input` for additional props.** */
const LabelledInput = React.forwardRef(
    (
        {
            className,
            containerClassName,
            containerRef,
            error,
            label,
            labelProps,
            ...otherProps
        }: LabelledInputProps,
        ref: React.Ref<HTMLInputElement>
    ) => (
        <div
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

                <Input
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

export default LabelledInput;
