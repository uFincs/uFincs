import classNames from "classnames";
import React from "react";
import {CurrentAmount, TextField} from "components/atoms";
import connect, {ConnectedProps} from "./connect";
import "./CurrentNetWorthIndicator.scss";

interface CurrentNetWorthIndicatorProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** A universal indicator of the user's current net worth. */
const CurrentNetWorthIndicator = ({
    className,
    currentNetWorth = 0
}: CurrentNetWorthIndicatorProps) => (
    <div
        className={classNames("CurrentNetWorthIndicator", className)}
        data-testid="current-net-worth-indicator"
    >
        <TextField className="CurrentNetWorthIndicator-title">Current Net Worth</TextField>

        <CurrentAmount className="CurrentNetWorthIndicator-amount" amount={currentNetWorth} />
    </div>
);

export const PureComponent = CurrentNetWorthIndicator;
export default connect(CurrentNetWorthIndicator);
