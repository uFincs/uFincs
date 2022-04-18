import {ImportProfileData} from "models";
import mounts from "store/mountpoints";
import {State} from "store/types";
import {
    createOfflineRequestSlices,
    createSliceWithSelectors,
    crudSliceReducerFactory
} from "store/utils";
import {EncryptionSchema} from "vendor/redux-e2e-encryption";

/* State */

interface ImportProfilesSliceState {
    [id: string]: ImportProfileData;
}

const initialState: ImportProfilesSliceState = {};

/* Selectors */

const selectState = (state: State): ImportProfilesSliceState => state[mounts.importProfiles];

const selectors = {
    selectImportProfiles: selectState
};

/* Slice */

export const importProfilesSlice = createSliceWithSelectors({
    name: mounts.importProfiles,
    initialState,
    reducers: {...crudSliceReducerFactory<ImportProfilesSliceState, ImportProfileData>()},
    selectors
});

/* Requests Slice */

export const importProfilesRequestsSlice = createOfflineRequestSlices(
    mounts.importProfilesRequests,
    ["create", "fetchAll"],
    {
        create: {
            effectStart: {
                encrypt: EncryptionSchema.single("importProfile")
            }
        },
        fetchAll: {}
    }
);
