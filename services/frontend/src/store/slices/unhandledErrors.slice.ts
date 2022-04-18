import {createSelector, PayloadAction} from "@reduxjs/toolkit";
import mounts from "store/mountpoints";
import {ObjectifiedError, State} from "store/types";
import {createSliceWithSelectors} from "store/utils";

// This holds all the errors that would have gone uncaught if not for root-level error handlers.
// That is, these are all unhandled errors; errors that bubbled up all the way to the top and weren't
// handled properly; errors that might otherwise have crashed the app.
//
// These errors should somehow make their way to our logging/alerting systems.

/* State */

interface UnhandledErrorsState {
    // The list of errors acts like a queue; this way, each error can be processed one-by-one.
    errors: Array<ObjectifiedError>;
}

const initialState: UnhandledErrorsState = {errors: []};

/* Selector */

const selectState = (state: State): UnhandledErrorsState => state[mounts.unhandledErrors];
const selectErrors = createSelector([selectState], (state) => state.errors);

const selectHeadError = createSelector([selectErrors], (errors) => errors[0]);

const selectors = {
    selectState,
    selectErrors,
    selectHeadError
};

/* Slice */

export const unhandledErrorsSlice = createSliceWithSelectors({
    name: mounts.unhandledErrors,
    initialState,
    reducers: {
        push: (state, action: PayloadAction<ObjectifiedError>) => {
            state.errors.push(action.payload);
        },
        removeHead: (state) => {
            state.errors.shift();
        }
    },
    selectors
});
