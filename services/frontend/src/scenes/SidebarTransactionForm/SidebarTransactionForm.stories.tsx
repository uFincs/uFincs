import {actions} from "@storybook/addon-actions";
import {boolean} from "@storybook/addon-knobs";
import React from "react";
import {smallViewport, smallLandscapeViewport} from "utils/stories";
import SidebarTransactionForm, {
    PureComponent as PureSidebarTransactionForm
} from "./SidebarTransactionForm";

export default {
    title: "Scenes/Sidebar Transaction Form",
    component: PureSidebarTransactionForm
};

const formActions = actions("onClose");

const visibilityKnob = () => boolean("Visible", true);

/** The large (desktop) view of the `SidebarTransactionForm`. */
export const Large = () => <SidebarTransactionForm isVisible={visibilityKnob()} {...formActions} />;

/** The small (mobile) view of the `SidebarTransactionForm`. */
export const Small = () => <SidebarTransactionForm isVisible={visibilityKnob()} {...formActions} />;

Small.parameters = smallViewport;

/** The small (mobile) landscape view of the `SidebarTransactionForm`. */
export const SmallLandscape = () => (
    <SidebarTransactionForm isVisible={visibilityKnob()} {...formActions} />
);

SmallLandscape.parameters = smallLandscapeViewport;

/** A story for testing that the connected `SidebarTransactionForm` is working. */
export const Connected = () => <SidebarTransactionForm isVisible={visibilityKnob()} />;
