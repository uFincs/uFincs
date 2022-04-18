import React from "react";
import {Route, Switch, RouteComponentProps} from "react-router-dom";
import {BackButton, OverlineHeading} from "components/atoms";
import {SettingsNavigation} from "components/organisms";
import {useNoAccount, useWindowWidthBreakpoint} from "hooks/";
import {navigationBreakpointMatches} from "utils/mediaQueries";
import {DerivedAppScreenUrls} from "values/screenUrls";
import "./Settings.scss";
import {Billing, MyData, MyPreferences, UserAccount} from "./components";
import connect, {ConnectedProps} from "./connect";
import {useRedirectToUserSettings} from "./hooks";

interface SettingsProps extends ConnectedProps, Partial<RouteComponentProps> {}

/** The Settings scene. Handles app-level settings for things like the user's account. */
const Settings = ({
    onBack,
    onChangelog,
    onCheckForUpdates,
    onLogout,
    onNoAccountSignUp,
    onSendFeedback
}: SettingsProps) => {
    useRedirectToUserSettings();

    const noAccount = useNoAccount();
    const desktopLayout = useWindowWidthBreakpoint(navigationBreakpointMatches);

    return (
        <main className="Settings">
            {desktopLayout && (
                <OverlineHeading className="Settings-header-desktop">Settings</OverlineHeading>
            )}

            <Route path={DerivedAppScreenUrls.SETTINGS} exact={true}>
                {!desktopLayout && (
                    <OverlineHeading className="Settings-header-mobile">Settings</OverlineHeading>
                )}
            </Route>

            <Route
                path={[
                    DerivedAppScreenUrls.SETTINGS_BILLING,
                    DerivedAppScreenUrls.SETTINGS_DATA,
                    DerivedAppScreenUrls.SETTINGS_IMPORT_PROFILES,
                    DerivedAppScreenUrls.SETTINGS_PREFERENCES,
                    DerivedAppScreenUrls.SETTINGS_USER_ACCOUNT
                ]}
            >
                <div className="Settings-page-heading-container">
                    {!desktopLayout && (
                        <BackButton className="Settings-BackButton" onClick={onBack} />
                    )}

                    <Switch>
                        <Route path={DerivedAppScreenUrls.SETTINGS_DATA}>
                            <h2 className="Settings-page-heading">My Data</h2>
                        </Route>

                        <Route path={DerivedAppScreenUrls.SETTINGS_PREFERENCES}>
                            <h2 className="Settings-page-heading">My Preferences</h2>
                        </Route>

                        <Route path={DerivedAppScreenUrls.SETTINGS_IMPORT_PROFILES}>
                            {!noAccount && (
                                <h2 className="Settings-page-heading">CSV Import Formats</h2>
                            )}
                        </Route>

                        <Route path={DerivedAppScreenUrls.SETTINGS_BILLING}>
                            {!noAccount && <h2 className="Settings-page-heading">Billing</h2>}
                        </Route>

                        <Route path={DerivedAppScreenUrls.SETTINGS_USER_ACCOUNT}>
                            {!noAccount && <h2 className="Settings-page-heading">User Account</h2>}
                        </Route>
                    </Switch>
                </div>
            </Route>

            {desktopLayout && (
                <div className="Settings-navigation-desktop">
                    <SettingsNavigation
                        data-testid="settings-navigation-desktop"
                        desktopLayout={true}
                        onLogout={onLogout}
                        onNoAccountSignUp={onNoAccountSignUp}
                    />
                </div>
            )}

            <Switch>
                <Route path={DerivedAppScreenUrls.SETTINGS_DATA}>
                    <MyData className="Settings-content-container" />
                </Route>

                <Route path={DerivedAppScreenUrls.SETTINGS_PREFERENCES}>
                    <MyPreferences className="Settings-content-container" />
                </Route>

                <Route path={DerivedAppScreenUrls.SETTINGS_IMPORT_PROFILES}>
                    {!noAccount && <div className="Settings-content-container">Coming soon!</div>}
                </Route>

                <Route path={DerivedAppScreenUrls.SETTINGS_BILLING}>
                    {!noAccount && <Billing className="Settings-content-container" />}
                </Route>

                <Route path={DerivedAppScreenUrls.SETTINGS_USER_ACCOUNT}>
                    {!noAccount && <UserAccount className="Settings-content-container" />}
                </Route>

                <Route path={DerivedAppScreenUrls.SETTINGS}>
                    {!desktopLayout && (
                        <div className="Settings-navigation-mobile">
                            <SettingsNavigation
                                data-testid="settings-navigation-mobile"
                                desktopLayout={false}
                                onChangelog={onChangelog}
                                onCheckForUpdates={onCheckForUpdates}
                                onLogout={onLogout}
                                onNoAccountSignUp={onNoAccountSignUp}
                                onSendFeedback={onSendFeedback}
                            />
                        </div>
                    )}
                </Route>
            </Switch>
        </main>
    );
};

export const PureComponent = Settings;
export default connect(Settings);
