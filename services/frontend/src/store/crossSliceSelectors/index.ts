import accountSelectors from "./account.selectors";
import importProfileSelectors from "./importProfile.selectors";
import importRuleSelectors from "./importRule.selectors";
import preferenceSelectors from "./preference.selectors";
import recurringTransactionSelectors from "./recurringTransaction.selectors";
import routerSelectors from "./router.selectors";
import transactionSelectors from "./transaction.selectors";
import transactionsDateIndexSelectors from "./transactionsDateIndex.selectors";
import transactionsImportSelectors from "./transactionsImport.selectors";
import userSelectors from "./user.selectors";
import virtualTransactionSelectors from "./virtualTransaction.selectors";

const crossSliceSelectors = {
    accounts: accountSelectors,
    importProfiles: importProfileSelectors,
    importRules: importRuleSelectors,
    preferences: preferenceSelectors,
    recurringTransactions: recurringTransactionSelectors,
    router: routerSelectors,
    transactions: transactionSelectors,
    transactionsDateIndex: transactionsDateIndexSelectors,
    transactionsImport: transactionsImportSelectors,
    user: userSelectors,
    virtualTransactions: virtualTransactionSelectors
};

export default crossSliceSelectors;
