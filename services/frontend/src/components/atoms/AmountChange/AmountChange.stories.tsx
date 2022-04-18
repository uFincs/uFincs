import {boolean, number} from "@storybook/addon-knobs";
import React from "react";
import AmountChange from "./AmountChange";

export default {
    title: "Atoms/Amount Change",
    component: AmountChange
};

const lightShadeKnob = () => boolean("Light Shade", false);
const positiveBadKnob = () => boolean("Positive is Bad", false);
const showDifferenceKnob = () => boolean("Show Difference", false);

/** The default view of `AmountChange`. */
export const Default = () => (
    <AmountChange
        oldAmount={number("Old Amount", 140000)}
        newAmount={number("New Amount", 150000)}
        lightShade={lightShadeKnob()}
        positiveIsBad={positiveBadKnob()}
        showDifference={showDifferenceKnob()}
    />
);

/** `AmountChange` using light shades of colors; for use on a dark background.. */
export const LightShade = () => (
    <AmountChange
        oldAmount={number("Old Amount", 140000)}
        newAmount={number("New Amount", 150000)}
        lightShade={true}
        positiveIsBad={positiveBadKnob()}
        showDifference={showDifferenceKnob()}
    />
);

/** `AmountChange` for values where positive changes are bad and negative are good. */
export const PositiveIsBad = () => (
    <AmountChange
        oldAmount={number("Old Amount", 140000)}
        newAmount={number("New Amount", 150000)}
        lightShade={lightShadeKnob()}
        positiveIsBad={true}
        showDifference={showDifferenceKnob()}
    />
);

/** `AmountChange` with showing the difference between the two amounts. */
export const ShowDifference = () => (
    <AmountChange
        oldAmount={number("Old Amount", 140000)}
        newAmount={number("New Amount", 150000)}
        lightShade={lightShadeKnob()}
        positiveIsBad={positiveBadKnob()}
        showDifference={true}
    />
);
