import classNames from "classnames";
import React from "react";
import {Button} from "components/atoms";
import {ButtonProps} from "../Button";
import "./OutlineButton.scss";

interface OutlineButtonProps extends ButtonProps {
    /** Which color theme to use. Can be `primary` or `light`. */
    colorTheme?: "primary" | "light" | "warning";
}

/** A button with a drop shadow. The drop shadow is used to help indicate primary-ness.
 *
 *  **Refer to `Button` for the complete list of props.**
 */
const OutlineButton = React.forwardRef(
    (
        {className, colorTheme = "primary", children, ...otherProps}: OutlineButtonProps,
        ref: React.Ref<HTMLButtonElement>
    ) => (
        <Button
            className={classNames("OutlineButton", `OutlineButton--${colorTheme}`, className)}
            ref={ref}
            {...otherProps}
        >
            {children}
        </Button>
    )
);

export default OutlineButton;
