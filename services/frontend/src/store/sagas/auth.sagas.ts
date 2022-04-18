import {PayloadAction} from "@reduxjs/toolkit";
import {push, replace} from "connected-react-router";
import {Action} from "redux";
import {Saga} from "redux-saga";
import {all, call, delay, fork, put, race, select, take, takeEvery} from "redux-saga/effects";
import api from "api/";
import {
    appSlice,
    authRequestsSlice,
    crossSliceSelectors,
    featureFlagsSlice,
    modalsSlice,
    serviceWorkerSlice,
    toastsSlice,
    userSlice
} from "store/";
import {
    routerActionTypes,
    tryingToAccessApp,
    tryingToAccessAuth,
    tryingToAccessCheckout,
    tryingToAccessNoAccountSignUp,
    RequestSliceActions,
    RouteChangePayload
} from "store/utils";
import {ErrorToastData, SuccessToastData} from "structures/";
import hashPassword from "utils/hashPassword";
import {PromiseReturnValue} from "utils/types";
import {AUTH_CHANGE_EMAIL, AUTH_REDIRECTION, LOGIN_GO_TO_APP} from "values/intentionalDelays";
import ScreenUrls from "values/screenUrls";
import {actions as encryptionActions, E2ECrypto} from "vendor/redux-e2e-encryption";
import {restoreEffectLogic} from "./user.sagas";

interface AuthData {
    email: string;
    password: string;
}

export function* authSignUp({payload}: PayloadAction<AuthData>, success: Saga) {
    yield call(signUp, payload);
    yield call(success);

    yield put(authRequestsSlice.login.actions.request(payload));
}

export function* authLogin({payload}: PayloadAction<AuthData>, success: Saga) {
    const {email, password} = payload;

    let {id, edek, kekSalt, isOnboarded, subscriptionIsLifetime, subscriptionStatus} = yield call(
        login,
        payload
    );

    // After a password reset, the user's keys will be empty. Need to re-generate them.
    // Can't do that as part of the actual password reset process since it's unauthenticated.
    if (!edek || !kekSalt) {
        const keys = yield call(createKeys, password);
        edek = keys.edek;
        kekSalt = keys.kekSalt;

        yield call(api.service("users").patch, id, {edek, kekSalt});
    }

    // Login to the encryption middleware for normal users.
    yield call(loginToEncryptionMiddleware, edek, kekSalt, password, id);

    // Needs to be called before navigating away so that the first app boot
    // doesn't trigger multiple times (due to the race between the route change
    // action and the loginSuccess action).
    //
    // See `watchAppBoot` in `store/slices/app.sagas.js` for post-login (i.e. 'app boot') logic.
    yield call(success);

    // Need all store modifications to happen after the call to `success`, otherwise they'll be wiped
    // out by the state reset that's done by the root reducer on successful login.
    yield put(
        userSlice.actions.setUser({
            id,
            email,
            isOnboarded,
            noAccount: false,
            subscriptionIsLifetime,
            subscriptionStatus
        })
    );

    const hasSubscription = yield select(
        crossSliceSelectors.user.selectSubscriptionEnablesAppAccess
    );

    if (hasSubscription) {
        yield call(redirectUserToAppAfterLogin);
    } else {
        yield put(push(ScreenUrls.CHECKOUT));
    }
}

function* authLoginWithoutAccount() {
    // Clear any existing auth token to ensure that the data migration process isn't triggered
    // during app boot. This way, users can login, go back to the marketing site, and trigger no-account
    // mode without the app crashing.
    yield call(api.clearToken);

    // Notify the Backend that a no-account login has taken place.
    yield call(api.notifyNoAccount);

    yield put(
        userSlice.actions.setUser({
            id: "",
            email: "",
            isOnboarded: false,
            noAccount: true,
            subscriptionIsLifetime: false,
            subscriptionStatus: null
        })
    );

    yield call(redirectUserToAppAfterLogin);
}

