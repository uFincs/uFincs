import React from "react";
import {DateRangeProvider} from "hooks/";
import {smallViewport} from "utils/stories";
import DateRangePicker from "./DateRangePicker";

export default {
    title: "Organisms/Date Range Picker",
    component: DateRangePicker
};

/** The default view of the `DateRangePicker`. */
export const Default = () => (
    <DateRangeProvider>
        <DateRangePicker />
    </DateRangeProvider>
);

/** The small view of the `DateRangePicker`. */
export const Small = () => (
    <DateRangeProvider>
        <DateRangePicker />
    </DateRangeProvider>
);

Small.parameters = smallViewport;
