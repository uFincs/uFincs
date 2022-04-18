import {select} from "@storybook/addon-knobs";
import React from "react";
import Logo from "./Logo";

export default {
    title: "Atoms/Logo",
    component: Logo
};

const selectColor = () =>
    select(
        "Color Theme",
        {
            Light: "light",
            Dark: "dark"
        },
        "dark"
    );

const selectSize = () =>
    select(
        "Size",
        {
            Large: "large",
            Small: "small"
        },
        "large"
    );

/** The full `Logo` has the full name of the app. */
export const Full = () => <Logo colorTheme={selectColor()} size={selectSize()} />;

/** The standalone `Logo` has just the `u` in uFincs, which is our trademark symbol. */
export const Standalone = () => (
    <Logo variant="standalone" colorTheme={selectColor()} size={selectSize()} />
);
