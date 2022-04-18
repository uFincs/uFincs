import {boolean, number} from "@storybook/addon-knobs";
import React from "react";
import FromAmount from "./FromAmount";

export default {
    title: "Atoms/From Amount",
    component: FromAmount
};

const lightShadeKnob = () => boolean("Light Shade", false);

/** The default view of the `FromAmount`. */
export const Default = () => (
    <FromAmount amount={number("Amount", 140000)} lightShade={lightShadeKnob()} />
);

/** The light view of the `FromAmount`, for use on dark backgrounds. */
export const LightShade = () => <FromAmount amount={number("Amount", 140000)} lightShade={true} />;
