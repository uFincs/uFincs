import type {Meta, StoryObj} from "@storybook/react";
import {smallViewport, storyData} from "utils/stories";
import {ChartDateInterval} from "utils/types";
import {PureComponent as NetWorthChart} from "./NetWorthChart";

const meta: Meta<typeof NetWorthChart> = {
    title: "Charts/Net Worth",
    component: NetWorthChart,
    args: {
        data: storyData.chartData,
        dateInterval: ChartDateInterval.days,
        description: "A line chart",
        fromAmount: 10000
    }
};

export default meta;
type Story = StoryObj<typeof NetWorthChart>;

/** The default view of the `NetWorthChart`, with some arbitrary data. */
export const Default: Story = {};

/** The small view of the `NetWorthChart`. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};
