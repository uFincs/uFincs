import classNames from "classnames";
import React from "react";
import {DashboardIcon, AccountsIcon, SettingsIcon, TransactionsIcon} from "assets/icons";
import {Link, TextField} from "components/atoms";
import {LinkProps} from "components/atoms/Link";
import ScreenUrls, {DerivedAppScreenUrls} from "values/screenUrls";
import "./NavItem.scss";

interface NavItemProps extends Omit<LinkProps, "children"> {
    /** Custom class name. */
    className?: string;

    /** The icon to show. */
    Icon: React.ComponentType<{className?: string}>;

    /** Whether or not this is the currently active `NavItem`. */
    active?: boolean;

    /** The label to show. */
    label: string;

    /** Where the `NavItem` links to. */
    to: string;
}

/** The item to be used in `AppNavigation` for navigating between pages. */
const NavItem = ({className, Icon, active = false, label, to, ...otherProps}: NavItemProps) => (
    <Link
        className={classNames("NavItem", {"NavItem--active": active}, className)}
        aria-label={label}
        to={to}
        {...otherProps}
    >
        <Icon className="NavItem-icon" />
        <TextField className="NavItem-TextField">{label}</TextField>
    </Link>
);

/** The Dashboard variant of the `NavItem` */
export const NavItemDashboard = ({active, ...otherProps}: Partial<NavItemProps>) => (
    <NavItem
        Icon={DashboardIcon}
        active={active}
        label="Dashboard"
        to={ScreenUrls.APP}
        {...otherProps}
    />
);

/** The Accounts variant of the `NavItem` */
export const NavItemAccounts = ({active, ...otherProps}: Partial<NavItemProps>) => (
    <NavItem
        Icon={AccountsIcon}
        active={active}
        label="Accounts"
        to={DerivedAppScreenUrls.ACCOUNTS}
        {...otherProps}
    />
);

/** The Transactions variant of the `NavItem` */
export const NavItemTransactions = ({active, ...otherProps}: Partial<NavItemProps>) => (
    <NavItem
        Icon={TransactionsIcon}
        active={active}
        label="Transactions"
        to={DerivedAppScreenUrls.TRANSACTIONS}
        {...otherProps}
    />
);

/** The Settings variant of the `NavItem` */
export const NavItemSettings = ({active, ...otherProps}: Partial<NavItemProps>) => (
    <NavItem
        Icon={SettingsIcon}
        active={active}
        label="Settings"
        to={DerivedAppScreenUrls.SETTINGS}
        {...otherProps}
    />
);

export default NavItem;
