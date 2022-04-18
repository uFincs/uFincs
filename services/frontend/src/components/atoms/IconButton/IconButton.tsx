import classNames from "classnames";
import React from "react";
import {useChildrenText} from "hooks/";
import "./IconButton.scss";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    onDarkBackground?: boolean;
}

/** A button with only an icon.
 *
 *  Unlike the regular `Button` (which can technically have an icon as its content),
 *  the `IconButton` is styled much differently: the base state is just the icon,
 *  but it has varying hover/active states that change the background.
 *
 *  Additionally, it is fully circular, unlike the only rounded `Button`.
 */
const IconButton = React.forwardRef(
    (
        {
            "aria-label": ariaLabel,
            className,
            onDarkBackground = false,
            title,
            type = "button",
            children,
            ...otherProps
        }: IconButtonProps,
        ref: React.Ref<HTMLButtonElement>
    ) => {
        const label = useChildrenText(children) || ariaLabel || title;

        return (
            <button
                aria-label={ariaLabel || label}
                className={classNames(
                    "IconButton",
                    {"IconButton--dark-background": onDarkBackground},
                    className
                )}
                title={title || label}
                type={type}
                ref={ref}
                {...otherProps}
            >
                {children}
            </button>
        );
    }
);

export default IconButton;
