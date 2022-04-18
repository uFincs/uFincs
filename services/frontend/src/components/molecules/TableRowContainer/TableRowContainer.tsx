import classNames from "classnames";
import React from "react";
import "./TableRowContainer.scss";

interface TableRowContainerProps extends React.HTMLAttributes<HTMLTableRowElement> {
    /** Custom class name. */
    className?: string;

    /** The index of the row in the table. */
    index?: number;

    /** The columns/data to display in the table. */
    children: React.ReactNode;
}

/** The container used to wrap any table rows. */
const TableRowContainer = ({className, index, children, ...otherProps}: TableRowContainerProps) => (
    <tr
        className={classNames("TableRowContainer", className)}
        data-index={index}
        // To enable Vimium clickability.
        role="button"
        tabIndex={0}
        {...otherProps}
    >
        {children}
    </tr>
);

export default TableRowContainer;
