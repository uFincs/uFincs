import {action} from "@storybook/addon-actions";
import {boolean} from "@storybook/addon-knobs";
import React from "react";
import {smallViewport, smallLandscapeViewport} from "utils/stories";
import SidebarAccountForm, {PureComponent as PureSidebarAccountForm} from "./SidebarAccountForm";

export default {
    title: "Scenes/Sidebar Account Form",
    component: PureSidebarAccountForm
};

const visibilityKnob = () => boolean("Visible", true);

/** The large (desktop) view of the `SidebarAccountForm`. */
export const Large = () => (
    <PureSidebarAccountForm isVisible={visibilityKnob()} onClose={action("close")} />
);

/** The small (mobile) view of the `SidebarAccountForm`. */
export const Small = () => (
    <PureSidebarAccountForm isVisible={visibilityKnob()} onClose={action("close")} />
);

Small.parameters = smallViewport;

/** The small (mobile) landscape view of the `SidebarAccountForm`. */
export const SmallLandscape = () => (
    <PureSidebarAccountForm isVisible={visibilityKnob()} onClose={action("close")} />
);

SmallLandscape.parameters = smallLandscapeViewport;

/** A story for testing that the connected `SidebarAccountForm` is working. */
export const Connected = () => <SidebarAccountForm isVisible={visibilityKnob()} />;
