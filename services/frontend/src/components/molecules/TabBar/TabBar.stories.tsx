import {Meta, StoryObj} from "@storybook/react";
import {NavItemAccounts, NavItemDashboard, NavItemTransactions} from "components/molecules";
import TabBar from "./TabBar";

const meta: Meta<typeof TabBar> = {
    title: "Molecules/Tab Bar",
    component: TabBar,
    args: {
        activeTab: 0
    }
};

export default meta;
type Story = StoryObj<typeof TabBar>;

const tabs = [{label: "Item 1"}, {label: "2"}, {label: "A longer item 3"}];

const navTabs = [
    {
        label: "Dashboard",
        Component: NavItemDashboard
    },
    {
        label: "Accounts",
        Component: NavItemAccounts
    },
    {
        label: "Transactions",
        Component: NavItemTransactions
    }
];

/** The default view of a `TabBar`, using simple labels for the tabs. */
export const Default: Story = {
    args: {
        tabs
    }
};

/** What a `TabBar` looks like while using `NavItem`s for the tabs. */
export const NavBar: Story = {
    args: {
        tabs: navTabs
    }
};

/** An example of how to change the style of the underline to be farther from the tabs. */
export const FartherUnderline: Story = {
    args: {
        underlineClassName: "TabBar--story-FartherUnderline",
        tabs
    }
};
