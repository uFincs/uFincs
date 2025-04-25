import classNames from "classnames";
import React from "react";
import {
    VictoryAxis,
    VictoryBar,
    VictoryChart,
    VictoryStack,
    VictoryVoronoiContainer
} from "victory";
import {ChartTheme} from "components/charts";
import {ChartContainer, ChartStats, Tooltip} from "components/charts/components";
import {colors} from "utils/styles";
import {Cents, ChartDateInterval, DateAmountDataPoint} from "utils/types";
import {useIncomeExpenseChartData, useIncomeExpenseChartStyles} from "./hooks";
import "./IncomeExpenseChart.scss";

interface WrappedIncomeExpenseChartProps {
    /** Custom class name. */
    className?: string;
}

interface IncomeExpenseChartProps extends WrappedIncomeExpenseChartProps {
    /** The income data for the chart. */
    incomeData: Array<DateAmountDataPoint>;

    /** The expense data for the chart. */
    expensesData: Array<DateAmountDataPoint>;

    /** The current Income amount, used in the stats. */
    currentIncome: Cents;

    /** The current Expenses amount, used in the stats. */
    currentExpenses: Cents;

    /** The 'From' amount for Income, used in the stats. */
    fromIncome: Cents;

    /** The 'From' amount for Expenses, used in the stats. */
    fromExpenses: Cents;

    /** What interval was used for generating the chart data. */
    dateInterval: ChartDateInterval;

    /** A description of the chart for accessibility purposes. */
    description: string;
}

/** The Income/Expense chart is a stacked bar chart (with Income stacked on Expenses)
 *  with some extra stats on current/from amounts. */
const IncomeExpenseChart = React.memo(
    ({
        className,
        incomeData,
        expensesData,
        currentIncome,
        currentExpenses,
        fromIncome,
        fromExpenses,
        dateInterval,
        description
    }: IncomeExpenseChartProps) => {
        const {
            barAlignment,
            barRatio,
            containerRef,
            domainPadding,
            expensesTooltipFormatter,
            incomeTooltipFormatter,
            xAxisFormatter,
            xAxisTickAngle,
            yAxisFormatter,
            yAxisPadding,
            width
        } = useIncomeExpenseChartStyles(incomeData, expensesData, dateInterval);

        return (
            <ChartContainer
                className={classNames("IncomeExpenseChart", className)}
                data-testid="income-expense-chart"
                ref={containerRef}
            >
                <IncomeExpenseStats
                    currentIncome={currentIncome}
                    fromIncome={fromIncome}
                    currentExpenses={currentExpenses}
                    fromExpenses={fromExpenses}
                />

                <VictoryChart
                    containerComponent={
                        <VictoryVoronoiContainer
                            desc={description}
                            title="Income/Expenses over Time"
                        />
                    }
                    domainPadding={{x: domainPadding}}
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
                    height={350}
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

                    <VictoryStack>
                        <VictoryBar
                            alignment={barAlignment}
                            barRatio={barRatio}
                            data={expensesData}
                            x="date"
                            y="amount"
                            labelComponent={<Tooltip />}
                            labels={expensesTooltipFormatter}
                            style={{
                                data: {
                                    fill: colors.colorNegative500
                                }
                            }}
                        />

                        <VictoryBar
                            alignment={barAlignment}
                            barRatio={barRatio}
                            data={incomeData}
                            x="date"
                            y="amount"
                            labelComponent={<Tooltip />}
                            labels={incomeTooltipFormatter}
                            style={{
                                data: {
                                    fill: colors.colorPositive500
                                }
                            }}
                        />
                    </VictoryStack>
                </VictoryChart>
            </ChartContainer>
        );
    }
);

/** Want to keep a pure version (above) of the chart for stories. This wraps the chart
 *  to connect it to the store and date range context to get the data. */
const WrappedIncomeExpenseChart = (props: WrappedIncomeExpenseChartProps) => {
    const incomeExpenseProps = useIncomeExpenseChartData();

    return <IncomeExpenseChart {...incomeExpenseProps} {...props} />;
};

export const PureComponent = IncomeExpenseChart;
export default WrappedIncomeExpenseChart;

/* Other Components */

interface IncomeExpenseStatsProps {
    /** The current Income amount. */
    currentIncome: Cents;

    /** The current Expenses amount. */
    currentExpenses: Cents;

    /** The 'From' Income amount. */
    fromIncome: Cents;

    /** The 'From' Expenses amount. */
    fromExpenses: Cents;
}

/** These stats show the current/from Income/Expenses amounts. */
const IncomeExpenseStats = ({
    currentIncome,
    currentExpenses,
    fromIncome,
    fromExpenses
}: IncomeExpenseStatsProps) => (
    <div className="IncomeExpenseStats">
        <ChartStats
            className="IncomeExpenseStats-income-stats"
            currentAmount={currentIncome}
            fromAmount={fromIncome}
            title="Income"
        />

        <ChartStats
            className="IncomeExpenseStats-expense-stats"
            currentAmount={currentExpenses}
            fromAmount={fromExpenses}
            positiveIsBad={true}
            title="Expenses"
        />
    </div>
);
