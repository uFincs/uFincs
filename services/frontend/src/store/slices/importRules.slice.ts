import {createSelector, PayloadAction} from "@reduxjs/toolkit";
import {ImportRuleData} from "models";
import mounts from "store/mountpoints";
import {State} from "store/types";
import {
    createOfflineRequestSlices,
    createSliceWithSelectors,
    crudSliceReducerFactory
} from "store/utils";
import {Id} from "utils/types";
import {EncryptionSchema} from "vendor/redux-e2e-encryption";

/* State */

interface ImportRulesSliceState {
    [id: string]: ImportRuleData;
}

const initialState: ImportRulesSliceState = {};

/* Selectors */

const selectState = (state: State): ImportRulesSliceState => state[mounts.importRules];

const selectImportRule = createSelector(
    [selectState, (_: any, id: string) => id],
    (rulesById, id) => rulesById[id]
);

const selectors = {
    selectImportRules: selectState,
    selectImportRule
};

/* Slice */

export const importRulesSlice = createSliceWithSelectors({
    name: mounts.importRules,
    initialState,
    reducers: {
        ...crudSliceReducerFactory<ImportRulesSliceState, ImportRuleData>(),

        /* Saga Only Actions */
        undoableDestroyImportRule: (state: ImportRulesSliceState, action: PayloadAction<Id>) =>
            state
    },
    selectors
});

/* Requests Slice */

export const importRulesRequestsSlice = createOfflineRequestSlices(
    mounts.importRulesRequests,
    ["create", "destroy", "fetchAll", "update"],
    {
        create: {
            effectStart: {
                encrypt: EncryptionSchema.single("importRule")
            }
        },
        destroy: {},
        fetchAll: {},
        update: {
            effectStart: {
                encrypt: EncryptionSchema.single("importRule")
            }
        }
    }
);
