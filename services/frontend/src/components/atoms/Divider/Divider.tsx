import classNames from "classnames";
import React from "react";
import "./Divider.scss";

interface DividerProps {
    /** Custom class name. */
    className?: string;

    /** Can the orientation of the divider. Can be `horizontal` or `vertical`. */
    orientation?: "horizontal" | "vertical";
}

/** A line that can be used to vertically or horizontally divide content. */
const Divider = ({className, orientation = "horizontal"}: DividerProps) => (
    <div className={classNames("Divider", `Divider--${orientation}`, className)} role="separator" />
);

export default Divider;
