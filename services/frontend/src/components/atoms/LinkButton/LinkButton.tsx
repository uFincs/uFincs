import classNames from "classnames";
import React from "react";
import {Button} from "components/atoms";
import {ButtonProps} from "components/atoms/Button";
import "./LinkButton.scss";

/** A `LinkButton` is the tertiary button type: used for actions that don't
 *  need to be emphasized. It is called a 'Link' button because it is styled like a link (duh).
 *  As such, it still looks clickable, but it doesn't unnecessarily bring attention to itself.
 */
const LinkButton = React.forwardRef(
    ({className, children, ...otherProps}: ButtonProps, ref: React.Ref<HTMLButtonElement>) => (
        <Button className={classNames("LinkButton", className)} ref={ref} {...otherProps}>
            {children}
        </Button>
    )
);

export default LinkButton;
