import React, {useEffect} from "react";
import {useDateRange, DateRangeProvider} from "hooks/";
import {DateRangeSize} from "hooks/useDateRange";
import {smallViewport} from "utils/stories";
import DateSwitcher from "./DateSwitcher";

export default {
    title: "Molecules/Date Switcher",
    component: DateSwitcher
};

/** The default view of the `DateSwitcher`. */
export const Default = () => (
    <DateRangeProvider>
        <DateSwitcher />
    </DateRangeProvider>
);

/** The small view of the `DateSwitcher`. */
export const Small = () => (
    <DateRangeProvider>
        <DateSwitcher />
    </DateRangeProvider>
);

Small.parameters = smallViewport;

const DisabledComponent = () => {
    const {dispatch} = useDateRange();

    useEffect(() => {
        dispatch.setRangeSize(DateRangeSize.allTime);
    }, [dispatch]);

    return <DateSwitcher />;
};

/** The disabled view of the `DateSwitcher`. */
export const Disabled = () => (
    <DateRangeProvider>
        <DisabledComponent />
    </DateRangeProvider>
);
