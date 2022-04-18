import {createSelector, PayloadAction} from "@reduxjs/toolkit";
import mounts from "store/mountpoints";
import {State} from "store/types";
import {
    createRequestSlices,
    createOfflineRequestSlices,
    createSliceWithSelectors
} from "store/utils";
import {Id} from "utils/types";

/* State */

/** active = subscription is in good standing; user can use the app
 *  inactive = subscription has been cancelled or hasn't been started; user can not use the app
 *  expired = user hasn't paid for next period of subscription; user can use app in read-only
 *  null = user doesn't have a subscription; user can not use the app and must get a subscription */
type SubscriptionStatus = "active" | "inactive" | "expired" | null;

interface UserSliceState {
    /** The user's unique ID. */
    id: Id;

    /** The user's email. */
    email: string;

    /** Whether or not the user has been through the onboarding process already. */
    isOnboarded: boolean;

    /** Whether or not the user is using the app without an account (i.e. no-account mode). */
    noAccount: boolean;

    /** Whether or not the user has a lifetime subscription. */
    subscriptionIsLifetime: boolean;

    /** The status of the user's subscription. */
    subscriptionStatus: SubscriptionStatus;
}

const initialState: UserSliceState = {
    id: "",
    email: "",
    isOnboarded: false,
    noAccount: false,
    subscriptionIsLifetime: false,
    subscriptionStatus: null
};

/* Selectors */

const selectState = (state: State): UserSliceState => state[mounts.user];

const selectUserEmail = createSelector([selectState], (state) => state.email);
const selectUserId = createSelector([selectState], (state) => state.id);
const selectIsOnboarded = createSelector([selectState], (state) => state.isOnboarded);
const selectNoAccount = createSelector([selectState], (state) => state.noAccount);
const selectSubscriptionStatus = createSelector([selectState], (state) => state.subscriptionStatus);

const selectSubscriptionEnablesAppAccess = createSelector(
    [selectSubscriptionStatus],
    (status) => status === "active" || status === "expired"
);

const selectReadOnlySubscription = createSelector(
    [selectSubscriptionStatus],
    (status) => status === "expired"
);

const selectSubscriptionIsLifetime = createSelector(
    [selectState],
    (state) => state.subscriptionIsLifetime
);

const selectors = {
    selectUser: selectState,
    selectUserEmail,
    selectUserId,
    selectIsOnboarded,
    selectNoAccount,
    selectSubscriptionIsLifetime,
    selectSubscriptionStatus,
    selectSubscriptionEnablesAppAccess,
    selectReadOnlySubscription
};

/* Slice */

export const userSlice = createSliceWithSelectors({
    name: mounts.user,
    initialState,
    reducers: {
        setUserId: (state: UserSliceState, action: PayloadAction<Id>) => {
            state.id = action.payload;
        },
        setUserEmail: (state: UserSliceState, action: PayloadAction<string>) => {
            state.email = action.payload;
        },
        setIsOnboarded: (state: UserSliceState, action: PayloadAction<boolean>) => {
            state.isOnboarded = action.payload;
        },
        setNoAccount: (state: UserSliceState, action: PayloadAction<boolean>) => {
            state.noAccount = action.payload;
        },
        setSubscriptionStatus: (
            state: UserSliceState,
            action: PayloadAction<SubscriptionStatus>
        ) => {
            state.subscriptionStatus = action.payload;
        },
        setUser: (_: UserSliceState, action: PayloadAction<UserSliceState>) => action.payload
    },
    selectors
});

export const userRequestsSlice = createRequestSlices(mounts.userRequests, [
    "createBackup",
    "createEncryptedBackup"
]);

export const userOfflineRequestsSlice = createOfflineRequestSlices(mounts.userOfflineRequests, [
    "restoreBackup"
]);
