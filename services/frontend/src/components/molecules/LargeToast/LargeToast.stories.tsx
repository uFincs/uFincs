import {actions} from "@storybook/addon-actions";
import {select, text} from "@storybook/addon-knobs";
import React from "react";
import {smallViewport} from "utils/stories";
import LargeToast from "./LargeToast";

export default {
    title: "Molecules/Large Toast",
    component: LargeToast
};

const toastActions = actions("onClose");

const messageKnob = () =>
    text("Message", "Some other more detailed message that can span multiple lines.");

const titleKnob = () => text("Title", "Title!");
const variantKnob = () => select("Variant", ["positive", "warning", "negative"], "positive");

/** The default view of a `LargeToast`. */
export const Default = () => (
    <LargeToast
        message={messageKnob()}
        title={titleKnob()}
        variant={variantKnob()}
        {...toastActions}
    />
);

/** The small (mobile) view of a `LargeToast`. */
export const Small = () => (
    <LargeToast
        message={messageKnob()}
        title={titleKnob()}
        variant={variantKnob()}
        {...toastActions}
    />
);

Small.parameters = smallViewport;

/** What a positive `LargeToast` looks like.
 *
 *  Can be used as a confirmation for large/important operations where the user has reasonable
 *  doubt that the operation could have succeeded or failed.
 *
 *  It should _not_ be used for day-to-day operations that happen fairly frequently, like
 *  creating accounts or transactions. That is just too clutter-y.
 */
export const Positive = () => (
    <LargeToast message={messageKnob()} title={titleKnob()} variant="positive" {...toastActions} />
);

/** What a warning `LargeToast` looks like. */
export const Warning = () => (
    <LargeToast message={messageKnob()} title={titleKnob()} variant="warning" {...toastActions} />
);

/** What an negative `LargeToast` looks like. */
export const Negative = () => (
    <LargeToast message={messageKnob()} title={titleKnob()} variant="negative" {...toastActions} />
);

/** What a `LargeToast` looks like when only given a title.
 *
 *  This is ideal for short messages that need to be communicated to the user.
 *
 *  This is used over the `ShortToast` when the operation needs a positive/warning/negative meaning.
 */
export const NoMessage = () => (
    <LargeToast title={titleKnob()} variant={variantKnob()} {...toastActions} />
);
