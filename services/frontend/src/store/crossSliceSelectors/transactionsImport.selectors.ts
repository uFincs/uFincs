import {createSelector} from "@reduxjs/toolkit";
import {
    Account,
    AccountData,
    ImportProfile,
    ImportableTransaction,
    ImportableTransactionData,
    Transaction,
    TransactionData,
    ImportRule
} from "models/";
import {accountsSlice, transactionsImportSlice} from "store/slices";
import objectReduce from "utils/objectReduce";
import {Id} from "utils/types";
import accountSelectors from "./account.selectors";
import importProfileSelectors from "./importProfile.selectors";
import importRuleSelectors from "./importRule.selectors";
import {idMap, idsMap} from "./utils";

/* Helper Functions */

const populateImportableTransactions = (
    transactionsById: Record<Id, ImportableTransactionData>,
    accountsById: Record<Id, AccountData>
) => objectReduce(transactionsById, ImportableTransaction.populateTransaction(accountsById));

const populateTransactions = (
    transactionsById: Record<Id, TransactionData>,
    accountsById: Record<Id, AccountData>
) => objectReduce(transactionsById, Transaction.populateTransaction(accountsById));

/* Selectors */

const selectActiveRules = createSelector(
    [
        transactionsImportSlice.selectors.selectActiveRuleIds,
        importRuleSelectors.selectImportRulesById
    ],
    idsMap<ImportRule>()
);

const selectAllTransactionsById = createSelector(
    [
        transactionsImportSlice.selectors.selectAllTransactions,
        accountsSlice.selectors.selectAccounts
    ],
    populateImportableTransactions
);

const selectTransaction = (id: Id) =>
    createSelector([selectAllTransactionsById], (byId) => idMap<ImportableTransaction>()(id, byId));

const selectTransactionsById = createSelector(
    [transactionsImportSlice.selectors.selectTransactions, accountsSlice.selectors.selectAccounts],
    populateImportableTransactions
);

const selectTransactions = createSelector([selectTransactionsById], (byId) => Object.values(byId));

const selectDuplicateTransactionsById = createSelector(
    [
        transactionsImportSlice.selectors.selectDuplicateTransactions,
        accountsSlice.selectors.selectAccounts
    ],
    populateImportableTransactions
);

const selectDuplicateTransactions = createSelector([selectDuplicateTransactionsById], (byId) =>
    Object.values(byId)
);

const selectCleanTransactionsById = createSelector(
    [
        transactionsImportSlice.selectors.selectCleanTransactions,
        accountsSlice.selectors.selectAccounts
    ],
    populateTransactions
);

const selectCleanTransactions = createSelector([selectCleanTransactionsById], (byId) =>
    Object.values(byId)
);

const selectCleanTransaction = (id: Id) =>
    createSelector([selectCleanTransactionsById], (byId) => idMap<Transaction>()(id, byId));

const selectAccount = createSelector(
    [transactionsImportSlice.selectors.selectAccountId, accountSelectors.selectAccountsById],
    idMap()
);

const selectAccountName = createSelector([selectAccount], (account) =>
    account ? account.name : ""
);

const selectAccountType = createSelector([selectAccount], (account) => account?.type);

const selectProfile = createSelector(
    [
        transactionsImportSlice.selectors.selectImportProfileId,
        importProfileSelectors.selectImportProfilesById
    ],
    idMap<ImportProfile>()
);

const selectProfileName = createSelector([selectProfile], (profile) =>
    profile ? profile.name : ""
);

const selectNetBalanceChange = createSelector(
    [selectAccount, selectCleanTransactions],
    Account.calculateBalanceChange
);

const transactionsImportSelectors = {
    selectAllTransactionsById,
    selectActiveRules,
    selectTransaction,
    selectTransactionsById,
    selectTransactions,
    selectCleanTransactionsById,
    selectCleanTransactions,
    selectCleanTransaction,
    selectDuplicateTransactionsById,
    selectDuplicateTransactions,
    selectAccount,
    selectAccountName,
    selectAccountType,
    selectProfile,
    selectProfileName,
    selectNetBalanceChange
};

export default transactionsImportSelectors;
