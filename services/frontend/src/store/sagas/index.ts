import {SagaMiddleware} from "redux-saga";

import accountsSaga from "./accounts.sagas";
import appSaga from "./app.sagas";
import authSaga from "./auth.sagas";
import billingSaga from "./billing.sagas";
import encryptionSaga from "./encryption.sagas";
import featureFlagsSaga from "./featureFlags.sagas";
import feedbackSaga from "./feedback.sagas";
import importProfilesSaga from "./importProfiles.sagas";
import importRulesSaga from "./importRules.sagas";
import offlineRequestManagerSaga from "./offlineRequestManager.sagas";
import onboardingSaga from "./onboarding.sagas";
import preferencesSaga from "./preferences.sagas";
import recurringTransactionsSaga from "./recurringTransactions.sagas";
import routerExtensionSaga from "./routerExtension.sagas";
import serviceWorkerSaga from "./serviceWorker.sagas";
import toastsSaga from "./toasts.sagas";
import transactionsSaga from "./transactions.sagas";
import transactionsDateIndexSaga from "./transactionsDateIndex.sagas";
import transactionsImportSaga from "./transactionsImport.sagas";
import transactionsIndexSaga from "./transactionsIndex.sagas";
import userSaga from "./user.sagas";
import virtualTransactionsSaga from "./virtualTransactions.sagas";

const sagas = [
    accountsSaga,
    appSaga,
    authSaga,
    billingSaga,
    encryptionSaga,
    featureFlagsSaga,
    feedbackSaga,
    importProfilesSaga,
    importRulesSaga,
    offlineRequestManagerSaga,
    onboardingSaga,
    preferencesSaga,
    recurringTransactionsSaga,
    routerExtensionSaga,
    serviceWorkerSaga,
    toastsSaga,
    transactionsSaga,
    transactionsDateIndexSaga,
    transactionsImportSaga,
    transactionsIndexSaga,
    userSaga,
    virtualTransactionsSaga
];

const registerSagas = (middleware: SagaMiddleware) => sagas.forEach((saga) => middleware.run(saga));

export default registerSagas;