function* authSignUpFromNoAccount({payload}: PayloadAction<AuthData>) {
    const {email, password} = payload;

    // Sign up to create the user account on the backend.
    yield call(signUp, payload, {isOnboarded: true});

    // Login so that we can initialize the encryption middleware.
    const {id, edek, kekSalt} = yield call(login, payload);
    yield call(loginToEncryptionMiddleware, edek, kekSalt, password, id);

    // Update the user state.
    yield put(
        userSlice.actions.setUser({
            id,
            email,
            isOnboarded: true,
            // Note: We're not setting the noAccount flag to false yet, since the user needs a valid
            // subscription before they can save their data to the Backend.
            // Their data will be saved once they've gone through Checkout, have a subscription, and have
            // returned to the app (i.e. it's taken care of in the app sagas).
            noAccount: true,
            subscriptionIsLifetime: false,
            subscriptionStatus: null
        })
    );

    if (yield select(featureFlagsSlice.selectors.selectSubscriptionsFlag)) {
        // Throw the user into the Checkout scene.
        yield put(push(ScreenUrls.CHECKOUT));
    } else {
        // Since we can't rely on the user returning to the app from the Checkout scene when subscriptions
        // are disabled, we need to set noAccount to false here.
        yield put(userSlice.actions.setNoAccount(false));

        // Take all of the users existing data and save it to the backend.
        const data = yield select(crossSliceSelectors.user.selectDataForBackup);
        yield call(restoreEffectLogic, data);

        yield put(push(ScreenUrls.APP));
    }
}

export function* authRefreshToken() {
    const result = yield call(api.reAuthenticate);
    yield put(userSlice.actions.setSubscriptionStatus(result.user.subscriptionStatus));
}

function* authLogout() {
    const noAccount = yield select(userSlice.selectors.selectNoAccount);

    if (noAccount) {
        yield put(modalsSlice.actions.showNoAccountLogoutModal());

        const {cancel} = yield race({
            confirm: take(modalsSlice.actions.confirmNoAccountLogoutModal),
            cancel: take(modalsSlice.actions.cancelNoAccountLogoutModal)
        });

        if (cancel) {
            // Need to throw an error (as opposed to just returning) because we _don't_ want the
            // logout success action to be dispatched, otherwise the root reducer will reset the whole
            // store state, which we obviously don't want if the user is returning back to the app.
            //
            // Logout errors aren't currently used/displayed anywhere, so this is fine (for now).
            throw new Error("Cancelled logout");
        }
    }

    yield call(logoutWithoutRedirect);

    // Want to unregister the service worker on logout so that we have an escape hatch for dealing with
    // service worker/caching problems that doesn't involve telling users to open Dev Tools.
    yield put(serviceWorkerSlice.actions.unregister());

    yield put(push(ScreenUrls.LOGIN));
}

function* authChangeEmail({payload}: PayloadAction<{newEmail: string}>) {
    const {newEmail} = payload;
    const id = yield select(userSlice.selectors.selectUserId);

    yield call(api.service("users").patch, id, {email: newEmail});

    // This can happen really fast, which isn't a good UX since the loading state will end _very_ quickly.
    // As such, add a small delay; makes the user think is something is going on.
    yield delay(AUTH_CHANGE_EMAIL);

    // Put this _after_ the delay, so that the store (and hence, the UI) isn't updated till the delay is
    // over. Otherwise, the user would see their current email address change before the loading state
    // has finished, which would be quite perplexing.
    yield put(userSlice.actions.setUserEmail(newEmail));

    yield put(
        toastsSlice.actions.add(
            new SuccessToastData({message: `Successfully changed email to ${newEmail}`})
        )
    );
}

