import {call, select} from "redux-saga/effects";
import {expectSaga} from "redux-saga-test-plan";
import {encryptionSlice, userSlice} from "store/";
import {isFirefoxBrowser} from "utils/browserChecks";
import {actions as encryptionActions, E2ECrypto} from "vendor/redux-e2e-encryption";
import {initAtAppBoot} from "./encryption.sagas";

describe("initAtAppBoot", () => {
    const userId = "abc";

    it("can successfully initialize the encryption keys from storage", () => {
        return expectSaga(initAtAppBoot)
            .provide([[select(userSlice.selectors.selectUserId), userId]])
            .dispatch(encryptionActions.initFromStorageSuccess())
            .put(encryptionActions.initFromStorage({userId}))
            .put(encryptionSlice.actions.initAtAppBootSuccess())
            .run();
    });

    it("can fail to initialize from storage because the keys aren't in storage", () => {
        return expectSaga(initAtAppBoot)
            .provide([
                [select(userSlice.selectors.selectUserId), userId],
                [call(E2ECrypto.isStorageAvailable), true]
            ])
            .dispatch(encryptionActions.initFromStorageFailure())
            .put(encryptionActions.initFromStorage({userId}))
            .put(encryptionSlice.actions.initAtAppBootFailure())
            .run();
    });

    it("can fail to initialize from storage because the storage isn't available", () => {
        return expectSaga(initAtAppBoot)
            .provide([
                [select(userSlice.selectors.selectUserId), userId],
                [call(E2ECrypto.isStorageAvailable), false],
                [call(isFirefoxBrowser), false]
            ])
            .dispatch(encryptionActions.initFromStorageFailure())
            .put(encryptionActions.initFromStorage({userId}))
            .put(encryptionSlice.actions.initAtAppBootFailure())
            .run();
    });

    it("can fail to initialize from storage because the storage isn't available because Firefox", () => {
        return expectSaga(initAtAppBoot)
            .provide([
                [select(userSlice.selectors.selectUserId), userId],
                [call(E2ECrypto.isStorageAvailable), false],
                [call(isFirefoxBrowser), true]
            ])
            .dispatch(encryptionActions.initFromStorageFailure())
            .put(encryptionActions.initFromStorage({userId}))
            .put(
                encryptionSlice.actions.initAtAppBootFailure({
                    message:
                        "Couldn't load encryption keys from storage. If you're using Firefox in " +
                        "Private Browsing mode, turn it off to prevent this error."
                })
            )
            .run();
    });
});
