import classNames from "classnames";
import * as React from "react";
import {Label} from "components/atoms";
import "./TextAreaInput.scss";

interface TextAreaInputProps extends React.InputHTMLAttributes<HTMLTextAreaElement> {
    /** Custom class name. */
    className?: string;

    /** Custom class name for the Input's container. */
    containerClassName?: string;

    /** Whether or not to focus onto this input on mount. */
    autoFocus?: boolean;

    /** Message to indicate an error, or just a boolean to indicate an error. */
    error?: string | boolean;

    /** Label for the input. */
    label?: string;
}

/** A TextArea input that has error and labelled states.
 *  Yes, we skipped creating a separate `LabelledTextAreaInput`, deal with it. */
const TextAreaInput = React.forwardRef(
    (
        {
            className,
            containerClassName,
            error,
            label,
            placeholder,
            ...otherProps
        }: TextAreaInputProps,
        ref: React.Ref<HTMLTextAreaElement>
    ) => (
        <Label className={classNames("TextAreaInput-Label-container", containerClassName)}>
            <p
                className={classNames("TextAreaInput-Label", {
                    "TextAreaInput-Label--error": !!error,
                    "TextAreaInput-Label--empty": !label && !error
                })}
            >
                {error ? error : label}
            </p>

            <div className={classNames("TextAreaInput-container", {"TextAreaInput--error": error})}>
                <textarea
                    className={classNames("TextAreaInput", className)}
                    aria-invalid={error ? "true" : "false"}
                    placeholder={placeholder}
                    title={label || placeholder}
                    {...otherProps}
                    ref={ref}
                />
            </div>
        </Label>
    )
);

export default TextAreaInput;
