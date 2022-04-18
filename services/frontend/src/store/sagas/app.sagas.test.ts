import {push} from "connected-react-router";
import {expectSaga} from "redux-saga-test-plan";
import {delay, select} from "redux-saga/effects";
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
import {SAGA_TIMEOUT} from "utils/testHelpers";
import {LOGIN_SPLASH_SCREEN} from "values/intentionalDelays";
import ScreenUrls, {DerivedAppScreenUrls} from "values/screenUrls";
import {watchAppBoot, appBoot} from "./app.sagas";

const provideIsAuthenticated = (result: boolean): [any, boolean] => {
    return [select(crossSliceSelectors.user.selectIsAuthenticated), result];
};

const provideNoAccount = (result: boolean): [any, boolean] => {
    return [select(userSlice.selectors.selectNoAccount), result];
};

const provideExpiredSubscription = (result: boolean): [any, boolean] => {
    return [select(crossSliceSelectors.user.selectReadOnlySubscription), result];
};

const provideHasSubscription = (result: boolean): [any, boolean] => {
    return [select(crossSliceSelectors.user.selectSubscriptionEnablesAppAccess), result];
};

describe("watchAppBoot", () => {
    it("triggers app boot on login", () => {
        return (
            expectSaga(watchAppBoot)
                .provide([
                    provideIsAuthenticated(true),
                    provideExpiredSubscription(false),
                    provideHasSubscription(true),
                    [delay(LOGIN_SPLASH_SCREEN), null]
                ])
                .dispatch(authRequestsSlice.login.actions.success())
                // @ts-ignore Allow an empty user, since it gets mocked by the provides anyways.
                .dispatch(userSlice.actions.setUser({}))
                .dispatch(accountsRequestsSlice.fetchAll.actions.effectSuccess())
                .dispatch(recurringTransactionsRequestsSlice.fetchAll.actions.effectSuccess())
                .dispatch(importProfilesRequestsSlice.fetchAll.actions.effectSuccess())
                .dispatch(importRulesRequestsSlice.fetchAll.actions.effectSuccess())
                .dispatch(preferencesRequestsSlice.fetchAll.actions.effectSuccess())
                .call(appBoot, {initEncryption: false})
                .put(recurringTransactionsSlice.actions.triggerConcreteRealizations())
                .silentRun(SAGA_TIMEOUT)
        );
    });

    it("triggers app boot on no-account login", () => {
        return expectSaga(watchAppBoot)
            .provide([
                provideIsAuthenticated(true),
                provideExpiredSubscription(false),
                [delay(LOGIN_SPLASH_SCREEN), null]
            ])
            .dispatch(authRequestsSlice.loginWithoutAccount.actions.success())
            .call(appBoot, {initEncryption: false, noAccount: true})
            .silentRun(SAGA_TIMEOUT);
    });

    it("triggers app boot on page refresh, while already logged in", () => {
        return expectSaga(watchAppBoot)
            .provide([
                provideIsAuthenticated(true),
                provideNoAccount(false),
                provideExpiredSubscription(false)
            ])
            .dispatch(push(DerivedAppScreenUrls.DASHBOARD))
            .call(appBoot, {initEncryption: true, noAccount: false})
            .silentRun(SAGA_TIMEOUT);
    });

    it("triggers app boot on page refresh, when not using an account", () => {
        return expectSaga(watchAppBoot)
            .provide([
                provideIsAuthenticated(true),
                provideNoAccount(true),
                provideExpiredSubscription(false)
            ])
            .dispatch(push(DerivedAppScreenUrls.DASHBOARD))
            .call(appBoot, {initEncryption: false, noAccount: true})
            .silentRun(SAGA_TIMEOUT);
    });

    // Addresses bug UFC-400.
    it("triggers concrete recurring transaction realization in no-account mode", () => {
        return expectSaga(watchAppBoot)
            .provide([
                provideIsAuthenticated(true),
                provideExpiredSubscription(false),
                [delay(LOGIN_SPLASH_SCREEN), null]
            ])
            .dispatch(authRequestsSlice.loginWithoutAccount.actions.success())
            .call(appBoot, {initEncryption: false, noAccount: true})
            .put(recurringTransactionsSlice.actions.triggerConcreteRealizations())
            .silentRun(SAGA_TIMEOUT);
    });

    it("doesn't trigger app boot on page change, while not logged in", () => {
        return expectSaga(watchAppBoot)
            .provide([provideIsAuthenticated(false), provideExpiredSubscription(false)])
            .dispatch(push(DerivedAppScreenUrls.DASHBOARD))
            .not.call(appBoot, {initEncryption: true})
            .silentRun(SAGA_TIMEOUT);
    });

    it("doesn't trigger app boot on page change, if the app has already booted", () => {
        return (
            expectSaga(watchAppBoot)
                .provide([
                    provideIsAuthenticated(true),
                    provideNoAccount(false),
                    provideExpiredSubscription(false)
                ])
                .dispatch(push(DerivedAppScreenUrls.DASHBOARD))
                .dispatch(push(DerivedAppScreenUrls.DASHBOARD))
                .call(appBoot, {initEncryption: true, noAccount: false})
                // It shouldn't call app boot again.
                .not.call(appBoot, {initEncryption: true, noAccount: false})
                .silentRun(SAGA_TIMEOUT)
        );
    });

    it("doesn't trigger app boot when trying to access a non-authenticated page", () => {
        return expectSaga(watchAppBoot)
            .provide([provideIsAuthenticated(true), provideExpiredSubscription(false)])
            .dispatch(push(ScreenUrls.LOGIN))
            .not.call(appBoot, {initEncryption: true})
            .silentRun(SAGA_TIMEOUT);
    });

    it("does trigger multiple app boots when logging in multiple times", () => {
        // This can happen if a user logs in, logs out, and logs back in again.
        return (
            expectSaga(watchAppBoot)
                .provide([
                    provideIsAuthenticated(true),
                    provideExpiredSubscription(false),
                    provideHasSubscription(true),
                    [delay(LOGIN_SPLASH_SCREEN), null]
                ])
                .dispatch(authRequestsSlice.login.actions.success())
                // @ts-ignore Allow an empty user, since it gets mocked by the provides anyways.
                .dispatch(userSlice.actions.setUser({}))
                .dispatch(accountsRequestsSlice.fetchAll.actions.effectSuccess())
                .dispatch(recurringTransactionsRequestsSlice.fetchAll.actions.effectSuccess())
                .dispatch(importProfilesRequestsSlice.fetchAll.actions.effectSuccess())
                .dispatch(importRulesRequestsSlice.fetchAll.actions.effectSuccess())
                .dispatch(preferencesRequestsSlice.fetchAll.actions.effectSuccess())
                .dispatch(recurringTransactionsSlice.actions.triggerConcreteRealizations())
                .dispatch(authRequestsSlice.login.actions.success())
                // @ts-ignore Allow an empty user, since it gets mocked by the provides anyways.
                .dispatch(userSlice.actions.setUser({}))
                .dispatch(accountsRequestsSlice.fetchAll.actions.effectSuccess())
                .dispatch(recurringTransactionsRequestsSlice.fetchAll.actions.effectSuccess())
                .dispatch(importProfilesRequestsSlice.fetchAll.actions.effectSuccess())
                .dispatch(importRulesRequestsSlice.fetchAll.actions.effectSuccess())
                .dispatch(preferencesRequestsSlice.fetchAll.actions.effectSuccess())
                .dispatch(recurringTransactionsSlice.actions.triggerConcreteRealizations())
                .call(appBoot, {initEncryption: false})
                .call(appBoot, {initEncryption: false})
                .silentRun(SAGA_TIMEOUT)
        );
    });
});

