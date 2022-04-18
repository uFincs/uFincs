import {createSelector} from "@reduxjs/toolkit";
import createCachedSelector from "re-reselect";
import {Account} from "models/";
import {accountsSlice} from "store/slices";
import objectReduce from "utils/objectReduce";
import {Id} from "utils/types";
import transactionSelectors from "./transaction.selectors";

const selectAccountsById = createSelector(
    [accountsSlice.selectors.selectAccounts, transactionSelectors.selectTransactionsById],
    (accountsById, transactionsById) =>
        objectReduce(accountsById, Account.populateAccount(transactionsById))
);

const selectAccount = (id: Id) =>
    createSelector(
        [accountsSlice.selectors.selectAccounts, transactionSelectors.selectTransactionsById],
        (accountsById, transactionsById) =>
            Account.populateAccount(transactionsById)(accountsById[id])
    );

const selectAccountsByType = createSelector(
    [accountsSlice.selectors.selectAccountsByType, transactionSelectors.selectTransactionsById],
    (accountsByType, transactionsById) =>
        objectReduce(accountsByType, (accounts) =>
            accounts.map(Account.populateAccount(transactionsById))
        )
);

const selectBalanceChanges = createCachedSelector(
    // Note: This uses unpopulated accountsById because it needs the balance to be 0 to calculate the
    // changes. Since populating an account calculates its balance, we can't use them for this.
    [accountsSlice.selectors.selectAccounts, transactionSelectors.selectTransactionsBetweenDates],
    Account.calculateAccountsBalanceChanges
)((_, startDate, endDate) => `${startDate}-${endDate}`);

const selectBalanceChangesByTypeBetweenDates = createCachedSelector(
    [selectBalanceChanges],
    (balanceChanges) => Account.sumByType(Account.categorizeByType(balanceChanges))
)((_, startDate, endDate) => `${startDate}-${endDate}`);

const selectOpeningBalancesByType = createSelector(
    [selectAccountsByType],
    Account.sumOpeningBalancesByType
);

const selectCurrentNetWorth = createCachedSelector(
    [selectBalanceChangesByTypeBetweenDates, selectOpeningBalancesByType],
    (balanceChangesByType, openingBalancesByType) => {
        const netOpeningBalances = Account.calculateNetWorth(openingBalancesByType);
        const netBalanceChange = Account.calculateNetWorth(balanceChangesByType);

        return netBalanceChange + netOpeningBalances;
    }
)((_, startDate, endDate) => `${startDate}-${endDate}`);

const selectAccountBetweenDates = createCachedSelector(
    [selectBalanceChanges, (_, __, ___, id: Id) => id],
    (accountsById, id) => {
        // Note: This account is _not_ populated with complete transactions.
        // This is because `selectBalanceChanges` doesn't use populated accounts,
        // because it needs the balances to be empty to start (since populating an account
        // also calculates its balance).
        //
        // For now, this is fine since the usage of this selector doesn't (yet) need them.
        //
        // Also, note that we have to 'cast' the raw store AccountData to an Account object,
        // so that we handle the case where the ID doesn't exist in the store.
        // This is normally handled by `populateAccount`.
        const account = new Account(accountsById[id]);
        account.balance += account.openingBalance;

        return account;
    }
)((_, startDate, endDate, id) => `${startDate}-${endDate}-${id}`);

const accountSelectors = {
    selectAccount,
    selectAccountsById,
    selectAccountsByType,
    selectBalanceChangesByTypeBetweenDates,
    selectOpeningBalancesByType,
    selectCurrentNetWorth,
    selectAccountBetweenDates
};

export default accountSelectors;
