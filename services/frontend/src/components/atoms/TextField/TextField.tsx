import classNames from "classnames";
import * as React from "react";
import {useChildrenText} from "hooks/";
import "./TextField.scss";

export interface TextFieldProps extends React.HTMLAttributes<HTMLParagraphElement> {
    /** Custom class name. */
    className?: string;

    /** What to show in the text field. */
    children: React.ReactNode;
}

/** A generic field of text. Plop this baby anywhere you need text that isn't a label! */
const TextField = ({
    "aria-label": ariaLabel,
    className,
    title,
    children,
    ...otherProps
}: TextFieldProps) => {
    const label = useChildrenText(children) || ariaLabel || title;

    return (
        <p
            aria-label={ariaLabel || label}
            className={classNames("TextField", className)}
            title={title || label}
            {...otherProps}
        >
            {children}
        </p>
    );
};

export default TextField;
