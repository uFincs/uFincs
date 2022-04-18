import {boolean} from "@storybook/addon-knobs";
import React from "react";
import {DashboardIcon} from "assets/icons";
import {smallViewport} from "utils/stories";
import NavItem, {
    NavItemAccounts,
    NavItemDashboard,
    NavItemSettings,
    NavItemTransactions
} from "./NavItem";

export default {
    title: "Molecules/Nav Item",
    component: NavItem
};

const activeKnob = () => boolean("Active", false);

/** The large view of the `NavItem`. */
export const Large = () => (
    <NavItem Icon={DashboardIcon} active={activeKnob()} label="Dashboard" to="/test" />
);

/** The small view of the `NavItem`. */
export const Small = () => (
    <NavItem Icon={DashboardIcon} active={activeKnob()} label="Dashboard" to="/test" />
);

Small.parameters = smallViewport;

/** The Dashboard variant of the `NavItem` */
export const Dashboard = () => <NavItemDashboard active={activeKnob()} />;

/** The Accounts variant of the `NavItem` */
export const Accounts = () => <NavItemAccounts active={activeKnob()} />;

/** The Transactions variant of the `NavItem` */
export const Transactions = () => <NavItemTransactions active={activeKnob()} />;

/** The Settings variant of the `NavItem` */
export const Settings = () => <NavItemSettings active={activeKnob()} />;
