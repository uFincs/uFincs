import {all, call, delay, fork, put, race, select, take, takeLeading} from "redux-saga/effects";
import api from "api/";
import {
    accountsRequestsSlice,
    appSlice,
    authRequestsSlice,
    crossSliceSelectors,
    encryptionSlice,
    importProfilesRequestsSlice,
    importRulesRequestsSlice,
    preferencesRequestsSlice,
    recurringTransactionsSlice,
    recurringTransactionsRequestsSlice,
    serviceWorkerSlice,
    toastsSlice,
    userSlice
} from "store/";
import {routerActionTypes, tryingToAccessApp} from "store/utils";
import {ErrorToastData, SuccessToastData, WarningToastData} from "structures/";
import {LOGIN_SPLASH_SCREEN} from "values/intentionalDelays";
import {restoreEffectLogic} from "./user.sagas";

interface AppBootOptions {
    initEncryption?: boolean;
    noAccount?: boolean;
}

/* Things to do after first logging in or after the user
 * refreshes the page while logged in (e.g. fetch up data). */
export function* appBoot(
    {initEncryption, noAccount}: AppBootOptions = {initEncryption: false, noAccount: false}
) {
    // Register the service worker. Need to do this during app boot (as opposed to during login) so that
    // the update handler is always registered for the update toasts.
    yield put(serviceWorkerSlice.actions.register());

    // See the explanation in `watchAppBoot` for why we only init the encryption during page refresh boots.
    //
    // tl;dr There's no point in loading the encryption keys from storage after just logging in
    // (since they'll have been loaded already by the login process), and we want to allow users who
    // don't have IndexedDB to at least login and use the app (before being kicked out on refresh).
    if (initEncryption && !noAccount) {
        try {
            yield call(handleInitEncryption);
        } catch {
            return;
        }
    }

    // Pull the user's data from the Backend.
    yield call(refreshAllData, {initEncryption, noAccount});

    if (!initEncryption) {
        // Note: This will technically fire when page refreshes happen while the user is in no-account mode,
        // but that's fine since it doesn't do anything (and there's not currently anything listening
        // for it).
        yield put(appSlice.actions.setAppBootLoading(false));
    }

    // Want to call this _after_ `refreshToken`, since `refreshToken` also updates the subscription status.
    yield call(showExpiredSubscriptionToast);
}

/** This handles migrating a no-account user's data by saving it to the Backend.
 *  This happens (or at least, _should_ happen) when a user returns to the app from Stripe after
 *  subscribing. */
function* migrateNoAccountData() {
    // Reminder: The `refreshToken` saga also updates the subscription status...
    yield put(authRequestsSlice.refreshToken.actions.request());
    yield take(authRequestsSlice.refreshToken.actions.success);

    // ... that's why we refresh before selecting the subscription status.
    const hasSubscription = yield select(
        crossSliceSelectors.user.selectSubscriptionEnablesAppAccess
    );

    if (hasSubscription) {
        try {
            // Need to init the encryption here so that we can encrypt the data during the
            // 'restore' (aka migrate) logic below.
            yield call(handleInitEncryption);
        } catch {
            return;
        }

        // Take all of the users existing data and save it to the backend.
        const data = yield select(crossSliceSelectors.user.selectDataForBackup);
        yield call(restoreEffectLogic, data);

        // Finally remove the no-account flag so that the user doesn't have to look at the
        // ugly Sign Up button anymore.
        yield put(userSlice.actions.setNoAccount(false));
    }
}

/** This handles pulling a refresh copy of the user's data from the Backend (if they have an account).
 *
 *  Used during app boot as well as during manual refreshes. */
function* refreshAllData(
    {initEncryption, noAccount}: AppBootOptions = {initEncryption: false, noAccount: false}
) {
    if (!noAccount) {
        // Refresh the user's access token whenever they enter the app, so that they
        // can keep extending the expiry period as long as they use the app.
        yield put(authRequestsSlice.refreshToken.actions.request());

        yield put(accountsRequestsSlice.fetchAll.actions.request());
        yield put(recurringTransactionsRequestsSlice.fetchAll.actions.request());
        yield put(importProfilesRequestsSlice.fetchAll.actions.request());
        yield put(importRulesRequestsSlice.fetchAll.actions.request());
        yield put(preferencesRequestsSlice.fetchAll.actions.request());

        // During login, we need to wait for all the requests to finish so that we
        // can hide the splash screen. But we _don't_ want to wait for the requests
        // when running in no - account mode.
        yield all([
            take(accountsRequestsSlice.fetchAll.actions.effectSuccess.type),
            take(recurringTransactionsRequestsSlice.fetchAll.actions.effectSuccess.type),
            take(importProfilesRequestsSlice.fetchAll.actions.effectSuccess.type),
            take(importRulesRequestsSlice.fetchAll.actions.effectSuccess.type),
            take(preferencesRequestsSlice.fetchAll.actions.effectSuccess.type),
            // Only wait for the delay when logging in (not during refreshes).
            !initEncryption && delay(LOGIN_SPLASH_SCREEN)
        ]);
    }

    // Trigger concrete realizations for today once the recurring transactions have been stored.
    yield put(recurringTransactionsSlice.actions.triggerConcreteRealizations());
}

