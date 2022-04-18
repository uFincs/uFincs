import {action} from "@storybook/addon-actions";
import {boolean, text} from "@storybook/addon-knobs";
import React from "react";
import LinkButton from "./LinkButton";

export default {
    title: "Atoms/Link Button",
    component: LinkButton
};

const clickAction = () => action("clicked");
const labelKnob = () => text("Label", "Optional details");

/** What a regular `LinkButton` looks like: some text. */
export const Default = () => <LinkButton onClick={clickAction()}>{labelKnob()}</LinkButton>;

/** A non-interactive disabled `LinkButton`. */
export const Disabled = () => (
    <LinkButton disabled={boolean("Disabled", true)} onClick={clickAction()}>
        {labelKnob()}
    </LinkButton>
);

/** A `LinkButton` with the focus outline forcefully applied. */
export const FocusOutline = () => (
    <LinkButton className="Element--story-FocusOutline" onClick={clickAction()}>
        {labelKnob()}
    </LinkButton>
);
