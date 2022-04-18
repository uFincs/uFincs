import classNames from "classnames";
import React from "react";
import {useChildrenText} from "hooks/";
import "./LargeButton.scss";

interface LargeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** Custom class name. */
    className?: string;

    /** The children to display; */
    children?: React.ReactNode;
}

/** A large button that can be used for presenting the user multiple options to choose from,
 *  but that aren't toggleable. */
const LargeButton = ({
    "aria-label": ariaLabel,
    className,
    title,
    children,
    ...otherProps
}: LargeButtonProps) => {
    const label = useChildrenText(children) || ariaLabel || title;

    return (
        <button
            aria-label={ariaLabel || label}
            className={classNames("LargeButton", className)}
            title={title || label}
            {...otherProps}
        >
            {children}
        </button>
    );
};

export default LargeButton;
