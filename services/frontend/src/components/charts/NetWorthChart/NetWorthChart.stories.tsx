import React from "react";
import {smallViewport, storyData} from "utils/stories";
import {ChartDateInterval} from "utils/types";
import {PureComponent as NetWorthChart} from "./NetWorthChart";

export default {
    title: "Charts/Net Worth",
    component: NetWorthChart
};

/** The default view of the `NetWorthChart`, with some arbitrary data. */
export const Default = () => (
    <NetWorthChart
        data={storyData.chartData}
        dateInterval={ChartDateInterval.days}
        description="A line chart"
        fromAmount={10000}
    />
);

/** The small view of the `NetWorthChart`. */
export const Small = () => (
    <NetWorthChart
        data={storyData.chartData}
        dateInterval={ChartDateInterval.days}
        description="A line chart"
        fromAmount={10000}
    />
);

Small.parameters = smallViewport;
