import {actions} from "@storybook/addon-actions";
import {boolean} from "@storybook/addon-knobs";
import React from "react";
import {smallViewport, smallLandscapeViewport} from "utils/stories";
import SidebarImportRuleForm, {
    PureComponent as PureSidebarImportRuleForm
} from "./SidebarImportRuleForm";

export default {
    title: "Scenes/Sidebar Import Rule Form",
    component: PureSidebarImportRuleForm
};

const formActions = actions("onClose");
const visibilityKnob = () => boolean("Visible", true);

/** The large view of `SidebarImportRuleForm`. */
export const Large = () => (
    <PureSidebarImportRuleForm isVisible={visibilityKnob()} {...formActions} />
);

/** The small view of `SidebarImportRuleForm`. */
export const Small = () => (
    <PureSidebarImportRuleForm isVisible={visibilityKnob()} {...formActions} />
);

Small.parameters = smallViewport;

/** The small landscape view of the `SidebarAccountForm`. */
export const SmallLandscape = () => (
    <PureSidebarImportRuleForm isVisible={visibilityKnob()} {...formActions} />
);

SmallLandscape.parameters = smallLandscapeViewport;

/** A story for testing that the connected `SidebarImportRuleForm` is working. */
export const Connected = () => <SidebarImportRuleForm isVisible={visibilityKnob()} />;
