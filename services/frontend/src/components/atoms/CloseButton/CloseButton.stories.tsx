import {actions} from "@storybook/addon-actions";
import React from "react";
import CloseButton from "./CloseButton";

export default {
    title: "Atoms/Close Button",
    component: CloseButton
};

const buttonActions = actions("onClick");

/** The default view of a `CloseButton`. */
export const Default = () => <CloseButton {...buttonActions} />;

/** The disabled view of a `CloseButton`. */
export const Disabled = () => <CloseButton disabled={true} {...buttonActions} />;

/** A `CloseButton` with the focus outline forcefully applied. */
export const FocusOutline = () => (
    <CloseButton className="Element--story-FocusOutline" {...buttonActions} />
);
