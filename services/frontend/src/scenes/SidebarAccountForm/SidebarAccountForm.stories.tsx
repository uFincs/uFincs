import type {Meta, StoryObj} from "@storybook/react";
import {smallLandscapeViewport, smallViewport, storyUsingRedux} from "utils/stories";
import SidebarAccountForm, {PureComponent as PureSidebarAccountForm} from "./SidebarAccountForm";

const meta: Meta<typeof PureSidebarAccountForm> = {
    title: "Scenes/Sidebar Account Form",
    component: PureSidebarAccountForm,
    args: {
        isVisible: true
    }
};

export default meta;
type Story = StoryObj<typeof PureSidebarAccountForm>;

/** The large (desktop) view of the `SidebarAccountForm`. */
export const Large: Story = {};

/** The small (mobile) view of the `SidebarAccountForm`. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};

/** The small (mobile) landscape view of the `SidebarAccountForm`. */
export const SmallLandscape: Story = {
    parameters: {
        ...smallLandscapeViewport
    }
};

/** A story for testing that the connected `SidebarAccountForm` is working. */
export const Connected: Story = {
    render: storyUsingRedux(SidebarAccountForm)
};
