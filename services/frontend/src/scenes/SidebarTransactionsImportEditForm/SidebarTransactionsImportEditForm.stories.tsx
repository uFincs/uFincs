import {actions} from "@storybook/addon-actions";
import {boolean} from "@storybook/addon-knobs";
import React from "react";
import {smallViewport, smallLandscapeViewport} from "utils/stories";
import SidebarTransactionsImportEditForm, {
    PureComponent as PureSidebarTransactionsImportEditForm
} from "./SidebarTransactionsImportEditForm";

export default {
    title: "Scenes/Sidebar Transactions Import Edit Form",
    component: PureSidebarTransactionsImportEditForm
};

const formActions = actions("onClose");

const visibilityKnob = () => boolean("Visible", true);

/** The large (desktop) view of the `SidebarTransactionsImportEditForm`. */
export const Large = () => (
    <SidebarTransactionsImportEditForm isVisible={visibilityKnob()} {...formActions} />
);

/** The small (mobile) view of the `SidebarTransactionsImportEditForm`. */
export const Small = () => (
    <SidebarTransactionsImportEditForm isVisible={visibilityKnob()} {...formActions} />
);

Small.parameters = smallViewport;

/** The small (mobile) landscape view of the `SidebarTransactionsImportEditForm`. */
export const SmallLandscape = () => (
    <SidebarTransactionsImportEditForm isVisible={visibilityKnob()} {...formActions} />
);

SmallLandscape.parameters = smallLandscapeViewport;

/** A story for testing that the connected `SidebarTransactionsImportEditForm` is working. */
export const Connected = () => <SidebarTransactionsImportEditForm isVisible={visibilityKnob()} />;
