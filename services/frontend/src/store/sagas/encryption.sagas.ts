import {PayloadAction} from "@reduxjs/toolkit";
import {all, call, put, race, select, take, takeEvery} from "redux-saga/effects";
import {
    accountsSlice,
    encryptionSlice,
    importProfilesSlice,
    importProfileMappingsSlice,
    importRulesSlice,
    importRuleActionsSlice,
    importRuleConditionsSlice,
    preferencesSlice,
    transactionsSlice,
    toastsSlice,
    userSlice
} from "store/";
import {ErrorToastData} from "structures/";
import {isFirefoxBrowser} from "utils/browserChecks";
import {actions as encryptionActions, E2ECrypto} from "vendor/redux-e2e-encryption";

export function* initAtAppBoot() {
    const userId: string = yield select(userSlice.selectors.selectUserId);

    yield put(encryptionActions.initFromStorage({userId}));

    const {failure} = yield race({
        success: take(encryptionActions.initFromStorageSuccess),
        failure: take(encryptionActions.initFromStorageFailure)
    });

    if (failure) {
        const isStorageAvailable = yield call(E2ECrypto.isStorageAvailable);
        const isFirefox = yield call(isFirefoxBrowser);

        const error =
            isStorageAvailable || !isFirefox
                ? undefined
                : {
                      message:
                          "Couldn't load encryption keys from storage. If you're using Firefox in " +
                          "Private Browsing mode, turn it off to prevent this error."
                  };

        yield put(encryptionSlice.actions.initAtAppBootFailure(error));
    } else {
        yield put(encryptionSlice.actions.initAtAppBootSuccess());
    }
}

function* handleFetchDecryptionError(
    action: PayloadAction<{message: string}, string, never, boolean>
) {
    const {error = false, payload} = action;

    if (error) {
        const errorToast = new ErrorToastData({message: payload.message});
        yield put(toastsSlice.actions.add(errorToast));
    }
}

function* encryptionSaga() {
    yield all([
        takeEvery(encryptionSlice.actions.initAtAppBoot, initAtAppBoot),
        takeEvery(
            [
                accountsSlice.actions.set.type,
                importProfilesSlice.actions.set.type,
                importProfileMappingsSlice.actions.set.type,
                importRulesSlice.actions.set,
                importRulesSlice.actions.set,
                importRuleActionsSlice.actions.set,
                importRuleConditionsSlice.actions.set,
                preferencesSlice.actions.patch.type,
                transactionsSlice.actions.set.type
            ],
            handleFetchDecryptionError
        )
    ]);
}

export default encryptionSaga;