function* authChangePassword({payload}: PayloadAction<{oldPassword: string; newPassword: string}>) {
    const {oldPassword, newPassword} = payload;

    const email = yield select(userSlice.selectors.selectUserEmail);
    validateUserInfo(email, oldPassword);

    const hashedOldPassword = yield call(hashPassword, oldPassword);

    // Make sure the user's old password is correct; will throw an error if it isn't.
    const result = yield call(api.testPassword, {email, password: hashedOldPassword});
    const {id, edek: oldEDEK, kekSalt: oldKEKSalt} = result.user;

    const {edek, kekSalt}: PromiseReturnValue<typeof E2ECrypto.changeKeysForUser> = yield call(
        E2ECrypto.changeKeysForUser,
        oldPassword,
        newPassword,
        oldEDEK,
        oldKEKSalt
    );

    const hashedNewPassword = yield call(hashPassword, newPassword);

    yield call(api.service("users").patch, id, {password: hashedNewPassword, edek, kekSalt});
    yield call(loginToEncryptionMiddleware, edek, kekSalt, newPassword, id);

    yield put(
        toastsSlice.actions.add(new SuccessToastData({message: "Successfully changed password"}))
    );
}

function* authDeleteUserAccount() {
    yield put(modalsSlice.actions.showUserAccountDeletionModal());

    const {cancel, confirm} = yield race({
        cancel: take(modalsSlice.actions.cancelUserAccountDeletionModal),
        confirm: take(modalsSlice.actions.confirmUserAccountDeletionModal)
    });

    if (cancel) {
        return;
    }

    const {payload: password} = confirm;

    const email = yield select(userSlice.selectors.selectUserEmail);
    const hashedPassword = yield call(hashPassword, password);

    // Make sure the user's password is correct; will throw an error if it isn't.
    const result = yield call(api.testPassword, {email, password: hashedPassword});

    // Delete their account.
    yield call(api.service("users").remove, result.user.id);

    // 'Soft' log them out (i.e. remove their client JWT).
    // Can't call api.logout, since their user no longer exists!
    yield put(encryptionActions.logout());
    yield call(api.clearToken);

    // Kick them to the login page.
    yield put(push(ScreenUrls.LOGIN));

    // Show them a nice toast.
    yield put(
        toastsSlice.actions.add(
            new SuccessToastData({
                message: "Successfully deleted your account... Sad to see you go :(",
                title: "Success..."
            })
        )
    );
}

function* authSendPasswordReset({payload}: PayloadAction<{email: string}>, success: Saga) {
    const {email} = payload;

    try {
        yield call(api.service("authManagement").create, {
            action: "sendResetPwd",
            value: {email}
        });
    } finally {
        // Regardless of request success, we want to always ignore all errors and always succeed.
        // This way, users have less information for abusing the password resets.
        // This includes ignoring errors about unknown emails and rate limit errors.
        yield call(success);
    }
}

function* authPasswordReset({payload}: PayloadAction<{password: string; token: string}>) {
    const {password, token} = payload;

    yield put(modalsSlice.actions.showPasswordResetModal());

    const {cancel} = yield race({
        cancel: take(modalsSlice.actions.cancelPasswordResetModal),
        confirm: take(modalsSlice.actions.confirmPasswordResetModal)
    });

    if (cancel) {
        return;
    }

    const hashedPassword = yield call(hashPassword, password);

    const result = yield call(api.service("authManagement").create, {
        action: "resetPwdLong",
        value: {
            password: hashedPassword,
            token
        }
    });

    const {email} = result;

    yield put(authRequestsSlice.login.actions.request({email, password}));
    yield take(authRequestsSlice.login.actions.success);
}

