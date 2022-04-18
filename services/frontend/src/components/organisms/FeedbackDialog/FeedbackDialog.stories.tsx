import {actions} from "@storybook/addon-actions";
import {boolean} from "@storybook/addon-knobs";
import React from "react";
import {PureComponent as FeedbackDialog} from "./FeedbackDialog";

export default {
    title: "Organisms/Feedback Dialog",
    component: FeedbackDialog
};

const dialogActions = actions("onClose");
const visibilityKnob = () => boolean("isVisible", true);

/** The default view of `FeedbackDialog`. */
export const Default = () => <FeedbackDialog isVisible={visibilityKnob()} {...dialogActions} />;

/** The Unhandled Error view of the `FeedbackDialog`. */
export const UnhandledError = () => (
    <FeedbackDialog
        isVisible={visibilityKnob()}
        unhandledError={new Error("oops")}
        {...dialogActions}
    />
);
