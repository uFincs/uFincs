import React from "react";
import {DateRangeProvider} from "hooks/";
import {smallViewport} from "utils/stories";
import DateRangeSizePicker from "./DateRangeSizePicker";

export default {
    title: "Molecules/Date Range Size Picker",
    component: DateRangeSizePicker
};

/** The large (desktop) view of the `DateRangeSizePicker`. This view uses separate buttons for
 *  each option, thus allowing the user to see all the options at a glance. */
export const Large = () => (
    <DateRangeProvider>
        <DateRangeSizePicker />
    </DateRangeProvider>
);

/** The small (mobile) view of the `DateRangeSizePicker`. This view uses a select input
 *  to compress all of the options into as little space as possible. */
export const Small = () => (
    <DateRangeProvider>
        <DateRangeSizePicker />
    </DateRangeProvider>
);

Small.parameters = smallViewport;
