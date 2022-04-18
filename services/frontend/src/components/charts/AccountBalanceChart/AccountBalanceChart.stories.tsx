import React from "react";
import {smallViewport, storyData} from "utils/stories";
import {ChartDateInterval} from "utils/types";
import {PureComponent as AccountBalanceChart} from "./AccountBalanceChart";

export default {
    title: "Charts/Account Balance",
    component: AccountBalanceChart
};

/** The default view of the `AccountBalanceChart`, with some arbitrary data. */
export const Default = () => (
    <AccountBalanceChart
        account={storyData.accounts[0]}
        data={storyData.chartData}
        dateInterval={ChartDateInterval.days}
        description="A line chart"
        fromBalance={10000}
    />
);

/** The small view of the `AccountBalanceChart`. */
export const Small = () => (
    <AccountBalanceChart
        account={storyData.accounts[0]}
        data={storyData.chartData}
        dateInterval={ChartDateInterval.days}
        description="A line chart"
        fromBalance={10000}
    />
);

Small.parameters = smallViewport;
