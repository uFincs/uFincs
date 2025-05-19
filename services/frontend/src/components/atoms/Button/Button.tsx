import classNames from "classnames";
import * as React from "react";
import {useChildrenText} from "hooks/";
import "./Button.scss";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    /** An onClick handler for when the button is disabled.
     *  Useful for adding 'frustration' handlers, like when a user mashes a disabled button.
     *
     *  Note that using this basically breaks the button disabled state in terms of accessibility. */
    disabledOnClick?: () => void;

    /** The 'primary' variant uses the classic 'primary' color, whereas
     *  the 'secondary' variant uses the neutral background color. */
    variant?: "primary" | "secondary";
}

/** A regular old filled button.
 *  Useful for secondary actions (since ShadowButton should be used for primary actions).
 *
 *  **Takes all props as a regular `button`.**
 */
const Button = React.forwardRef(
    (
        {
            "aria-label": ariaLabel,
            className,
            children,
            disabled = false,
            title,
            // Make sure the default type is just a regular button, otherwise buttons in
            // forms will act as submit buttons (by default).
            type = "button",
            variant = "primary",
            disabledOnClick,
            onClick,
            ...otherProps
        }: ButtonProps,
        ref: React.Ref<HTMLButtonElement>
    ) => {
        const label = useChildrenText(children) || ariaLabel || title;

        // When we have a `disabledOnClick` handler, then the button is only 'pseudo' disabled.
        // The main difference is that the button won't be accessibly marked as disabled;
        // instead, it'll just _look_ disabled.
        const pseudoDisabled = disabled && disabledOnClick;

        return (
            <button
                aria-disabled={disabled}
                aria-label={ariaLabel || label}
                className={classNames(
                    "Button",
                    `Button--${variant}`,
                    {"Button--pseudo-disabled": pseudoDisabled},
                    className
                )}
                disabled={pseudoDisabled ? false : disabled}
                title={title || label}
                type={type}
                ref={ref}
                onClick={disabled ? disabledOnClick : onClick}
                {...otherProps}
            >
                <span className="Button-child-wrapper">{children}</span>
            </button>
        );
    }
);

export default Button;
