import {createSelector} from "@reduxjs/toolkit";
import api from "api/";
import {BackupDataFormat} from "services/BackupService";
import {
    accountsSlice,
    featureFlagsSlice,
    importProfilesSlice,
    importProfileMappingsSlice,
    importRulesSlice,
    importRuleActionsSlice,
    importRuleConditionsSlice,
    preferencesSlice,
    recurringTransactionsSlice,
    transactionsSlice,
    userSlice
} from "store/slices";
import {State} from "store/types";

const selectDataForBackup = createSelector(
    [
        accountsSlice.selectors.selectAccounts,
        importProfilesSlice.selectors.selectImportProfiles,
        importProfileMappingsSlice.selectors.selectImportProfileMappings,
        importRulesSlice.selectors.selectImportRules,
        importRuleActionsSlice.selectors.selectImportRuleActions,
        importRuleConditionsSlice.selectors.selectImportRuleConditions,
        preferencesSlice.selectors.selectPersistentPreferences,
        recurringTransactionsSlice.selectors.selectRecurringTransactions,
        transactionsSlice.selectors.selectTransactions
    ],
    (
        accounts,
        importProfiles,
        importProfileMappings,
        importRules,
        importRuleActions,
        importRuleConditions,
        preferences,
        recurringTransactions,
        transactions
    ): BackupDataFormat => ({
        accounts,
        importProfiles,
        importProfileMappings,
        importRules,
        importRuleActions,
        importRuleConditions,
        preferences,
        recurringTransactions,
        transactions
    })
);

// Note: This isn't a memoized selector because it relies on a piece of state (the authenticated state)
// that isn't part of the store.
//
// As such, _because_ it isn't a memoized selector, it should _not_ be used by components in a `connect`
// function or `useSelector` hook, because it'll be re-run far too much. Instead, it should only
// be called when it needs to be called (i.e. in sagas).
const selectIsAuthenticated = (state: State) => {
    const noAccount = userSlice.selectors.selectNoAccount(state);
    return noAccount || api.isAuthenticated();
};

const selectSubscriptionEnablesAppAccess = createSelector(
    [
        userSlice.selectors.selectSubscriptionEnablesAppAccess,
        featureFlagsSlice.selectors.selectSubscriptionsFlag
    ],
    (hasSubscription, flagEnabled) => (flagEnabled ? hasSubscription : true)
);

const selectReadOnlySubscription = createSelector(
    [
        userSlice.selectors.selectReadOnlySubscription,
        featureFlagsSlice.selectors.selectSubscriptionsFlag
    ],
    (readOnly, flagEnabled) => (flagEnabled ? readOnly : false)
);

const selectSubscriptionIsLifetime = createSelector(
    [
        userSlice.selectors.selectSubscriptionIsLifetime,
        featureFlagsSlice.selectors.selectSubscriptionsFlag
    ],
    (isLifetime, flagEnabled) => (flagEnabled ? isLifetime : true)
);

const userSelectors = {
    selectDataForBackup,
    selectIsAuthenticated,
    selectSubscriptionEnablesAppAccess,
    selectReadOnlySubscription,
    selectSubscriptionIsLifetime
};

export default userSelectors;
