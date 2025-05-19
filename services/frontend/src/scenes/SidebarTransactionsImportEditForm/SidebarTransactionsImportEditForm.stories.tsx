import type {Meta, StoryObj} from "@storybook/react";
import SidebarTransactionsImportEditForm from "./SidebarTransactionsImportEditForm";

const meta: Meta<typeof SidebarTransactionsImportEditForm> = {
    title: "Scenes/Sidebar Transactions Import Edit Form",
    component: SidebarTransactionsImportEditForm,
    args: {
        isVisible: true
    }
};

export default meta;
type Story = StoryObj<typeof SidebarTransactionsImportEditForm>;

/** The large (desktop) view of the `SidebarTransactionsImportEditForm`. */
export const Large: Story = {
    args: {
        isVisible: true
    }
};

/** The small (mobile) view of the `SidebarTransactionsImportEditForm`. */
export const Small: Story = {
    args: {
        isVisible: false
    },
    parameters: {
        viewport: {default: "small"}
    }
};

/** The small (mobile) landscape view of the `SidebarTransactionsImportEditForm`. */
export const SmallLandscape: Story = {
    args: {
        isVisible: false
    },
    parameters: {
        viewport: {default: "smallLandscape"}
    }
};

/** A story for testing that the connected `SidebarTransactionsImportEditForm` is working. */
export const Connected: Story = {
    args: {
        isVisible: true
    }
};
