import {boolean} from "@storybook/addon-knobs";
import React from "react";
import {smallViewport} from "utils/stories";
import LoadingSpinner from "./LoadingSpinner";

export default {
    title: "Atoms/Loading Spinner",
    component: LoadingSpinner
};

/** A `LoadingSpinner` that loads. */
export const Normal = () => <LoadingSpinner loading={boolean("Loading", true)} />;

/** What the `LoadingSpinner` looks like on small devices. */
export const Small = () => <LoadingSpinner loading={boolean("Loading", true)} />;

Small.parameters = smallViewport;
