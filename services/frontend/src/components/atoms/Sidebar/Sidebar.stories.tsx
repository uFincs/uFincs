import {action} from "@storybook/addon-actions";
import {boolean} from "@storybook/addon-knobs";
import React from "react";
import {smallViewport, smallLandscapeViewport} from "utils/stories";
import Sidebar from "./Sidebar";

export default {
    title: "Atoms/Sidebar",
    component: Sidebar
};

const visibilityKnob = () => boolean("Visible", true);

/** The `Sidebar` as a basic container with some basic content. */
export const Large = () => (
    <Sidebar isVisible={visibilityKnob()} onClose={action("close")}>
        <p>Some content</p>
    </Sidebar>
);

/** The `Sidebar` takes up the whole screen on small devices. */
export const Small = () => (
    <Sidebar isVisible={visibilityKnob()} onClose={action("close")}>
        <p>Some content</p>
    </Sidebar>
);

Small.parameters = smallViewport;

/** The `Sidebar` should still work in landscape. */
export const SmallLandscape = () => (
    <Sidebar isVisible={visibilityKnob()} onClose={action("close")}>
        <p>Some content</p>
    </Sidebar>
);

SmallLandscape.parameters = smallLandscapeViewport;
