import {PayloadAction} from "@reduxjs/toolkit";
import {all, call, fork, put, take, takeEvery} from "redux-saga/effects";
import api, {apiErrors} from "api/";
import {ImportProfile, ImportProfileData, ImportProfileMappingData} from "models/";
import {
    importProfilesSlice,
    importProfileMappingsSlice,
    importProfilesRequestsSlice,
    toastsSlice
} from "store/";
import {rollbackWrapper, showFailureToastSaga} from "store/sagas/utils";
import {SuccessToastData} from "structures/";
import {Id} from "utils/types";
import {EncryptionSchema} from "vendor/redux-e2e-encryption";

export function* fetchAllEffect() {
    const result: Array<ImportProfileData> = yield call(api.service("importProfiles").find);

    const profilesById = result.reduce<Record<Id, ImportProfileData>>((acc, profileData) => {
        const importProfileMappingIds = profileData.importProfileMappings!.map(({id}) => id);

        const profile = {...profileData, importProfileMappingIds};
        profile.importProfileMappings = []; // Zero out the mappings for storage in the store -> normalization
        acc[profile.id] = profile;

        return acc;
    }, {});

    const mappingsById = result.reduce<Record<Id, ImportProfileMappingData>>(
        (allMappings, profileData) => {
            return profileData.importProfileMappings!.reduce((profileMappings, mappingData) => {
                profileMappings[mappingData.id] = mappingData;
                return profileMappings;
            }, allMappings);
        },
        {}
    );

    yield put(
        EncryptionSchema.wrapActionForDecryption(
            importProfilesSlice.actions.set(profilesById),
            EncryptionSchema.mapOf("importProfile")
        )
    );

    yield put(
        EncryptionSchema.wrapActionForDecryption(
            importProfileMappingsSlice.actions.set(mappingsById),
            EncryptionSchema.mapOf("importProfileMapping")
        )
    );

    // Wait until the decryption is done before continuing on.
    //
    // Refer to the `fetchAllEffect` in `accounts.sagas` for more details.
    yield all([
        take(importProfilesSlice.actions.set),
        take(importProfileMappingsSlice.actions.set)
    ]);
}

export function* createCommit({payload}: PayloadAction<ImportProfileData>) {
    const profile = new ImportProfile(payload);
    profile.validate();

    yield put(importProfilesSlice.actions.add(profile));
    yield put(importProfileMappingsSlice.actions.addMany(profile.importProfileMappings));

    const successToast = new SuccessToastData({message: `Created CSV format "${profile.name}"!`});
    yield put(toastsSlice.actions.add(successToast));

    return profile;
}

export function* createEffect({payload}: PayloadAction<ImportProfileData>) {
    const profile = payload;
    yield call(api.service("importProfiles").create, profile);
}

export const createRollback = rollbackWrapper<ImportProfileData>(function* ({payload}) {
    const {rollbackData: profile, error} = payload;

    if (apiErrors.entityAlreadyExists(error)) {
        return;
    }

    yield put(importProfilesSlice.actions.delete(profile.id));

    for (const mapping of profile.importProfileMappings || []) {
        yield put(importProfileMappingsSlice.actions.delete(mapping.id));
    }

    return `Failed to save import profile ${profile?.name}. Rolled back creation.`;
});

function* importProfilesSaga() {
    yield fork(
        importProfilesRequestsSlice.fetchAll.watchCommitSaga(undefined, {
            isFetchEffect: true
        })
    );
    yield fork(importProfilesRequestsSlice.fetchAll.watchEffectSaga(fetchAllEffect));

    yield fork(importProfilesRequestsSlice.create.watchCommitSaga(createCommit));
    yield fork(importProfilesRequestsSlice.create.watchEffectSaga(createEffect));
    yield fork(importProfilesRequestsSlice.create.watchRollbackSaga(createRollback));

    yield all([
        takeEvery(
            importProfilesRequestsSlice.fetchAll.actions.failure,
            showFailureToastSaga(importProfilesRequestsSlice.fetchAll.actions.clear)
        ),
        takeEvery(
            importProfilesRequestsSlice.create.actions.failure,
            showFailureToastSaga(importProfilesRequestsSlice.create.actions.clear)
        )
    ]);
}

export default importProfilesSaga;
