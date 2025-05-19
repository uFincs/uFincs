import type {Meta, StoryObj} from "@storybook/react";
import {smallLandscapeViewport, smallViewport, storyUsingRedux} from "utils/stories";
import SidebarTransactionForm, {
    PureComponent as PureSidebarTransactionForm
} from "./SidebarTransactionForm";

const meta: Meta<typeof PureSidebarTransactionForm> = {
    title: "Scenes/Sidebar Transaction Form",
    component: PureSidebarTransactionForm,
    args: {
        isVisible: true
    }
};

export default meta;
type Story = StoryObj<typeof PureSidebarTransactionForm>;

/** The large (desktop) view of the `SidebarTransactionForm`. */
export const Large: Story = {};

/** The small (mobile) view of the `SidebarTransactionForm`. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};

/** The small (mobile) landscape view of the `SidebarTransactionForm`. */
export const SmallLandscape: Story = {
    parameters: {
        ...smallLandscapeViewport
    }
};

/** A story for testing that the connected `SidebarTransactionForm` is working. */
export const Connected: Story = {
    render: storyUsingRedux(SidebarTransactionForm)
};