/* App boots are handled when the authenticated user logs into the app or refreshes
 * the page when already logged in.
 *
 * These two types of app boots are differentiated by the `justLoggedIn` argument of the `appBoot` saga.
 * The reason to do this is to work around the fact that some browsers (most notably, Firefox in Private
 * Browsing mode) don't have IndexedDB storage.
 *
 * As such, we can allow users to log in and use the app
 * without actually storing the encryption keys in IndexedDB. Then, if they try and refresh the page,
 * they'll get notified that the keys don't exist (because we couldn't store them), so they need to login
 * again.
 *
 * I found this to be a better tradeoff than just not letting these users not even login in the first
 * place. */
export function* watchAppBoot() {
    let appBooted = false;

    while (true) {
        const {routeChange, loggedIn, loggedInWithoutAccount} = yield race({
            routeChange: take(routerActionTypes),
            loggedIn: take(authRequestsSlice.login.actions.success.type),
            loggedInWithoutAccount: take(authRequestsSlice.loginWithoutAccount.actions.success.type)
        });

        const isAuthenticated = yield select(crossSliceSelectors.user.selectIsAuthenticated);

        if (loggedIn) {
            // Need to wait for the login process to update the user's properties so that the
            // subscription status is actually set.
            // Yeah, it's kinda janky that we're relying on such a specific implementation detail of the
            // login process for this to work, but hey, that's tech debt.
            yield take(userSlice.actions.setUser);

            const hasSubscription = yield select(
                crossSliceSelectors.user.selectSubscriptionEnablesAppAccess
            );

            // We want to only run the app boot process on login once the user has a subscription so that,
            // when a user signs up, the app boot process doesn't run when the user goes to the Checkout
            // scene. This way, the app boot process will only run once the user has paid for a subscription
            // and returned to the app. This way, the user doesn't see the Service Worker registration
            // message until they're actually into the app.
            if (hasSubscription) {
                appBooted = true;
                yield call(appBoot, {initEncryption: false});
            }
        } else if (loggedInWithoutAccount) {
            appBooted = true;
            yield call(appBoot, {initEncryption: false, noAccount: true});
        } else if (
            !appBooted &&
            isAuthenticated &&
            routeChange?.payload &&
            tryingToAccessApp(routeChange.payload)
        ) {
            appBooted = true;

            const noAccount = yield select(userSlice.selectors.selectNoAccount);
            const hasJwt = yield call(api.getRawToken);

            if (noAccount && hasJwt) {
                // If the user is in no-account mode but has an auth JWT, and they're going through
                // the app boot process, then that _must_ mean that a no-account user just signed up for
                // an account and just returned from Stripe after subscribing to a plan!
                //
                // Is it possible that this combination of logic can happen during other times? Uhhh...
                // Maybe? Imma just hope it can't...
                //
                // Update from UFC-322: Turns out, yeah, this combination _can_ happen otherwise.
                // It's what caused UFC-322. Basically, once we built the marketing site, users could
                // now conceivably login with an account and then go back to the marketing site to
                // trigger no-account mode. Users couldn't previously trigger no-account mode after
                // logging in (since going to the login page would redirect them to the app), but this
                // extra method caused a rip in the space-time continuum.
                //
                // Anyways, the solution is was simple enough: just clear the JWT when triggering
                // no-account mode. Workaroundy? Yeah. kinda. But it works.
                yield call(migrateNoAccountData);
            } else {
                yield call(appBoot, {initEncryption: !noAccount, noAccount});
            }
        }
    }
}

export function* appRefresh() {
    const noAccount = yield select(userSlice.selectors.selectNoAccount);

    yield call(refreshAllData, {initEncryption: false, noAccount});
    yield put(toastsSlice.actions.add(new SuccessToastData({message: "Pulled latest data"})));
}

function* appSaga() {
    yield fork(watchAppBoot);

    // Use `takeLeading` so that the refresh runs until completion and doesn't run multiple times
    // if the user clicks the button multiple times.
    yield all([takeLeading(appSlice.actions.refreshApp, appRefresh)]);
}

export default appSaga;

/* Helper Functions */

function* handleInitEncryption() {
    yield put(encryptionSlice.actions.initAtAppBoot());

    const {failure} = yield race({
        success: take(encryptionSlice.actions.initAtAppBootSuccess),
        failure: take(encryptionSlice.actions.initAtAppBootFailure)
    });

    if (failure) {
        yield put(authRequestsSlice.logout.actions.request());

        yield put(
            toastsSlice.actions.add(
                new ErrorToastData({
                    message:
                        failure?.payload?.message ||
                        "Couldn't load encryption keys from storage; please login again"
                })
            )
        );

        throw new Error();
    }
}

function* showExpiredSubscriptionToast() {
    const isExpired = yield select(crossSliceSelectors.user.selectReadOnlySubscription);

    if (isExpired) {
        const toast = new WarningToastData({
            message:
                "Your subscription has expired. Your account is read-only until you update your subscription."
        });

        yield put(toastsSlice.actions.add(toast));
    }
}
