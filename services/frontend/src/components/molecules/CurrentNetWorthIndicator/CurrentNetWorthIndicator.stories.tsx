import React from "react";
import {PureComponent as CurrentNetWorthIndicator} from "./CurrentNetWorthIndicator";

export default {
    title: "Molecules/Current Net Worth Indicator",
    component: CurrentNetWorthIndicator
};

/** The default view of `CurrentNetWorthIndicator`. */
export const Default = () => <CurrentNetWorthIndicator currentNetWorth={123456789} />;
