import classNames from "classnames";
import React from "react";
import "./StepDescription.scss";

interface StepDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {
    /** The title of this step. */
    title: string;
}

/** The title and description for a step (e.g. a step in the Transactions Import process.) */
const StepDescription = ({className, title, children, ...otherProps}: StepDescriptionProps) => (
    <div className={classNames("StepDescription", className)} {...otherProps}>
        <h2 className="StepDescription-title">{title}</h2>

        <div className="StepDescription-description">{children}</div>
    </div>
);

export default StepDescription;
