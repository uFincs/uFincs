import {Meta, StoryObj} from "@storybook/react";
import {DashboardIcon} from "assets/icons";
import {smallViewport} from "utils/stories";
import NavItem, {
    NavItemAccounts,
    NavItemDashboard,
    NavItemSettings,
    NavItemTransactions
} from "./NavItem";

const meta: Meta<typeof NavItemAccounts> = {
    title: "Molecules/Nav Item",
    component: NavItem,
    args: {
        active: false
    }
};

export default meta;
type Story = StoryObj<typeof NavItemAccounts>;

/** The large view of the `NavItem`. */
export const Large: Story = {
    args: {
        label: "Dashboard",
        to: "/test",
        Icon: DashboardIcon
    }
};

/** The small view of the `NavItem`. */
export const Small: Story = {
    args: {
        label: "Dashboard",
        to: "/test",
        Icon: DashboardIcon
    },
    parameters: {
        ...smallViewport
    }
};

/** The Dashboard variant of the `NavItem` */
export const Dashboard: Story = {
    render: (args) => <NavItemDashboard {...args} />
};

/** The Accounts variant of the `NavItem` */
export const Accounts: Story = {
    render: (args) => <NavItemAccounts {...args} />
};

/** The Transactions variant of the `NavItem` */
export const Transactions: Story = {
    render: (args) => <NavItemTransactions {...args} />
};

/** The Settings variant of the `NavItem` */
export const Settings: Story = {
    render: (args) => <NavItemSettings {...args} />
};
