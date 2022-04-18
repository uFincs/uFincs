import {createSelector} from "@reduxjs/toolkit";
import {ImportRuleConditionData} from "models/";
import mounts from "store/mountpoints";
import {State} from "store/types";
import {createSliceWithSelectors, crudSliceReducerFactory} from "store/utils";

/* State */

interface ImportRuleConditionsSliceState {
    [id: string]: ImportRuleConditionData;
}

const initialState: ImportRuleConditionsSliceState = {};

/* Selectors */

const selectState = (state: State): ImportRuleConditionsSliceState =>
    state[mounts.importRuleConditions];

const selectImportRuleCondition = createSelector(
    [selectState, (_: any, id: string) => id],
    (conditionsById, id) => conditionsById[id]
);

const selectors = {
    selectImportRuleConditions: selectState,
    selectImportRuleCondition
};

/* Slice */

export const importRuleConditionsSlice = createSliceWithSelectors({
    name: mounts.importRuleConditions,
    initialState,
    reducers: {
        ...crudSliceReducerFactory<ImportRuleConditionsSliceState, ImportRuleConditionData>()
    },
    selectors
});
