import classNames from "classnames";
import React from "react";
import "./Label.scss";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

/** A regular old label. Used in conjunction with the `Input` to form the `LabelledInput`.
 *
 *  If you just need some text, use a `TextField` instead.
 */
const Label = ({className, children, ...otherProps}: LabelProps) => (
    <label className={classNames("Label", className)} {...otherProps}>
        {children}
    </label>
);

export default Label;
