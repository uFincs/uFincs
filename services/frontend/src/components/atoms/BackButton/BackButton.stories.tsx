import {actions} from "@storybook/addon-actions";
import React from "react";
import BackButton from "./BackButton";

export default {
    title: "Atoms/Back Button",
    component: BackButton
};

const buttonActions = actions("onClick");

/** The default view of a `BackButton`. */
export const Default = () => <BackButton {...buttonActions} />;

/** The disabled view of a `BackButton`. */
export const Disabled = () => <BackButton disabled={true} {...buttonActions} />;

/** A `BackButton` with the focus outline forcefully applied. */
export const FocusOutline = () => (
    <BackButton className="Element--story-FocusOutline" {...buttonActions} />
);
