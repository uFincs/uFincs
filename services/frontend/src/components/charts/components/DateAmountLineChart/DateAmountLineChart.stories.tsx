import type {Meta, StoryObj} from "@storybook/react";
import {smallViewport, storyData} from "utils/stories";
import {ChartDateInterval} from "utils/types";
import DateAmountLineChart from "./DateAmountLineChart";

const meta: Meta<typeof DateAmountLineChart> = {
    title: "Charts/Components/Date Amount Line Chart",
    component: DateAmountLineChart,
    args: {
        data: storyData.chartData,
        dateInterval: ChartDateInterval.days,
        description: "A line chart showing money",
        title: "A line chart"
    }
};

export default meta;
type Story = StoryObj<typeof DateAmountLineChart>;

/** The default view of the `DateAmountLineChart`. */
export const Default: Story = {};

/** The small view of the `DateAmountLineChart`. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};
