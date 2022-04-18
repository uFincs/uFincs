import {action} from "@storybook/addon-actions";
import {select, text} from "@storybook/addon-knobs";
import React from "react";
import {PlusIcon} from "assets/icons";
import {smallViewport} from "utils/stories";
import Button from "./Button";

export default {
    title: "Atoms/Button",
    component: Button
};

const clickAction = () => action("clicked");
const disabledOnClickAction = () => action("disabledOnClick");
const labelKnob = () => text("Label", "Login");
const variantKnob = () => select("Variant", ["primary", "secondary"], "primary");

/** What a regular `Button` looks like: a rectangle with some text. */
export const WithLabel = () => <Button onClick={clickAction()}>{labelKnob()}</Button>;

/** Mixing things up by using an icon instead of text for the label in the `Button`.
 *
 *  **Note**: Now that the content is only an icon, it needs an `aria-label` for screen readers.
 */
export const WithIcon = () => (
    <Button aria-label="Add" variant={variantKnob()} onClick={clickAction()}>
        <PlusIcon />
    </Button>
);

/** What the `Button` looks like on small devices. */
export const Small = () => (
    <Button variant={variantKnob()} onClick={clickAction()}>
        {labelKnob()}
    </Button>
);

Small.parameters = smallViewport;

/** When the `Button` has too long a label, it should cut off the label and show ellipsis. */
export const WithLongLabel = () => (
    <Button variant={variantKnob()} onClick={clickAction()}>
        {text("Long Label", "This is a label that is way too long and will go outside the button")}
    </Button>
);

/** The 'secondary' variant of the `Button`, which has a neutral background instead of
 *  the primary color.
 *
 *  Useful for secondary actions. */
export const SecondaryVariant = () => (
    <Button variant="secondary" onClick={clickAction()}>
        {labelKnob()}
    </Button>
);

/** A disabled `Button` uses reduced contrast between its background and its label to indicate
 *  its disabled state.
 *
 *  A disabled button won't trigger any click events.
 */
export const Disabled = () => (
    <Button variant={variantKnob()} disabled={true} onClick={clickAction()}>
        {labelKnob()}
    </Button>
);

/** A 'disabled' `Button` that also has a 'frustration' click handler.
 *  The button should still look disabled, but it still has a (separate) click handler. */
export const DisabledWithClickHandler = () => (
    <Button
        variant={variantKnob()}
        disabled={true}
        onClick={clickAction()}
        disabledOnClick={disabledOnClickAction()}
    >
        {labelKnob()}
    </Button>
);

/** A `Button` with the focus outline forcefully applied. */
export const FocusOutline = () => (
    <Button className="Element--story-FocusOutline" variant={variantKnob()} onClick={clickAction()}>
        {labelKnob()}
    </Button>
);
