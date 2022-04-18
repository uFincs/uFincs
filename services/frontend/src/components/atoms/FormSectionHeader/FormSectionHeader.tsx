import classNames from "classnames";
import React from "react";
import "./FormSectionHeader.scss";

interface FormSectionHeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {}

/** A header for denoting a section in a form.
 *
 *  It is styled larger (and more boldly) than the typical input label to separate it out more.
 */
const FormSectionHeader = ({className, children, ...otherProps}: FormSectionHeaderProps) => (
    <h3 className={classNames("FormSectionHeader", className)} {...otherProps}>
        {children}
    </h3>
);

export default FormSectionHeader;
