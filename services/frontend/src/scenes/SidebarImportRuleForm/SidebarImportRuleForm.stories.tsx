import type {Meta, StoryObj} from "@storybook/react";
import {smallLandscapeViewport, smallViewport, storyUsingRedux} from "utils/stories";
import SidebarImportRuleForm, {
    PureComponent as PureSidebarImportRuleForm
} from "./SidebarImportRuleForm";

const meta: Meta<typeof PureSidebarImportRuleForm> = {
    title: "Scenes/Sidebar Import Rule Form",
    component: PureSidebarImportRuleForm,
    args: {
        isVisible: true
    }
};

export default meta;
type Story = StoryObj<typeof PureSidebarImportRuleForm>;

/** The large view of `SidebarImportRuleForm`. */
export const Large: Story = {};

/** The small view of `SidebarImportRuleForm`. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};

/** The small landscape view of the `SidebarImportRuleForm`. */
export const SmallLandscape: Story = {
    parameters: {
        ...smallLandscapeViewport
    }
};

/** A story for testing that the connected `SidebarImportRuleForm` is working. */
export const Connected: Story = {
    render: storyUsingRedux(SidebarImportRuleForm)
};
