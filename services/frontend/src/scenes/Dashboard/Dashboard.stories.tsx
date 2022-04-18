import React from "react";
import {DateRangeProvider} from "hooks/";
import {smallViewport} from "utils/stories";
import Dashboard from "./Dashboard";

export default {
    title: "Scenes/Dashboard",
    component: Dashboard
};

const WrappedDashboard = () => (
    <DateRangeProvider>
        <Dashboard />
    </DateRangeProvider>
);

/** The large view of the `Dashboard` scene. */
export const Large = () => <WrappedDashboard />;

/** The small view of the `Dashboard` scene. */
export const Small = () => <WrappedDashboard />;

Small.parameters = smallViewport;
