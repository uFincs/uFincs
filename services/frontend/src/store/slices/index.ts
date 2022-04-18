import {accountsSlice, accountsRequestsSlice} from "./accounts.slice";
import {appSlice} from "./app.slice";
import {authRequestsSlice} from "./auth.slice";
import {billingRequestsSlice} from "./billing.slice";
import {encryptionSlice} from "./encryption.slice";
import {featureFlagsSlice} from "./featureFlags.slice";
import {feedbackRequestsSlice} from "./feedback.slice";
import {fileDownloadSlice} from "./fileDownload.slice";
import {importProfileMappingsSlice} from "./importProfileMappings.slice";
import {importProfilesSlice, importProfilesRequestsSlice} from "./importProfiles.slice";
import {importRuleActionsSlice} from "./importRuleActions.slice";
import {importRuleConditionsSlice} from "./importRuleConditions.slice";
import {importRulesSlice, importRulesRequestsSlice} from "./importRules.slice";
import {modalsSlice} from "./modals.slice";
import {offlineRequestManagerSlice} from "./offlineRequestManager.slice";
import {onboardingSlice, onboardingRequestsSlice} from "./onboarding.slice";
import {preferencesSlice, preferencesRequestsSlice} from "./preferences.slice";
import {
    recurringTransactionsSlice,
    recurringTransactionsRequestsSlice
} from "./recurringTransactions.slice";
import {routerExtensionSlice} from "./routerExtension.slice";
import {serviceWorkerSlice} from "./serviceWorker.slice";
import {toastsSlice} from "./toasts.slice";
import {transactionsSlice, transactionsRequestsSlice} from "./transactions.slice";
import {transactionsDateIndexSlice} from "./transactionsDateIndex.slice";
import {transactionsImportSlice, transactionsImportRequestsSlice} from "./transactionsImport.slice";
import {transactionsIndexSlice} from "./transactionsIndex.slice";
import {unhandledErrorsSlice} from "./unhandledErrors.slice";
import {userSlice, userOfflineRequestsSlice, userRequestsSlice} from "./user.slice";
import {virtualTransactionsSlice} from "./virtualTransactions.slice";

// Need to have the slices as a single object so that TypeScript can type it properly.
// Just importing all the slices using `import * as slices` isn't good enough to get the types.
//
// Note: The encryptionSlice is not registered here, since it is reducer-less slice.
const slices = {
    accountsSlice,
    accountsRequestsSlice,
    appSlice,
    authRequestsSlice,
    billingRequestsSlice,
    featureFlagsSlice,
    feedbackRequestsSlice,
    fileDownloadSlice,
    importProfilesSlice,
    importProfilesRequestsSlice,
    importProfileMappingsSlice,
    importRuleActionsSlice,
    importRuleConditionsSlice,
    importRulesSlice,
    importRulesRequestsSlice,
    modalsSlice,
    offlineRequestManagerSlice,
    onboardingSlice,
    onboardingRequestsSlice,
    preferencesSlice,
    preferencesRequestsSlice,
    recurringTransactionsSlice,
    recurringTransactionsRequestsSlice,
    routerExtensionSlice,
    serviceWorkerSlice,
    toastsSlice,
    transactionsSlice,
    transactionsDateIndexSlice,
    transactionsRequestsSlice,
    transactionsImportSlice,
    transactionsImportRequestsSlice,
    transactionsIndexSlice,
    unhandledErrorsSlice,
    userSlice,
    userOfflineRequestsSlice,
    userRequestsSlice,
    virtualTransactionsSlice
};

export {
    slices,
    accountsSlice,
    accountsRequestsSlice,
    appSlice,
    authRequestsSlice,
    billingRequestsSlice,
    encryptionSlice,
    featureFlagsSlice,
    feedbackRequestsSlice,
    fileDownloadSlice,
    importProfilesSlice,
    importProfilesRequestsSlice,
    importProfileMappingsSlice,
    importRuleActionsSlice,
    importRuleConditionsSlice,
    importRulesSlice,
    importRulesRequestsSlice,
    modalsSlice,
    offlineRequestManagerSlice,
    onboardingSlice,
    onboardingRequestsSlice,
    preferencesSlice,
    preferencesRequestsSlice,
    recurringTransactionsSlice,
    recurringTransactionsRequestsSlice,
    routerExtensionSlice,
    serviceWorkerSlice,
    toastsSlice,
    transactionsSlice,
    transactionsDateIndexSlice,
    transactionsRequestsSlice,
    transactionsImportSlice,
    transactionsImportRequestsSlice,
    transactionsIndexSlice,
    unhandledErrorsSlice,
    userSlice,
    userOfflineRequestsSlice,
    userRequestsSlice,
    virtualTransactionsSlice
};
