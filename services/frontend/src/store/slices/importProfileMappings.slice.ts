import {ImportProfileMappingData} from "models/";
import mounts from "store/mountpoints";
import {State} from "store/types";
import {createSliceWithSelectors, crudSliceReducerFactory} from "store/utils";

/* State */

interface ImportProfileMappingsSliceState {
    [id: string]: ImportProfileMappingData;
}

const initialState: ImportProfileMappingsSliceState = {};

/* Selectors */

const selectState = (state: State): ImportProfileMappingsSliceState =>
    state[mounts.importProfileMappings];

const selectors = {
    selectImportProfileMappings: selectState
};

/* Slice */

export const importProfileMappingsSlice = createSliceWithSelectors({
    name: mounts.importProfileMappings,
    initialState,
    reducers: {
        ...crudSliceReducerFactory<ImportProfileMappingsSliceState, ImportProfileMappingData>()
    },
    selectors
});
