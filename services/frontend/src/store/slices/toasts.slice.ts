import {createSelector, PayloadAction} from "@reduxjs/toolkit";
import mounts from "store/mountpoints";
import {State} from "store/types";
import {createSliceWithSelectors} from "store/utils";
import {ErrorToastData, ServiceWorkerUpdateToastData, ToastData} from "structures/";
import {GenericObject, Id} from "utils/types";

const USER_FRIENDLY_ERRORS: GenericObject = {
    "invalid signature": "Your session has been revoked; please login again."
};

/* State */

interface ToastsSliceState {
    byId: Record<Id, ToastData>;
    allIds: Array<Id>;
}

const initialState: ToastsSliceState = {
    byId: {},
    allIds: []
};

/* Selectors */

const selectState = (state: State): ToastsSliceState => state[mounts.toasts];

const selectToasts = createSelector([selectState], (toastsState) =>
    toastsState.allIds.map((id) => toastsState.byId[id])
);

const selectors = {
    selectToasts
};

/* Slice */

export const toastsSlice = createSliceWithSelectors({
    name: mounts.toasts,
    initialState,
    reducers: {
        add: (state: ToastsSliceState, action: PayloadAction<ToastData>) => {
            // Expects a Toast object as payload
            const {payload} = action;
            const {id} = payload;

            // If we try to add a duplicate toast, just throw it away.
            //
            // There is one particular case of duplicate toasts that was really annoying:
            // Prompts to 'Please authenticate'. They would usually double up because one toast would
            // be sent by the authenticator for accessing the app and another would be sent because of
            // the fetch requests failing due invalid credentials.
            if (isDuplicateToast(state, payload)) {
                return;
            }

            if (payload.message in USER_FRIENDLY_ERRORS) {
                payload.message = USER_FRIENDLY_ERRORS[payload.message];
            }

            state.byId[id] = payload;
            state.allIds.push(id);
        },
        delete: (state: ToastsSliceState, action: PayloadAction<Id>) => {
            // Expects a toast ID as payload
            const {payload} = action;

            delete state.byId[payload];
            state.allIds = state.allIds.filter((id) => id !== payload);
        }
    },
    selectors
});

/* Helper Functions */

const TYPES_TO_DEDUPLICATE = [ErrorToastData.TYPE, ServiceWorkerUpdateToastData.TYPE];

const isDuplicateToast = (state: ToastsSliceState, toast: ToastData) => {
    const allToasts = Object.values(state.byId);

    return allToasts.some(
        ({message, title, type}) =>
            message === toast.message &&
            title === toast.title &&
            TYPES_TO_DEDUPLICATE.includes(type)
    );
};
