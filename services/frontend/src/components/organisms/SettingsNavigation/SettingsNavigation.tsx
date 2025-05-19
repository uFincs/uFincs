import classNames from "classnames";
import {useMemo} from "react";
import {useHistory, useLocation} from "react-router";
import {CalendarIcon, ChatIcon, LogoutIcon, RefreshIcon} from "assets/icons";
import {Divider} from "components/atoms";
import {SettingsListItem} from "components/molecules";
import {useLifetimeSubscription, useNoAccount} from "hooks/";
import {MathUtils} from "services/";
import {DerivedAppScreenUrls} from "values/screenUrls";
import "./SettingsNavigation.scss";

interface SettingsItemConfig {
    description: string;
    title: string;
    url: string;
}

const CALENDAR_ICON = <CalendarIcon className="SettingsNavigation-regular-icon" />;
const CHAT_ICON = <ChatIcon className="SettingsNavigation-regular-icon" />;
const LOGOUT_ICON = <LogoutIcon className="SettingsNavigation-logout-icon" />;
const REFRESH_ICON = <RefreshIcon className="SettingsNavigation-regular-icon" />;

const generateSettingsItems = (noAccount: boolean, lifetimeSubscription: boolean) => {
    const items: Array<SettingsItemConfig> = [];

    if (!noAccount) {
        items.push({
            description: "Change your email and password",
            title: "User Account",
            url: DerivedAppScreenUrls.SETTINGS_USER_ACCOUNT
        });

        // TODO: Implement this.
        // Removed for now until we decide to finally implement this.
        // items.push({
        //     description: "Modify and remove CSV formats",
        //     title: "CSV Import Formats",
        //     url: DerivedAppScreenUrls.SETTINGS_IMPORT_PROFILES
        // });
    }

    if (!noAccount && !lifetimeSubscription) {
        items.push({
            description: "View and update your subscription",
            title: "Billing",
            url: DerivedAppScreenUrls.SETTINGS_BILLING
        });
    }

    items.push({
        description: "Configure the app just how you like it",
        title: "My Preferences",
        url: DerivedAppScreenUrls.SETTINGS_PREFERENCES
    });

    items.push({
        description: "Export, backup, and restore your data",
        title: "My Data",
        url: DerivedAppScreenUrls.SETTINGS_DATA
    });

    return items;
};

interface SettingsNavigationProps {
    /** Custom class name. */
    className?: string;

    /** Whether or not to use the desktop layout (as opposed to the mobile layout). */
    desktopLayout: boolean;

    /** Callback for redirecting the user to the Changelog. */
    onChangelog?: () => void;

    /** Callback for checking for service worker updates. */
    onCheckForUpdates?: () => void;

    /** Callback for logging out (currently only used on mobile). */
    onLogout: () => void;

    /** Callback for navigating the user to the no-account sign up page. */
    onNoAccountSignUp: () => void;

    /** Callback for opening the Feedback dialog. */
    onSendFeedback?: () => void;
}

/** The set of navigation items used in the Settings scene. */
const SettingsNavigation = ({
    className,
    desktopLayout = false,
    onChangelog,
    onCheckForUpdates,
    onLogout,
    onNoAccountSignUp,
    onSendFeedback,
    ...otherProps
}: SettingsNavigationProps) => {
    const history = useHistory();
    const location = useLocation();

    const isLifetime = useLifetimeSubscription();
    const noAccount = useNoAccount();

    const itemsConfig = useMemo(
        () => generateSettingsItems(noAccount, isLifetime),
        [noAccount, isLifetime]
    );

    const items = useMemo(
        () =>
            itemsConfig.map(({url, ...props}, index) => {
                const length = itemsConfig.length;

                const onFirstItem = () => history.push(itemsConfig[0].url);
                const onLastItem = () => history.push(itemsConfig[length - 1].url);

                const onPreviousItem = () => {
                    const previousPosition = MathUtils.decrementWithWrapping(index, length);
                    history.push(itemsConfig[previousPosition].url);
                };

                const onNextItem = () => {
                    const nextPosition = MathUtils.incrementWithWrapping(index, length);
                    history.push(itemsConfig[nextPosition].url);
                };

                return (
                    <SettingsListItem
                        key={props.description}
                        active={location.pathname.includes(url)}
                        desktopLayout={desktopLayout}
                        onClick={() => history.push(url)}
                        onFirstItem={onFirstItem}
                        onLastItem={onLastItem}
                        onPreviousItem={onPreviousItem}
                        onNextItem={onNextItem}
                        {...props}
                    />
                );
            }),
        [desktopLayout, history, itemsConfig, location.pathname]
    );

    return (
        <div className={classNames("SettingsNavigation", className)} {...otherProps}>
            {noAccount && (
                <SettingsListItem
                    className="SettingsNavigation-no-account-signup"
                    data-testid="settings-navigation-signup"
                    active={false}
                    desktopLayout={desktopLayout}
                    title="Sign Up"
                    description="Sign up to access your data on all your devices"
                    onClick={onNoAccountSignUp}
                    // Enable the tabIndex since it gets disabled normally by `active=false`.
                    // We want this to be focusable since it isn't actually part of the normal
                    // navigation flow.
                    tabIndex={0}
                />
            )}

            {items}

            {!desktopLayout && (
                <>
                    <Divider />

                    {!noAccount && onSendFeedback && (
                        <SettingsListItem
                            data-testid="settings-send-feedback-mobile"
                            description=""
                            icon={CHAT_ICON}
                            title="Send Feedback"
                            desktopLayout={false}
                            onClick={onSendFeedback}
                        />
                    )}

                    {onChangelog && (
                        <SettingsListItem
                            data-testid="settings-changelog-mobile"
                            description=""
                            icon={CALENDAR_ICON}
                            title="Changelog"
                            desktopLayout={false}
                            onClick={onChangelog}
                        />
                    )}

                    {onCheckForUpdates && (
                        <SettingsListItem
                            data-testid="settings-check-for-updates-mobile"
                            description=""
                            icon={REFRESH_ICON}
                            title="Check for Updates"
                            desktopLayout={false}
                            onClick={onCheckForUpdates}
                        />
                    )}

                    <SettingsListItem
                        data-testid="settings-logout-mobile"
                        description=""
                        icon={LOGOUT_ICON}
                        title="Logout"
                        desktopLayout={false}
                        onClick={onLogout}
                    />
                </>
            )}
        </div>
    );
};

export default SettingsNavigation;
