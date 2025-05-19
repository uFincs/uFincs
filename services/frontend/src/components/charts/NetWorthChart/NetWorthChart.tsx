import classNames from "classnames";
import {memo} from "react";
import {ChartContainer, ChartStats, DateAmountLineChart} from "components/charts/components";
import {Cents, ChartDateInterval, DateAmountDataPoint} from "utils/types";
import {useNetWorthChart} from "./hooks";
import "./NetWorthChart.scss";

interface WrappedNetWorthChartProps {
    /** Custom class name. */
    className?: string;
}

interface NetWorthChartProps extends WrappedNetWorthChartProps {
    /** The data for the chart. */
    data: Array<DateAmountDataPoint>;

    /** What interval was used for generating the chart data. */
    dateInterval: ChartDateInterval;

    /** A description of the chart for accessibility purposes. */
    description: string;

    /** The 'From' amount, used in the stats.
     *  Note that the 'Current' amount is derived from the last data point in the chart data. */
    fromAmount: Cents;
}

/** The chart to display the user's complete net worth over time. */
const NetWorthChart = memo(
    ({className, data, dateInterval, description, fromAmount}: NetWorthChartProps) => {
        const currentAmount = data?.[data.length - 1]?.amount || 0;

        return (
            <ChartContainer
                className={classNames("NetWorthChart", className)}
                data-testid="net-worth-chart"
            >
                <NetWorthStats currentNetWorth={currentAmount} fromNetWorth={fromAmount} />

                <DateAmountLineChart
                    data={data}
                    dateInterval={dateInterval}
                    description={description}
                    title="Net Worth over Time"
                />
            </ChartContainer>
        );
    }
);

/** Want to keep a pure version (above) of the chart for stories. This wraps the chart
 *  to connect it to the store and date range context to get the data. */
const WrappedNetWorthChart = (props: WrappedNetWorthChartProps) => {
    const {data, dateInterval, description, fromAmount} = useNetWorthChart();

    return (
        <NetWorthChart
            data={data}
            dateInterval={dateInterval}
            description={description}
            fromAmount={fromAmount}
            {...props}
        />
    );
};

export const PureComponent = NetWorthChart;
export default WrappedNetWorthChart;

/* Other Components */

interface NetWorthStatsProps {
    /** The net worth at the end of the current date range. */
    currentNetWorth: Cents;

    /** The net worth from right before the current date range. */
    fromNetWorth: Cents;
}

/** These are just some stats to show above the chart. */
const NetWorthStats = ({currentNetWorth, fromNetWorth}: NetWorthStatsProps) => (
    <div className="NetWorthStats">
        <ChartStats currentAmount={currentNetWorth} fromAmount={fromNetWorth} title="Net Worth" />
    </div>
);
