import classNames from "classnames";
import React from "react";
import {
    VictoryArea,
    VictoryAxis,
    VictoryChart,
    VictoryScatter,
    VictoryVoronoiContainer
} from "victory";
import {ChartTheme} from "components/charts";
import {Tooltip} from "components/charts/components";
import {ChartDateInterval, DateAmountDataPoint} from "utils/types";
import connect, {ConnectedProps} from "./connect";
import useDateAmountLineChart from "./hooks";
import "./DateAmountLineChart.scss";

interface DateAmountLineChartProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;

    /** The data for the chart. */
    data: Array<DateAmountDataPoint>;

    /** The data interval is the size of each data point in the `data`. */
    dateInterval: ChartDateInterval;

    /** A (more detailed) description of the chart for accessibility purposes.
     *  This one shows up as an aria-label. */
    description: string;

    /** The (optional) height of the chart. */
    height?: number;

    /** A title for the chart. Shows up as a hover tooltip. */
    title: string;
}

/** A line chart with dates on the x-axis and amounts (money) on the y-axis. */
const DateAmountLineChart = ({
    className,
    data,
    dateInterval,
    description,
    height = 350,
    showFutureTransactions = true,
    title
}: DateAmountLineChartProps) => {
    const {
        amountsDomain,
        containerRef,
        currentData,
        futureData,
        tooltipFormatter,
        xAxisFormatter,
        xAxisTickAngle,
        yAxisFormatter,
        yAxisPadding,
        width
    } = useDateAmountLineChart(data, dateInterval);

    return (
        <div className={classNames("DateAmountLineChart", className)} ref={containerRef}>
            <VictoryChart
                containerComponent={<VictoryVoronoiContainer desc={description} title={title} />}
                domain={{y: amountsDomain}}
                padding={{
                    ...ChartTheme.chart.padding,
                    left: yAxisPadding
                }}
                scale={{x: "time"}}
                // Yeah, the types for the theme are wrong (makes sense considering they aren't
                // first party...). It specifies that padding should be a number when clearly
                // it can also be an object with padding values for each direction.
                // @ts-ignore
                theme={ChartTheme}
                height={height}
                width={width}
            >
                <VictoryAxis
                    tickFormat={xAxisFormatter}
                    style={{
                        tickLabels: {
                            angle: xAxisTickAngle
                        }
                    }}
                />

                <VictoryAxis dependentAxis={true} tickFormat={yAxisFormatter} />

                {/* Note: Due to render order, the area charts need to be rendered after the axes,
                    otherwise the axis grid lines will be in front of the chart. */}
                <VictoryArea
                    data={futureData}
                    x="date"
                    y="amount"
                    labelComponent={<Tooltip />}
                    labels={tooltipFormatter}
                    style={showFutureTransactions ? ChartTheme.areaFuture.style : undefined}
                />

                <VictoryArea
                    data={currentData}
                    x="date"
                    y="amount"
                    labelComponent={<Tooltip />}
                    labels={tooltipFormatter}
                />

                {/* Note: The future data charts need to be rendered before the current data charts so that
                    the current data points render on top for the date that is 'today'.
                    That is, so that the 'today' point is colored current instead of future. */}
                <VictoryScatter
                    data={futureData}
                    x="date"
                    y="amount"
                    style={showFutureTransactions ? ChartTheme.scatterFuture.style : undefined}
                />

                <VictoryScatter data={currentData} x="date" y="amount" />
            </VictoryChart>
        </div>
    );
};

export default connect(DateAmountLineChart);
