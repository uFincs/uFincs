import {boolean, number} from "@storybook/addon-knobs";
import React from "react";
import CurrentAmount from "./CurrentAmount";

export default {
    title: "Atoms/Current Amount",
    component: CurrentAmount
};

const lightShadeKnob = () => boolean("Light Shade", false);

/** The default view of the `CurrentAmount`. */
export const Default = () => (
    <CurrentAmount amount={number("Amount", 1000000)} lightShade={lightShadeKnob()} />
);

/** The light view of the `CurrentAmount`, for use on dark backgrounds. */
export const LightShade = () => (
    <CurrentAmount amount={number("Amount", 1000000)} lightShade={true} />
);
