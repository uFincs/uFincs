import {createSelector, PayloadAction} from "@reduxjs/toolkit";
import {PreferencePersistentFields} from "models/";
import mounts from "store/mountpoints";
import {State} from "store/types";
import {createOfflineRequestSlices, createSliceWithSelectors} from "store/utils";
import {Currencies, DefaultCurrency} from "values/currencies";
import {EncryptionSchema} from "vendor/redux-e2e-encryption";

/* State */

interface PreferencesSliceState {
    /** The currency that the user would prefer to have displayed for monetary amounts. */
    currency: string | null;

    /** Whether or not future (i.e. virtual) transactions should be shown in tables/charts and
     *  included in calculations. */
    showFutureTransactions: boolean;
}

const initialState: PreferencesSliceState = {
    currency: null,
    showFutureTransactions: true
};

/* Selectors */

const selectState = (state: State): PreferencesSliceState => state[mounts.preferences];

const selectCurrency = createSelector([selectState], (state) => state.currency);

const selectCurrencySymbol = createSelector([selectCurrency], (currency) => {
    if (!currency) {
        return Currencies[DefaultCurrency];
    } else if (currency in Currencies) {
        return Currencies[currency as keyof typeof Currencies];
    } else {
        console.error(`An invalid currency was detected: '${currency}'.`);
        return Currencies[DefaultCurrency];
    }
});

const selectShowFutureTransactions = createSelector(
    [selectState],
    (state) => state.showFutureTransactions
);

// "Persistent" preferences are just those that are saved to a user's account.
// Every other preference is only persistent to local storage.
//
// What determines which preferences are persistent and which aren't? My lazy ass.
const selectPersistentPreferences = createSelector(
    [selectCurrency],
    (currency): PreferencePersistentFields => ({
        currency
    })
);

const selectors = {
    selectPreferences: selectState,
    selectCurrency,
    selectCurrencySymbol,
    selectPersistentPreferences,
    selectShowFutureTransactions
};

/* Slice */

export const preferencesSlice = createSliceWithSelectors({
    name: mounts.preferences,
    initialState,
    reducers: {
        patch: (
            state: PreferencesSliceState,
            action: PayloadAction<PreferencePersistentFields>
        ) => {
            return {
                ...state,
                ...action.payload
            };
        },
        setCurrency: (state: PreferencesSliceState, action: PayloadAction<string | null>) => {
            state.currency = action.payload;
        },
        toggleShowFutureTransactions: (state: PreferencesSliceState) => {
            state.showFutureTransactions = !state.showFutureTransactions;
        }
    },
    selectors
});

/* Requests Slice */

export const preferencesRequestsSlice = createOfflineRequestSlices(
    mounts.preferencesRequests,
    ["fetchAll", "patch"],
    {
        fetchAll: {},
        patch: {
            effectStart: {
                encrypt: EncryptionSchema.single("preference")
            }
        }
    }
);
