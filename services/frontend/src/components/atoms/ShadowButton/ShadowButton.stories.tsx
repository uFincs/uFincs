import {action} from "@storybook/addon-actions";
import {boolean, text} from "@storybook/addon-knobs";
import React from "react";
import {PlusIcon} from "assets/icons";
import ShadowButton from "./ShadowButton";

export default {
    title: "Atoms/Shadow Button",
    component: ShadowButton
};

/** A `ShadowButton` with a label; what it usually looks like. */
export const WithLabel = () => (
    <ShadowButton onClick={action("clicked")}>{text("Label", "Login")}</ShadowButton>
);

/** A `ShadowButton` with an icon. */
export const WithIcon = () => (
    <ShadowButton onClick={action("clicked")} aria-label="Add">
        <PlusIcon />
    </ShadowButton>
);

/** The 'negative' variant of the `ShadowButton`. */
export const Negative = () => (
    <ShadowButton variant="negative" onClick={action("clicked")}>
        {text("Label", "Delete")}
    </ShadowButton>
);

/** The serendipitous disabled state of a `ShadowButton`. */
export const Disabled = () => (
    <ShadowButton disabled={boolean("Disabled", true)} onClick={action("clicked")}>
        {text("Label", "Login")}
    </ShadowButton>
);

/** The disabled state of the 'negative' variant of a `ShadowButton`. */
export const DisabledNegative = () => (
    <ShadowButton
        disabled={boolean("Disabled", true)}
        variant="negative"
        onClick={action("clicked")}
    >
        {text("Label", "Delete")}
    </ShadowButton>
);
