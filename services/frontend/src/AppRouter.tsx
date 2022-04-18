import React, {useEffect, useState} from "react";
import {ErrorBoundary} from "react-error-boundary";
import {Switch, Route} from "react-router";
import {BackgroundBlur, DateRangeBridge, FileDownloader} from "components/atoms";
import {ErrorFallback} from "components/molecules";
import {
    AccountDeletionDialog,
    AppNavigation,
    DeleteUserAccountDialog,
    NoAccountLogoutDialog
} from "components/organisms";
import {useScrollToTopOn, DateRangeProvider} from "hooks/";
import {
    Accounts,
    Dashboard,
    ImportOverview,
    Onboarding,
    PageNotFoundApp,
    Settings,
    SidebarAccountForm,
    SidebarImportRuleForm,
    SidebarTransactionForm,
    SidebarTransactionsImportEditForm,
    Transactions,
    TransactionsImport
} from "scenes/";
import ScreenUrls, {DerivedAppModalUrls, DerivedAppScreenUrls} from "values/screenUrls";
import connect, {ConnectedProps} from "./AppRouter.connect";
import "./AppRouter.scss";

/* Hooks */

/** Adds a class to the document body when the user has authenticated (i.e. they can access
 *  the AppRouter, since they can't otherwise). */
const useAuthenticatedClass = () => {
    useEffect(() => {
        // The easiest way to ensure that the background color always cover the entire screen,
        // regardless of heights, etc, is to set it on the body. However, we only want to set it
        // in the authenticated app, hence adding this class to body.
        document.body.classList.add("authenticated-app");
    }, []);
};

/** Adds a class to the document body to indicate whenever a modal is open.
 *  This is used in AppRouter.scss to prevent the document body from scrolling. */
const useModalClass = () => {
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        // We want to hide the scrollbar on the AppRouter (i.e. the app) when a modal is open
        // so that the body can't scroll and so that there isn't potentially two scrollbars:
        // one for the modal and one for the body. It's really ugly when there are two scrollbars.
        if (modalOpen) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }
    }, [modalOpen]);

    return {setModalOpen};
};

/* Component */

interface AppRouterProps extends ConnectedProps {}

const AppRouter = ({isOnboarded = true, modalCompatibleLocation}: AppRouterProps) => {
    const {setModalOpen} = useModalClass();

    useAuthenticatedClass();

    // This is actually kind of clever. See, we only want to scroll to the top on any of
    // the main scenes (that is, _not_ for modals and the like). So by using the
    // `modalCompatibleLocation` as the trigger for the scroll, we get this for free,
    // since this location will never have the modal URLs in it. Pretty cool!
    useScrollToTopOn(modalCompatibleLocation.pathname);

    return (
        <div id="AppRouter">
            {isOnboarded ? (
                <>
                    <AppNavigation className="AppRouter-navigation" />

                    <Route
                        path={[
                            DerivedAppModalUrls.ACCOUNT_FORM,
                            DerivedAppModalUrls.IMPORT_RULE_FORM,
                            DerivedAppModalUrls.RECURRING_TRANSACTION_FORM,
                            DerivedAppModalUrls.TRANSACTION_FORM,
                            DerivedAppModalUrls.TRANSACTIONS_IMPORT_FORM
                        ]}
                    >
                        {({match}) => (
                            <BackgroundBlurRoute
                                isVisible={match !== null}
                                setModalOpen={setModalOpen}
                            />
                        )}
                    </Route>

                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <FileDownloader />

                        <AccountDeletionDialog />
                        <DeleteUserAccountDialog />
                        <NoAccountLogoutDialog />

                        <Route path={DerivedAppModalUrls.ACCOUNT_FORM}>
                            {({match}) => <SidebarAccountForm isVisible={match !== null} />}
                        </Route>

                        <Route path={DerivedAppModalUrls.IMPORT_RULE_FORM}>
                            {({match}) => <SidebarImportRuleForm isVisible={match !== null} />}
                        </Route>

                        <Route
                            path={[
                                DerivedAppModalUrls.RECURRING_TRANSACTION_FORM_EDITING,
                                DerivedAppModalUrls.TRANSACTION_FORM
                            ]}
                        >
                            {({match}) => <SidebarTransactionForm isVisible={match !== null} />}
                        </Route>

                        <Route path={[DerivedAppModalUrls.TRANSACTIONS_IMPORT_FORM]}>
                            {({match}) => (
                                <SidebarTransactionsImportEditForm isVisible={match !== null} />
                            )}
                        </Route>

                        <DateRangeProvider>
                            <DateRangeBridge />

                            <Switch location={modalCompatibleLocation}>
                                <Route
                                    path={DerivedAppScreenUrls.IMPORT_OVERVIEW}
                                    component={ImportOverview}
                                    exact={true}
                                />

                                <Route
                                    path={DerivedAppScreenUrls.TRANSACTIONS_IMPORT}
                                    component={TransactionsImport}
                                />

                                <Route
                                    path={DerivedAppScreenUrls.TRANSACTIONS}
                                    component={Transactions}
                                />

                                <Route path={DerivedAppScreenUrls.SETTINGS} component={Settings} />

                                <Route
                                    // NOTE: The order matters here. If the ACCOUNT_DETAILS route comes second,
                                    // then an infinite rendering loop will occur because of the redirection
                                    // logic built into the desktop version of the Accounts scene.
                                    path={[
                                        DerivedAppScreenUrls.ACCOUNT_DETAILS,
                                        DerivedAppScreenUrls.ACCOUNTS
                                    ]}
                                    component={Accounts}
                                />

                                <Route
                                    path={DerivedAppScreenUrls.DASHBOARD}
                                    exact={true}
                                    component={Dashboard}
                                />

                                <Route path={`${ScreenUrls.APP}/*`} component={PageNotFoundApp} />
                            </Switch>
                        </DateRangeProvider>
                    </ErrorBoundary>
                </>
            ) : (
                // Need a DateRangeProvider to make the AccountsList happy,
                // even though it isn't actually used.
                <DateRangeProvider>
                    <Onboarding />
                </DateRangeProvider>
            )}
        </div>
    );
};

export default connect(AppRouter);

/* Other Components */

/** Need to create a wrapper component for the `BackgroundBlur` so that we can use
 *  the useEffect hook. If we try and use it in the Route's render prop, React complains. */
const BackgroundBlurRoute = ({
    isVisible,
    setModalOpen
}: {
    isVisible: boolean;
    setModalOpen: (isVisible: boolean) => void;
}) => {
    useEffect(() => {
        setModalOpen(isVisible);
    }, [isVisible, setModalOpen]);

    return <BackgroundBlur isVisible={isVisible} />;
};
