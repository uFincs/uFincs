import {push} from "connected-react-router";
import {call, delay, select} from "redux-saga/effects";
import {expectSaga} from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import {vi} from "vitest";
import api from "api/";
import {appSlice, authRequestsSlice, crossSliceSelectors, userSlice} from "store/";
import {silenceConsoleErrors} from "utils/testHelpers";
import {LOGIN_GO_TO_APP} from "values/intentionalDelays";
import ScreenUrls from "values/screenUrls";
import {actions as encryptionActions, E2ECrypto} from "vendor/redux-e2e-encryption";
import {authLogin, authSignUp} from "./auth.sagas";

const provideHasSubscription = (result: boolean): [any, boolean] => {
    return [select(crossSliceSelectors.user.selectSubscriptionEnablesAppAccess), result];
};

describe("authSignUp", () => {
    const successMock = vi.fn();

    beforeEach(() => {
        successMock.mockReset();
    });

    it("can sign up", () => {
        const action = {type: "", payload: {email: "test@test.com", password: "test"}};

        return expectSaga(authSignUp, action, successMock)
            .provide([
                [matchers.call.fn(api.service("users").create), null],
                [
                    call(E2ECrypto.generateKeysForNewUser, action.payload.password),
                    {edek: "", kekSalt: ""}
                ]
            ])
            .call(E2ECrypto.generateKeysForNewUser, action.payload.password)
            .call.fn(api.service("users").create)
            .call(successMock)
            .put(authRequestsSlice.login.actions.request(action.payload))
            .run();
    });
});

describe("authLogin", () => {
    const id = "123";
    const email = "test@test.com";
    const password = "test";
    const edek = "abc";
    const kekSalt = "def";
    const isOnboarded = true;
    const subscriptionIsLifetime = false;
    const subscriptionStatus = "active";

    const action = {type: "", payload: {email, password}};
    const loginResult = {
        user: {id, edek, kekSalt, isOnboarded, subscriptionIsLifetime, subscriptionStatus}
    };

    const successMock = vi.fn();

    beforeEach(() => {
        successMock.mockReset();
    });

    it("can login successfully", () => {
        return expectSaga(authLogin, action, successMock)
            .provide([
                provideHasSubscription(true),
                [matchers.call.fn(api.authenticate), loginResult],
                [delay(LOGIN_GO_TO_APP), null]
            ])
            .dispatch(encryptionActions.loginSuccess())
            .put(
                userSlice.actions.setUser({
                    id,
                    email,
                    isOnboarded,
                    noAccount: false,
                    subscriptionIsLifetime,
                    subscriptionStatus
                })
            )
            .put(encryptionActions.login({edek, kekSalt, password, userId: id}))
            .call(successMock)
            .put(appSlice.actions.setAppBootLoading(true))
            .put(push(ScreenUrls.APP))
            .run();
    });

    it("can login and fail to initialize the encryption middleware", () => {
        silenceConsoleErrors();

        return expectSaga(authLogin, action, successMock)
            .provide([
                [matchers.call.fn(api.authenticate), loginResult],
                [matchers.call.fn(api.logout), null],
                [select(userSlice.selectors.selectNoAccount), false]
            ])
            .dispatch(encryptionActions.loginFailure())
            .put(encryptionActions.login({edek, kekSalt, password, userId: id}))
            .put(encryptionActions.logout())
            .call(api.logout)
            .not.call(successMock)
            .not.put(push(ScreenUrls.APP))
            .throws(
                new Error(
                    "Failed to login: encryption keys might be corrupt. " +
                        "Please contact support if this error persists."
                )
            )
            .run();
    });

    it("will fail to login if the email isn't provided", () => {
        silenceConsoleErrors();

        const invalidAction: typeof action = JSON.parse(JSON.stringify(action));
        invalidAction.payload.email = "";

        return expectSaga(authLogin, invalidAction, successMock)
            .throws(new Error("Missing credentials"))
            .run();
    });

    it("will fail to login if the password isn't provided", () => {
        silenceConsoleErrors();

        const invalidAction: typeof action = JSON.parse(JSON.stringify(action));
        invalidAction.payload.password = "";

        return expectSaga(authLogin, invalidAction, successMock)
            .throws(new Error("Missing credentials"))
            .run();
    });
});
