import classNames from "classnames";
import * as React from "react";
import "./ChartContainer.scss";

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {}

/** A container for wrapping a chart. Mostly just adds a white background and a drop shadow. */
const ChartContainer = React.forwardRef(
    ({className, children, ...otherProps}: ChartContainerProps, ref: React.Ref<HTMLDivElement>) => (
        <div className={classNames("ChartContainer", className)} ref={ref} {...otherProps}>
            {children}
        </div>
    )
);

export default ChartContainer;
