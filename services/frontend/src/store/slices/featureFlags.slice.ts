import {createSelector, PayloadAction} from "@reduxjs/toolkit";
import mounts from "store/mountpoints";
import {State} from "store/types";
import {createSliceWithSelectors} from "store/utils";

/* State */

interface FeatureFlagsSliceState {
    subscriptions: boolean;
}

// These are default values for the flags;
// they should be populated by the true values from the Backend.
const initialState: FeatureFlagsSliceState = {subscriptions: true};

/* Selectors */

const selectState = (state: State): FeatureFlagsSliceState => state[mounts.featureFlags];

const selectSubscriptionsFlag = createSelector([selectState], (state) => {
    // TECH DEBT: Since Stripe Checkout and Stripe Customer Portal redirect to a different domain,
    // we can't use Cypress to test them. As such, we're doing the very easy but very non-reassuring
    // thing by just disabling subscriptions when running the e2e tests.
    //
    // In practice, this means that we can't really test the Checkout scene, the Billing section of the
    // Settings, nor any of the subscription related redirect logic. Which is... not great, but ya know,
    // it's not like the subscriptions are _important_ for the app for anything /s
    if (window.Cypress) {
        return false;
    } else {
        return state.subscriptions;
    }
});

const selectors = {
    selectFeatureFlags: selectState,
    selectSubscriptionsFlag
};

/* Slice */

export const featureFlagsSlice = createSliceWithSelectors({
    name: mounts.featureFlags,
    initialState,
    reducers: {
        setFeatureFlags: (
            _state: FeatureFlagsSliceState,
            action: PayloadAction<FeatureFlagsSliceState>
        ) => action.payload
    },
    selectors
});
