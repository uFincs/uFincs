import React from "react";
import {DateRangeProvider} from "hooks/";
import {smallViewport, storyData} from "utils/stories";
import {ChartDateInterval} from "utils/types";
import {PureComponent as IncomeExpenseChart} from "./IncomeExpenseChart";

export default {
    title: "Charts/Income Expense",
    component: IncomeExpenseChart
};

/** The default view of the `IncomeExpenseChart`, with some arbitrary data. */
export const Default = () => (
    <DateRangeProvider>
        <IncomeExpenseChart
            incomeData={storyData.chartData}
            expensesData={storyData.chartData}
            currentIncome={12345}
            fromIncome={100}
            currentExpenses={67890}
            fromExpenses={200}
            dateInterval={ChartDateInterval.days}
            description="A bar chart"
        />
    </DateRangeProvider>
);

/** The small view of the `IncomeExpenseChart`. */
export const Small = () => (
    <DateRangeProvider>
        <IncomeExpenseChart
            incomeData={storyData.chartData}
            expensesData={storyData.chartData}
            currentIncome={12345}
            fromIncome={100}
            currentExpenses={67890}
            fromExpenses={200}
            dateInterval={ChartDateInterval.days}
            description="A bar chart"
        />
    </DateRangeProvider>
);

Small.parameters = smallViewport;
