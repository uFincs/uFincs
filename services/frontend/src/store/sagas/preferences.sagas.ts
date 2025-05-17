import {PayloadAction} from "@reduxjs/toolkit";
import {all, call, fork, put, select, take, takeEvery} from "redux-saga/effects";
import api from "api/";
import {Preference, PreferenceData, PreferencePersistentFields} from "models/";
import {preferencesSlice, preferencesRequestsSlice, userSlice} from "store/";
import {rollbackWrapper, showFailureToastSaga} from "store/sagas/utils";
import {EncryptionSchema} from "vendor/redux-e2e-encryption";

function* fetchAllEffect() {
    const result: Array<PreferenceData> = yield call(api.service("preferences").find);

    const rawPreferences = result?.[0];

    if (rawPreferences) {
        const preferences = new Preference(rawPreferences);
        const preferenceFields = Preference.extractDataFields(preferences);

        yield put(
            EncryptionSchema.wrapActionForDecryption(
                preferencesSlice.actions.patch(preferenceFields),
                EncryptionSchema.single("preference")
            )
        );

        // Wait until the decryption is done before continuing on.
        //
        // Refer to the `fetchAllEffect` in `accounts.sagas` for more details.
        yield all([take(preferencesSlice.actions.patch)]);
    }
}

function* patchCommit({payload}: PayloadAction<Partial<PreferenceData>>) {
    const oldPreferences = yield select(preferencesSlice.selectors.selectPersistentPreferences);

    const preferences = new Preference(payload);
    preferences.validate();

    const preferenceFields = Preference.extractDataFields(preferences);
    yield put(preferencesSlice.actions.patch(preferenceFields));

    return {payload: preferenceFields, rollbackData: oldPreferences};
}

function* patchEffect({payload}: PayloadAction<PreferencePersistentFields>) {
    const userId = yield select(userSlice.selectors.selectUserId);
    yield call(api.service("preferences").patch, userId, payload);
}

const patchRollback = rollbackWrapper<PreferencePersistentFields>(function* ({payload}) {
    const {rollbackData: oldPreferences} = payload;
    yield put(preferencesSlice.actions.patch(oldPreferences));

    return "Failed to save changed to preferences. Rolled back changes.";
});

function* preferencesSaga() {
    yield fork(
        preferencesRequestsSlice.fetchAll.watchCommitSaga(undefined, {
            isFetchEffect: true
        })
    );
    yield fork(preferencesRequestsSlice.fetchAll.watchEffectSaga(fetchAllEffect));

    yield fork(preferencesRequestsSlice.patch.watchCommitSaga(patchCommit));
    yield fork(preferencesRequestsSlice.patch.watchEffectSaga(patchEffect));
    yield fork(preferencesRequestsSlice.patch.watchRollbackSaga(patchRollback));

    yield all([
        takeEvery(
            preferencesRequestsSlice.fetchAll.actions.failure,
            showFailureToastSaga(preferencesRequestsSlice.fetchAll.actions.clear)
        )
    ]);
}

export default preferencesSaga;
