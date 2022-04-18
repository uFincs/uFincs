import {createSelector} from "@reduxjs/toolkit";
import {ImportRuleActionData} from "models/";
import mounts from "store/mountpoints";
import {State} from "store/types";
import {createSliceWithSelectors, crudSliceReducerFactory} from "store/utils";

/* State */

interface ImportRuleActionsSliceState {
    [id: string]: ImportRuleActionData;
}

const initialState: ImportRuleActionsSliceState = {};

/* Selectors */

const selectState = (state: State): ImportRuleActionsSliceState => state[mounts.importRuleActions];

const selectImportRuleAction = createSelector(
    [selectState, (_: any, id: string) => id],
    (actionsById, id) => actionsById[id]
);

const selectors = {
    selectImportRuleActions: selectState,
    selectImportRuleAction
};

/* Slice */

export const importRuleActionsSlice = createSliceWithSelectors({
    name: mounts.importRuleActions,
    initialState,
    reducers: {
        ...crudSliceReducerFactory<ImportRuleActionsSliceState, ImportRuleActionData>()
    },
    selectors
});
