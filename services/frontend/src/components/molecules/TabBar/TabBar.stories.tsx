import React, {useState} from "react";
import {NavItemAccounts, NavItemDashboard, NavItemTransactions} from "components/molecules";
import TabBar from "./TabBar";

export default {
    title: "Molecules/Tab Bar",
    component: TabBar
};

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
export const Default = () => {
    const [active, setActive] = useState(0);

    return <TabBar activeTab={active} tabs={tabs} onTabChange={(index) => setActive(index)} />;
};

/** What a `TabBar` looks like while using `NavItem`s for the tabs. */
export const NavBar = () => {
    const [active, setActive] = useState(0);

    return <TabBar activeTab={active} tabs={navTabs} onTabChange={(index) => setActive(index)} />;
};

/** An example of how to change the style of the underline to be farther from the tabs. */
export const FartherUnderline = () => {
    const [active, setActive] = useState(0);

    return (
        <TabBar
            underlineClassName="TabBar--story-FartherUnderline"
            activeTab={active}
            tabs={tabs}
            onTabChange={(index) => setActive(index)}
        />
    );
};
