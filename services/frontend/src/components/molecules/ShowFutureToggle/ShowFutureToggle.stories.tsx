import {actions} from "@storybook/addon-actions";
import {boolean} from "@storybook/addon-knobs";
import React from "react";
import {PureComponent as ShowFutureToggle} from "./ShowFutureToggle";

export default {
    title: "Molecules/Show Future Toggle",
    component: ShowFutureToggle
};

const buttonActions = () => actions("onToggle");

/** The default view of `ShowFutureToggle`. */
export const Default = () => (
    <ShowFutureToggle active={boolean("Active", false)} {...buttonActions()} />
);