describe("appBoot", () => {
    it("requests a refresh of the access token", () => {
        return expectSaga(appBoot)
            .provide([provideExpiredSubscription(false)])
            .put(authRequestsSlice.refreshToken.actions.request())
            .silentRun(SAGA_TIMEOUT);
    });

    it("registers the service worker", () => {
        return expectSaga(appBoot)
            .provide([provideExpiredSubscription(false)])
            .put(serviceWorkerSlice.actions.register())
            .silentRun(SAGA_TIMEOUT);
    });

    it("requests fetches of all the user's data", () => {
        return expectSaga(appBoot)
            .provide([provideExpiredSubscription(false)])
            .put(accountsRequestsSlice.fetchAll.actions.request())
            .put(recurringTransactionsRequestsSlice.fetchAll.actions.request())
            .put(importProfilesRequestsSlice.fetchAll.actions.request())
            .put(importRulesRequestsSlice.fetchAll.actions.request())
            .put(preferencesRequestsSlice.fetchAll.actions.request())
            .silentRun(SAGA_TIMEOUT);
    });

    it("doesn't request fetches of all the user's data when running in no-account mode", () => {
        return expectSaga(appBoot, {noAccount: true})
            .provide([provideExpiredSubscription(false)])
            .not.put(accountsRequestsSlice.fetchAll.actions.request())
            .not.put(recurringTransactionsRequestsSlice.fetchAll.actions.request())
            .not.put(importProfilesRequestsSlice.fetchAll.actions.request())
            .not.put(importRulesRequestsSlice.fetchAll.actions.request())
            .not.put(preferencesRequestsSlice.fetchAll.actions.request())
            .run();
    });

    it("can successfully initialize the encryption keys from storage", () => {
        return expectSaga(appBoot, {initEncryption: true})
            .provide([provideExpiredSubscription(false)])
            .dispatch(encryptionSlice.actions.initAtAppBootSuccess())
            .put(encryptionSlice.actions.initAtAppBoot())
            .silentRun(SAGA_TIMEOUT);
    });

    it("can fail to initialize the encryption keys from storage", () => {
        return expectSaga(appBoot, {initEncryption: true})
            .provide([provideExpiredSubscription(false)])
            .dispatch(encryptionSlice.actions.initAtAppBootFailure())
            .put(encryptionSlice.actions.initAtAppBoot())
            .put(authRequestsSlice.logout.actions.request())
            .put.actionType(toastsSlice.actions.add.type)
            .not.put(accountsRequestsSlice.fetchAll.actions.request())
            .not.put(recurringTransactionsRequestsSlice.fetchAll.actions.request())
            .not.put(importProfilesRequestsSlice.fetchAll.actions.request())
            .not.put(importRulesRequestsSlice.fetchAll.actions.request())
            .not.put(preferencesRequestsSlice.fetchAll.actions.request())
            .run();
    });

    it("doesn't initialize the encryption keys when running in no-account mode", () => {
        return expectSaga(appBoot, {initEncryption: true, noAccount: true})
            .provide([provideExpiredSubscription(false)])
            .not.put(encryptionSlice.actions.initAtAppBoot())
            .run();
    });

    it("ends the app boot loading screen when not initializing encryption (i.e. at login)", () => {
        return expectSaga(appBoot, {initEncryption: false})
            .provide([provideExpiredSubscription(false), [delay(LOGIN_SPLASH_SCREEN), null]])
            .dispatch(encryptionSlice.actions.initAtAppBootSuccess())
            .dispatch(accountsRequestsSlice.fetchAll.actions.effectSuccess())
            .dispatch(recurringTransactionsRequestsSlice.fetchAll.actions.effectSuccess())
            .dispatch(importProfilesRequestsSlice.fetchAll.actions.effectSuccess())
            .dispatch(importRulesRequestsSlice.fetchAll.actions.effectSuccess())
            .dispatch(preferencesRequestsSlice.fetchAll.actions.effectSuccess())
            .dispatch(recurringTransactionsSlice.actions.triggerConcreteRealizations())
            .put(appSlice.actions.setAppBootLoading(false))
            .run();
    });

    it("shows a warning toast when the user's subscription is expired", () => {
        return (
            expectSaga(appBoot)
                // Need to provide the delay and dispatch the success effects to get to the end of the saga.
                .provide([provideExpiredSubscription(true), [delay(LOGIN_SPLASH_SCREEN), null]])
                .dispatch(encryptionSlice.actions.initAtAppBootSuccess())
                .dispatch(accountsRequestsSlice.fetchAll.actions.effectSuccess())
                .dispatch(recurringTransactionsRequestsSlice.fetchAll.actions.effectSuccess())
                .dispatch(importProfilesRequestsSlice.fetchAll.actions.effectSuccess())
                .dispatch(importRulesRequestsSlice.fetchAll.actions.effectSuccess())
                .dispatch(preferencesRequestsSlice.fetchAll.actions.effectSuccess())
                .dispatch(recurringTransactionsSlice.actions.triggerConcreteRealizations())
                .put.actionType(toastsSlice.actions.add.type)
                .run()
        );
    });
});
