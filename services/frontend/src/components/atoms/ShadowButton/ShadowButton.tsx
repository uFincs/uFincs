import classNames from "classnames";
import * as React from "react";
import {Button} from "components/atoms";
import {ButtonProps} from "components/atoms/Button";
import "./ShadowButton.scss";

interface ShadowButtonProps extends Omit<ButtonProps, "variant"> {
    variant?: "primary" | "negative";
}

/** A button with a drop shadow. The drop shadow is used to help indicate primary-ness.
 *
 *  **Refer to `Button` for the complete list of props.**
 */
const ShadowButton = React.forwardRef(
    (
        {className, variant = "primary", children, ...otherProps}: ShadowButtonProps,
        ref: React.Ref<HTMLButtonElement>
    ) => (
        <Button
            className={classNames("ShadowButton", `ShadowButton--${variant}`, className)}
            ref={ref}
            {...otherProps}
        >
            {children}
        </Button>
    )
);

export default ShadowButton;
