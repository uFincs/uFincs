import {boolean} from "@storybook/addon-knobs";
import React from "react";
import BackgroundBlur from "./BackgroundBlur";

export default {
    title: "Atoms/Background Blur",
    component: BackgroundBlur
};

/** The default view of the `BackgroundBlur`.
 *  It should cover the test content and blur it. */
export const Default = () => (
    <div>
        <p>Test content</p>

        <BackgroundBlur isVisible={boolean("Visible", true)} />
    </div>
);
