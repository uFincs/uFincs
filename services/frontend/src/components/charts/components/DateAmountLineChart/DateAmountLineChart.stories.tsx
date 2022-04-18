import React from "react";
import {smallViewport, storyData} from "utils/stories";
import {ChartDateInterval} from "utils/types";
import DateAmountLineChart from "./DateAmountLineChart";

export default {
    title: "Charts/Components/Date Amount Line Chart",
    component: DateAmountLineChart
};

/** The default view of the `DateAmountLineChart`. */
export const Default = () => (
    <DateAmountLineChart
        data={storyData.chartData}
        dateInterval={ChartDateInterval.days}
        description="A line chart showing money"
        title="A line chart"
    />
);

/** The small view of the `DateAmountLineChart`. */
export const Small = () => (
    <DateAmountLineChart
        data={storyData.chartData}
        dateInterval={ChartDateInterval.days}
        description="A line chart showing money"
        title="A line chart"
    />
);

Small.parameters = smallViewport;
