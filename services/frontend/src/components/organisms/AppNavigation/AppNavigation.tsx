import classNames from "classnames";
import React from "react";
import {animated, to as interpolate} from "react-spring";
import {Divider, OutlineButton} from "components/atoms";
import {
    AppRefreshButton,
    CurrentNetWorthIndicator,
    GlobalAddButton,
    LogoLink,
    NavItemAccounts,
    NavItemDashboard,
    NavItemSettings,
    NavItemTransactions,
    TabBar,
    UserDropdown
} from "components/molecules";
import {useHideOnScroll, useNoAccount} from "hooks/";
import {NativePlatformsService} from "services/";
import {isSafariBrowser} from "utils/browserChecks";
import ScreenUrls, {DerivedAppScreenUrls} from "values/screenUrls";
import "./AppNavigation.scss";
import connect, {ConnectedProps} from "./connect";

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

interface AppNavigationProps extends ConnectedProps {
    /** Custom class name. */
    className?: string;
}

/** The header for the app that has all of the global navigation and actions. */
const AppNavigation = (props: AppNavigationProps) => (
    <>
        <LargeAppNavigation {...props} />
        <SmallAppNavigation {...props} />
    </>
);

export const PureComponent = AppNavigation;
export default connect(AppNavigation);

/* Helper Functions */

/** Used by the LargeAppNavigation to reverse map the indexes to URLs.
 *  This is necessary for handling the special keyboard navigation of the TabBar. */
const mapIndexToScreenUrl = (index: number) => {
    switch (index) {
        case 0:
            return ScreenUrls.APP;
        case 1:
            return DerivedAppScreenUrls.ACCOUNTS;
        case 2:
            return DerivedAppScreenUrls.TRANSACTIONS;
        default:
            return ScreenUrls.APP;
    }
};

/* Other Components */

const LargeAppNavigation = ({
    className,
    active = 0,
    onNavigate,
    onNoAccountSignUp
}: AppNavigationProps) => {
    const noAccount = useNoAccount();

    return (
        <header
            className={classNames("AppNavigation--large", className)}
            data-testid="app-navigation-large"
        >
            <div className="AppNavigation-content">
                <div className="AppNavigation-content-left">
                    <LogoLink
                        className="AppNavigation-LogoLink"
                        to={ScreenUrls.APP}
                        size="small"
                        data-testid="app-navigation-logo-link"
                    />

                    <TabBar
                        className="AppNavigation-nav-group"
                        underlineClassName="AppNavigation-nav-group-underline"
                        activeTab={active}
                        disableTabClick={true}
                        tabs={navTabs}
                        onTabChange={(index) => onNavigate(mapIndexToScreenUrl(index))}
                        data-testid="app-navigation-large-item"
                    />
                </div>

                <div className="AppNavigation-content-right">
                    {noAccount && !NativePlatformsService.isMobilePlatform() && (
                        <OutlineButton
                            className="AppNavigation-signup-button"
                            data-testid="app-navigation-signup"
                            colorTheme="warning"
                            onClick={onNoAccountSignUp}
                        >
                            Sign Up
                        </OutlineButton>
                    )}

                    <AppRefreshButton />

                    <GlobalAddButton className="AppNavigation-add-button" variant="large" />

                    <CurrentNetWorthIndicator />

                    <UserDropdown />
                </div>
            </div>

            <Divider />
        </header>
    );
};

const SmallAppNavigation = ({className, active = 0}: AppNavigationProps) => {
    const translateY = useHideOnScroll({translateAmount: 120});

    return (
        <animated.nav
            className={classNames(
                "AppNavigation--small",
                {"AppNavigation--small-safari": isSafariBrowser()},
                className
            )}
            data-testid="app-navigation-small"
            style={{
                // Need the translateX since the nav uses the absolute positioned
                // centering trick.
                transform: interpolate([translateY], (y) => `translateX(-50%) translateY(${y}px)`)
            }}
        >
            <div className="AppNavigation-nav-group" aria-label="First Navigation Group">
                <NavItemDashboard
                    active={active === 0}
                    data-testid="app-navigation-small-item-Dashboard"
                />

                <NavItemAccounts
                    active={active === 1}
                    data-testid="app-navigation-small-item-Accounts"
                />
            </div>

            <GlobalAddButton className="AppNavigation-add-button" variant="small" />

            {/* Use aria-hidden so that the spacer is removed from the Accessibility tree. */}
            <div className="AppNavigation-spacer" aria-hidden="true" />

            <div className="AppNavigation-nav-group" aria-label="Last Navigation Group">
                <NavItemTransactions
                    active={active === 2}
                    data-testid="app-navigation-small-item-Transactions"
                />

                <NavItemSettings
                    active={active === 3}
                    data-testid="app-navigation-small-item-Settings"
                />
            </div>
        </animated.nav>
    );
};
