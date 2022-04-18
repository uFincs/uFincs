import {createSelector} from "@reduxjs/toolkit";
import {ImportProfile} from "models/";
import {importProfilesSlice, importProfileMappingsSlice} from "store/slices";
import objectReduce from "utils/objectReduce";
import {Id} from "utils/types";

const selectImportProfile = (id: Id) =>
    createSelector(
        [
            importProfilesSlice.selectors.selectImportProfiles,
            importProfileMappingsSlice.selectors.selectImportProfileMappings
        ],
        (profilesById, mappingsById) =>
            ImportProfile.populateImportProfile(mappingsById)(profilesById[id])
    );

const selectImportProfilesById = createSelector(
    [
        importProfilesSlice.selectors.selectImportProfiles,
        importProfileMappingsSlice.selectors.selectImportProfileMappings
    ],
    (profilesById, mappingsById) =>
        objectReduce(profilesById, (profile) =>
            ImportProfile.populateImportProfile(mappingsById)(profile)
        )
);

const selectImportProfiles = createSelector(
    [
        importProfilesSlice.selectors.selectImportProfiles,
        importProfileMappingsSlice.selectors.selectImportProfileMappings
    ],
    (profilesById, mappingsById) =>
        Object.values(profilesById).map(ImportProfile.populateImportProfile(mappingsById))
);

const importProfileSelectors = {
    selectImportProfile,
    selectImportProfilesById,
    selectImportProfiles
};

export default importProfileSelectors;
