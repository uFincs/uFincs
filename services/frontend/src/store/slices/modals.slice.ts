import {createSelector, PayloadAction} from "@reduxjs/toolkit";
import mounts from "store/mountpoints";
import {State} from "store/types";
import {createSliceWithSelectors} from "store/utils";
import {unhandledErrorsSlice} from "./unhandledErrors.slice";

/* State */

interface ModalsSliceState {
    accountDeletionModalVisibility: boolean;
    feedbackModalVisibility: boolean;
    noAccountLogoutModalVisibility: boolean;
    passwordResetModalVisibility: boolean;
    userAccountDeletionModalVisibility: boolean;

    /* For indexing in the `selectAnyModalVisible` selector. */
    [key: string]: boolean;
}

const initialState: ModalsSliceState = {
    accountDeletionModalVisibility: false,
    feedbackModalVisibility: false,
    noAccountLogoutModalVisibility: false,
    passwordResetModalVisibility: false,
    userAccountDeletionModalVisibility: false
};

/* Selectors */

const selectState = (state: State): ModalsSliceState => state[mounts.modals];

const selectAccountDeletionModalVisibility = createSelector(
    [selectState],
    (modals) => modals.accountDeletionModalVisibility
);

const selectFeedbackModalVisibility = createSelector(
    [selectState],
    (modals) => modals.feedbackModalVisibility
);

const selectNoAccountLogoutModalVisibility = createSelector(
    [selectState],
    (modals) => modals.noAccountLogoutModalVisibility
);

const selectPasswordResetModalVisibility = createSelector(
    [selectState],
    (modals) => modals.passwordResetModalVisibility
);

const selectUserAccountDeletionModalVisibility = createSelector(
    [selectState],
    (modals) => modals.userAccountDeletionModalVisibility
);

const selectAnyModalVisible = createSelector([selectState], (state) =>
    Object.keys(state).reduce((acc, key) => acc || state[key], false)
);

const selectors = {
    selectModals: selectState,
    selectAccountDeletionModalVisibility,
    selectFeedbackModalVisibility,
    selectNoAccountLogoutModalVisibility,
    selectPasswordResetModalVisibility,
    selectUserAccountDeletionModalVisibility,
    selectAnyModalVisible
};

/* Slice */

export const modalsSlice = createSliceWithSelectors({
    name: mounts.modals,
    initialState,
    reducers: {
        showAccountDeletionModal: (state: ModalsSliceState) => {
            state.accountDeletionModalVisibility = true;
        },
        confirmAccountDeletionModal: (state: ModalsSliceState) => {
            state.accountDeletionModalVisibility = false;
        },
        cancelAccountDeletionModal: (state: ModalsSliceState) => {
            state.accountDeletionModalVisibility = false;
        },
        showFeedbackModal: (state: ModalsSliceState) => {
            state.feedbackModalVisibility = true;
        },
        hideFeedbackModal: (state: ModalsSliceState) => {
            state.feedbackModalVisibility = false;
        },
        showNoAccountLogoutModal: (state: ModalsSliceState) => {
            state.noAccountLogoutModalVisibility = true;
        },
        confirmNoAccountLogoutModal: (state: ModalsSliceState) => {
            state.noAccountLogoutModalVisibility = false;
        },
        cancelNoAccountLogoutModal: (state: ModalsSliceState) => {
            state.noAccountLogoutModalVisibility = false;
        },
        showPasswordResetModal: (state: ModalsSliceState) => {
            state.passwordResetModalVisibility = true;
        },
        confirmPasswordResetModal: (state: ModalsSliceState) => {
            state.passwordResetModalVisibility = false;
        },
        cancelPasswordResetModal: (state: ModalsSliceState) => {
            state.passwordResetModalVisibility = false;
        },
        showUserAccountDeletionModal: (state: ModalsSliceState) => {
            state.userAccountDeletionModalVisibility = true;
        },
        confirmUserAccountDeletionModal: (
            state: ModalsSliceState,
            // The action takes a string payload for the password.
            // This is used in the sagas, but needs to be declared here for typing purposes.
            action: PayloadAction<string>
        ) => {
            state.userAccountDeletionModalVisibility = false;
        },
        cancelUserAccountDeletionModal: (state: ModalsSliceState) => {
            state.userAccountDeletionModalVisibility = false;
        }
    },
    extraReducers: {
        // Instead of modifying the FeedbackDialog or BackgroundBlur to manually check the unhandled errors
        // state for visibility, we just derive it directly.
        [unhandledErrorsSlice.actions.push.toString()]: (state) => {
            state.feedbackModalVisibility = true;
        },
        [unhandledErrorsSlice.actions.removeHead.toString()]: (state) => {
            state.feedbackModalVisibility = false;
        }
    },
    selectors
});
