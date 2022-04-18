import {text} from "@storybook/addon-knobs";
import React from "react";
import {DateRangeProvider} from "hooks/";
import {smallViewport} from "utils/stories";
import SceneHeaderWithDateRangePicker from "./SceneHeaderWithDateRangePicker";

export default {
    title: "Organisms/Scene Header with Date Range Picker",
    component: SceneHeaderWithDateRangePicker
};

const WrappedComponent = () => (
    <DateRangeProvider>
        <SceneHeaderWithDateRangePicker title={text("Title", "Dashboard")} />
    </DateRangeProvider>
);

/** The large view of the `SceneHeaderWithDateRangePicker`. */
export const Large = () => <WrappedComponent />;

/** The small view of the `SceneHeaderWithDateRangePicker`. */
export const Small = () => <WrappedComponent />;

Small.parameters = smallViewport;
