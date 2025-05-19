import type {Meta, StoryObj} from "@storybook/react";
import {smallViewport, storyData} from "utils/stories";
import {ChartDateInterval} from "utils/types";
import {PureComponent as AccountBalanceChart} from "./AccountBalanceChart";

const meta: Meta<typeof AccountBalanceChart> = {
    title: "Charts/Account Balance",
    component: AccountBalanceChart,
    args: {
        account: storyData.accounts[0],
        data: storyData.chartData,
        dateInterval: ChartDateInterval.days,
        description: "A line chart",
        fromBalance: 10000
    }
};

export default meta;

type Story = StoryObj<typeof AccountBalanceChart>;

/** The default view of the `AccountBalanceChart`, with some arbitrary data. */
export const Default: Story = {};

/** The small view of the `AccountBalanceChart`. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};
