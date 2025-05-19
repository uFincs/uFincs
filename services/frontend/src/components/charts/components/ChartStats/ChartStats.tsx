import classNames from "classnames";
import {AmountChange, CurrentAmount, FromAmount} from "components/atoms";
import {Cents} from "utils/types";
import "./ChartStats.scss";

interface ChartStatsProps {
    /** Custom class name. */
    className?: string;

    /** The amount at the end of the current date range. */
    currentAmount: Cents;

    /** The amount up to just before the start of the current date range. */
    fromAmount: Cents;

    /** Whether or not the Amount Change should have positive values treated as bad.
     *  This is used when the amounts being represented are expenses, for examples. */
    positiveIsBad?: boolean;

    /** The title of the chart. */
    title: string;
}

/** Some basic stats (current/from amount, and change between the two) for charts. */
const ChartStats = ({
    className,
    currentAmount,
    fromAmount,
    positiveIsBad = false,
    title
}: ChartStatsProps) => (
    <div className={classNames("ChartStats", className)}>
        <h2 className="ChartStats-title">{title}</h2>

        <div className="ChartStats-amount">
            <CurrentAmount amount={currentAmount} />
            <FromAmount amount={fromAmount} />
        </div>

        <AmountChange
            oldAmount={fromAmount}
            newAmount={currentAmount}
            positiveIsBad={positiveIsBad}
            showDifference={true}
        />
    </div>
);

export default ChartStats;
