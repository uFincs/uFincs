import {createSelector, PayloadAction} from "@reduxjs/toolkit";
import mounts from "store/mountpoints";
import {State} from "store/types";
import {createSliceWithSelectors} from "store/utils";

/* State */

interface AppState {
    appBootLoading: boolean;
}

const initialState: AppState = {appBootLoading: false};

/* Selector */

const selectState = (state: State): AppState => state[mounts.app];
const selectAppBootLoading = createSelector([selectState], (state) => state.appBootLoading);

const selectors = {
    selectAppBootLoading
};

/* Slice */

export const appSlice = createSliceWithSelectors({
    name: mounts.app,
    initialState,
    reducers: {
        setAppBootLoading: (state: AppState, action: PayloadAction<boolean>) => {
            state.appBootLoading = action.payload;
        },

        /* Saga Only Actions */
        refreshApp: (state: AppState) => state
    },
    selectors
});
