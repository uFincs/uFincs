import type {Meta, StoryObj} from "@storybook/react";
import {DateRangeProvider} from "hooks/";
import {smallViewport, storyData} from "utils/stories";
import {ChartDateInterval} from "utils/types";
import {PureComponent as IncomeExpenseChart} from "./IncomeExpenseChart";

const meta: Meta<typeof IncomeExpenseChart> = {
    title: "Charts/Income Expense",
    decorators: [
        (Story) => (
            <DateRangeProvider>
                <Story />
            </DateRangeProvider>
        )
    ],
    component: IncomeExpenseChart,
    args: {
        incomeData: storyData.chartData,
        expensesData: storyData.chartData,
        currentIncome: 12345,
        fromIncome: 100,
        currentExpenses: 67890,
        fromExpenses: 200,
        dateInterval: ChartDateInterval.days,
        description: "A bar chart"
    }
};

export default meta;
type Story = StoryObj<typeof IncomeExpenseChart>;

/** The default view of the `IncomeExpenseChart`, with some arbitrary data. */
export const Default: Story = {};

/** The small view of the `IncomeExpenseChart`. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};
