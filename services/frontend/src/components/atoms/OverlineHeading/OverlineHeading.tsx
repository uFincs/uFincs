import classNames from "classnames";
import React from "react";
import "./OverlineHeading.scss";

interface OverlineHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    /** Custom class name. */
    className?: string;

    /** Size of the heading text. Can be `small`, `normal`, or `large`. */
    size?: "normal" | "large" | "small";

    /** What to show in the heading; e.g. text. */
    children: React.ReactNode;
}

/** A heading with the uFincs motif of a short overline.
 *  Used for the primary heading on a given page or form.
 */
const OverlineHeading = ({
    className,
    size = "normal",
    children,
    ...otherProps
}: OverlineHeadingProps) => (
    <div className={classNames("OverlineHeading", className)}>
        <div className="OverlineHeading-overline" />

        <h1
            className={classNames("OverlineHeading-text", `OverlineHeading-text--${size}`)}
            {...otherProps}
        >
            {children}
        </h1>
    </div>
);

export default OverlineHeading;
