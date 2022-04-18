import {actions} from "@storybook/addon-actions";
import {text} from "@storybook/addon-knobs";
import React from "react";
import {smallViewport} from "utils/stories";
import SmallToast from "./SmallToast";

export default {
    title: "Molecules/Small Toast",
    component: SmallToast
};

const toastActions = actions("onAction", "onClose");

const messageKnob = () => text("Message", "Transaction deleted");

/** The default view of a `SmallToast`. */
export const Default = () => <SmallToast message={messageKnob()} {...toastActions} />;

/** The small (mobile) view of a `SmallToast`. */
export const Small = () => <SmallToast message={messageKnob()} {...toastActions} />;

Small.parameters = smallViewport;

/** A `SmallToast` with an (undo) action. */
export const WithAction = () => (
    <SmallToast actionLabel="Undo" message={messageKnob()} {...toastActions} />
);
