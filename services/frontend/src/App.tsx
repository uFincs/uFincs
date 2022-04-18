import {ConnectedRouter} from "connected-react-router";
import React from "react";
import {ErrorBoundary} from "react-error-boundary";
import {Provider} from "react-redux";
import {Switch, Redirect, Route} from "react-router";
import {PersistGate} from "redux-persist/integration/react";

import {BackgroundBlur} from "components/atoms";
import {ErrorFallback, SplashScreen} from "components/molecules";
import {FeedbackDialog, PasswordResetDialog} from "components/organisms";
import {useEnhancedKeyboardNavigation, useEnhancedTouchSupport, useNativeBackButton} from "hooks/";
import {
    Authentication,
    Checkout,
    NoAccountSignUp,
    PageNotFound,
    PasswordReset,
    SendPasswordReset,
    ToastMessages
} from "scenes/";
import configureStore, {history} from "store/";
import registerTrustedTypes from "utils/trustedTypes";
import ScreenUrls, {DerivedAppScreenUrls} from "values/screenUrls";
import AppRouter from "./AppRouter";
import "./App.scss";

// Must register the trust type policies before creating the store, since the creation of the store
// is what triggers Web Worker creation (which requires the trusted type policy to exempt them).
registerTrustedTypes();

const {store, persistor} = configureStore();

const AppLayout = () => {
    // Note: Because the internals of this hook make use of the `history` object from react-router,
    // it must be in the App layout rather than the top-level App, cause it needs to be inside the
    // router provider.
    useNativeBackButton();

    return (
        <div id="app">
            {/* Need the FeedbackDialog (and BackgroundBlur) outside of any ErrorBoundary, otherwise... it won't
            be rendered if there's an error. Duh. */}
            <FeedbackDialog />

            <Route
                // Register the BackgroundBlur on anything that _isn't_ an App route, so that it doesn't
                // conflict (duplicate) with the BackgroundBlur that is defined in the AppRouter.
                path={[
                    ScreenUrls.PASSWORD_RESET,
                    ScreenUrls.SEND_PASSWORD_RESET,
                    ScreenUrls.LOGIN,
                    ScreenUrls.SIGN_UP
                ]}
                component={BackgroundBlur}
            />

            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <PasswordResetDialog />
                <SplashScreen />
                <ToastMessages />

                <Switch>
                    {/* Need to register the NO_ACCOUNT_SIGN_UP here (as opposed to inside the AppRouter) since
                    we don't want the other stuff the AppRouter renders (i.e. App Navigation). */}
                    <Route
                        path={DerivedAppScreenUrls.NO_ACCOUNT_SIGN_UP}
                        component={NoAccountSignUp}
                    />

                    <Route path={ScreenUrls.APP} component={AppRouter} />
                    <Route path={ScreenUrls.PASSWORD_RESET} component={PasswordReset} />
                    <Route path={ScreenUrls.SEND_PASSWORD_RESET} component={SendPasswordReset} />
                    <Route path={ScreenUrls.CHECKOUT} component={Checkout} />
                    <Route path={ScreenUrls.LOGIN} component={Authentication} />
                    <Route path={ScreenUrls.SIGN_UP} component={Authentication} />
                    <Redirect from={ScreenUrls.LANDING} exact={true} to={ScreenUrls.LOGIN} />
                    <Route path="*" component={PageNotFound} />
                </Switch>
            </ErrorBoundary>
        </div>
    );
};

const App = () => {
    useEnhancedKeyboardNavigation();
    useEnhancedTouchSupport();

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <ConnectedRouter history={history}>
                    <AppLayout />
                </ConnectedRouter>
            </PersistGate>
        </Provider>
    );
};

export default App;
