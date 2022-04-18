import {actions} from "@storybook/addon-actions";
import {text} from "@storybook/addon-knobs";
import React from "react";
import IntervalSwitcher from "./IntervalSwitcher";

export default {
    title: "Atoms/Interval Switcher",
    component: IntervalSwitcher
};

const decrementActions = actions({onClick: "decrement"});
const incrementActions = actions({onClick: "increment"});
const switcherActions = actions("onKeyDown");

/** The default view of the `IntervalSwitcher`, with some mock content. */
export const Default = () => (
    <IntervalSwitcher
        decrementButtonProps={{...decrementActions, title: "Back"}}
        incrementButtonProps={{...incrementActions, title: "Forward"}}
        {...switcherActions}
    >
        <p>{text("Label", "Test")}</p>
    </IntervalSwitcher>
);

/** The `IntervalSwitcher` with the focus outline forcefully applied. */
export const FocusOutline = () => (
    <IntervalSwitcher
        className="Element--story-FocusOutline"
        decrementButtonProps={{...decrementActions, title: "Back"}}
        incrementButtonProps={{...incrementActions, title: "Forward"}}
        {...switcherActions}
    >
        <p>{text("Label", "Test")}</p>
    </IntervalSwitcher>
);
