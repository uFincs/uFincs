import {number, text} from "@storybook/addon-knobs";
import React from "react";
import ChartStats from "./ChartStats";

export default {
    title: "Charts/Components/ChartStats",
    component: ChartStats
};

const currentKnob = () => number("Current Amount", 10000);
const fromKnob = () => number("From Amount", 5000);
const titleKnob = () => text("Title", "Net Worth");

/** The default view of the `ChartStats`. */
export const Default = () => (
    <ChartStats currentAmount={currentKnob()} fromAmount={fromKnob()} title={titleKnob()} />
);
