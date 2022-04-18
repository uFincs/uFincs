import {action} from "@storybook/addon-actions";
import {boolean, text} from "@storybook/addon-knobs";
import React from "react";
import {PlusIcon} from "assets/icons";
import OutlineButton from "./OutlineButton";

export default {
    title: "Atoms/Outline Button",
    component: OutlineButton
};

/** An `OutlineButton` with a label; what it usually looks like. */
export const WithLabel = () => (
    <OutlineButton onClick={action("clicked")}>{text("Label", "Login")}</OutlineButton>
);

/** An `OutlineButton` with an icon. */
export const WithIcon = () => (
    <OutlineButton onClick={action("clicked")} aria-label="Add">
        <PlusIcon />
    </OutlineButton>
);

/** An `OutlineButton` with a label that is too long to all fit in the button. */
export const WithLongLabel = () => (
    <OutlineButton onClick={action("clicked")}>
        {text("Long Label", "This is a label that is way too long and will go outside the button")}
    </OutlineButton>
);

/** The serendipitous disabled state of an `OutlineButton`. */
export const Disabled = () => (
    <OutlineButton disabled={boolean("Disabled", true)} onClick={action("clicked")}>
        {text("Label", "Login")}
    </OutlineButton>
);

/** The `light` color theme variant of the `OutlineButton`. */
export const LightColorTheme = () => (
    <OutlineButton colorTheme="light" onClick={action("clicked")}>
        {text("Label", "Login")}
    </OutlineButton>
);

/** The `warning` color theme variant of the `OutlineButton`. */
export const WarningColorTheme = () => (
    <OutlineButton colorTheme="warning" onClick={action("clicked")}>
        {text("Label", "Login")}
    </OutlineButton>
);