function* authenticateAppAccess({payload}: PayloadAction<RouteChangePayload>) {
    const isAuthenticated = yield select(crossSliceSelectors.user.selectIsAuthenticated);
    const noAccount = yield select(userSlice.selectors.selectNoAccount);
    let hasSubscription = yield select(crossSliceSelectors.user.selectSubscriptionEnablesAppAccess);

    // Redirect to login (from app) when not authenticated.
    if ((tryingToAccessApp(payload) || tryingToAccessCheckout(payload)) && !isAuthenticated) {
        // Need a small delay because connected-react-router or react-router
        // doesn't seem to work when the redirections happen too fast. AKA, a hack.
        yield delay(AUTH_REDIRECTION);
        yield redirectUserToLogin();
    }

    if (
        // Redirect to app (from login) when authenticated.
        (tryingToAccessAuth(payload) && isAuthenticated) ||
        // Redirect to app (from no-account sign up) when the user has an account.
        (tryingToAccessNoAccountSignUp(payload) && !noAccount) ||
        // Redirect to app (from Checkout) when authenticated with a valid subscription.
        (tryingToAccessCheckout(payload) && isAuthenticated && hasSubscription)
    ) {
        yield delay(AUTH_REDIRECTION);
        yield put(replace(ScreenUrls.APP));
    }

    // Redirect to Checkout (from app) if authenticated but without a valid subscription.
    if (tryingToAccessApp(payload) && isAuthenticated && !hasSubscription && !noAccount) {
        // Refreshing the token causes the subscription status to be updated.
        yield call(authRefreshToken);

        // Re-fetch the subscription status.
        //
        // We do this to handle the case where the user has returned from successfully paying for their
        // subscription in Stripe Checkout. When they are returned to the app, their subscription status
        // will still be invalid. This would cause them to be kicked out the app and back to the Checkout
        // scene.
        //
        // However, since they _do_ hit the app, they trigger the app boot process, which triggers
        // the token refresh and the subscription status fetch. However, that doesn't complete fast enough
        // to prevent _this_ redirection rule from happening.
        //
        // As such, we manually check for the status here to make sure the user doesn't get redirected from
        // the app -> to Checkout -> back to the app, but instead just stays on the app. As in,
        // it would _work_ if we didn't do this step (the user would make it to the app), but this
        // specifically prevents the user from getting redirected several times, just improving UX.
        hasSubscription = yield select(crossSliceSelectors.user.selectSubscriptionEnablesAppAccess);

        if (!hasSubscription) {
            yield delay(AUTH_REDIRECTION);
            yield put(replace(ScreenUrls.CHECKOUT));
        }
    }
}

function* unauthenticatedRequest({payload}: PayloadAction<any>) {
    if (payload?.code === 401) {
        yield redirectUserToLogin();
    }
}

function* authSaga() {
    yield fork(
        authRequestsSlice.signUp.watchRequestSaga(authSignUp, {
            routeChangeCancellable: true,
            processEvery: false
        })
    );

    yield fork(
        authRequestsSlice.login.watchRequestSaga(authLogin, {
            routeChangeCancellable: true,
            processEvery: false
        })
    );

    yield fork(
        authRequestsSlice.loginWithoutAccount.watchRequestSaga(authLoginWithoutAccount, {
            routeChangeCancellable: true,
            processEvery: false
        })
    );

    yield fork(
        authRequestsSlice.signUpFromNoAccount.watchRequestSaga(authSignUpFromNoAccount, {
            routeChangeCancellable: true,
            processEvery: false
        })
    );

    yield fork(
        authRequestsSlice.logout.watchRequestSaga(authLogout, {
            routeChangeCancellable: true,
            processEvery: false
        })
    );

    yield fork(
        authRequestsSlice.changeEmail.watchRequestSaga(authChangeEmail, {processEvery: false})
    );

    yield fork(
        authRequestsSlice.changePassword.watchRequestSaga(authChangePassword, {processEvery: false})
    );

    yield fork(
        authRequestsSlice.deleteUserAccount.watchRequestSaga(authDeleteUserAccount, {
            processEvery: false
        })
    );

    yield fork(
        authRequestsSlice.sendPasswordReset.watchRequestSaga(authSendPasswordReset, {
            processEvery: false
        })
    );

    yield fork(
        authRequestsSlice.passwordReset.watchRequestSaga(authPasswordReset, {
            processEvery: false
        })
    );

    yield fork(
        authRequestsSlice.refreshToken.watchRequestSaga(authRefreshToken, {processEvery: false})
    );

    yield all([
        takeEvery(routerActionTypes, authenticateAppAccess),
        takeEvery(isFailedNonAuthAction, unauthenticatedRequest)
    ]);
}

/* Helper Functions */

const validateUserInfo = (email: string, password: string) => {
    if (!email || !password) {
        throw new Error("Missing credentials");
    }
};

/** When dealing with unauthenticated requests, we only care about those that _aren't_
 *  auth requests (i.e. login or sign up requests).
 *
 *  Error handling for the auth requests is handled separately (by the auth forms),
 *  and the user shouldn't be alerted to failed logins with toasts.
 */
const isFailedNonAuthAction = (action: Action<any>) => {
    return (
        RequestSliceActions.isFailureAction(action) &&
        !(
            action.type.includes("login") ||
            action.type.includes("signUp") ||
            action.type.includes("changePassword") ||
            action.type.includes("deleteUserAccount")
        )
    );
};

function* createKeys(password: string) {
    const {edek, kekSalt}: PromiseReturnValue<typeof E2ECrypto.generateKeysForNewUser> = yield call(
        E2ECrypto.generateKeysForNewUser,
        password
    );

    return {edek, kekSalt};
}

function* signUp(data: AuthData, optionalData: Record<string, any> = {}) {
    const {email, password} = data;
    validateUserInfo(email, password);

    const {edek, kekSalt} = yield call(createKeys, password);
    const hashedPassword = yield call(hashPassword, password);

    yield call(api.service("users").create, {
        email,
        password: hashedPassword,
        edek,
        kekSalt,
        ...optionalData
    });
}

function* login(data: AuthData) {
    const {email, password} = data;
    validateUserInfo(email, password);

    const hashedPassword = yield call(hashPassword, password);

    // Note: If the authentication fails, an error will be thrown and automatically handled
    // by the request slice.
    const result = yield call(api.authenticate, {
        strategy: "local",
        email,
        password: hashedPassword
    });

    return result.user;
}

function* redirectUserToLogin() {
    yield put(replace(ScreenUrls.LOGIN));

    const errorToast = new ErrorToastData({message: "Please authenticate"});
    yield put(toastsSlice.actions.add(errorToast));
}

function* redirectUserToAppAfterLogin() {
    // Need a small delay to allow the splash screen to show fully before navigating to the app
    // to allow it to render while the splash screen distracts the user.
    yield put(appSlice.actions.setAppBootLoading(true));
    yield delay(LOGIN_GO_TO_APP);

    yield put(push(ScreenUrls.APP));
}

function* logoutWithoutRedirect() {
    try {
        const noAccount = yield select(userSlice.selectors.selectNoAccount);

        if (noAccount) {
            yield put(userSlice.actions.setNoAccount(false));
        } else {
            yield put(encryptionActions.logout());
            yield call(api.logout);
        }
    } catch (e) {
        // We don't really care if the logout API call fails since it doesn't really matter
        // from the Backend's perspective.
        // But we do care from the Frontend's perspective since it prevents redirecting the user
        // out of the app.

        // If the logout failed, then manually clear the token from the Frontend.
        yield call(api.clearToken);
        console.warn(e, "Failed to logout on backend");
    }
}

function* loginToEncryptionMiddleware(edek: string, kekSalt: string, password: string, id: string) {
    // Initialize the encryption middleware with the user's credentials.
    yield put(encryptionActions.login({edek, kekSalt, password, userId: id}));

    const {failure} = yield race({
        success: take(encryptionActions.loginSuccess),
        failure: take(encryptionActions.loginFailure)
    });

    if (failure) {
        // Need to 'logout' (invalidate the access token) otherwise the user will be able
        // to access the app.
        yield call(logoutWithoutRedirect);

        throw new Error(
            "Failed to login: encryption keys might be corrupt. " +
                "Please contact support if this error persists."
        );
    }
}

export default authSaga;
