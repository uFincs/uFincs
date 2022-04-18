import {Account, ImportProfile, ImportProfileMapping, Transaction} from "models/";
import mounts from "store/mountpoints";
import crossSliceSelectors from ".";

const creditAccount = new Account({
    id: "1",
    name: "creditAccount",
    type: Account.ASSET,
    openingBalance: 1000000,
    transactionIds: ["3", "4"]
});

const debitAccount = new Account({
    id: "2",
    name: "debitAccount",
    type: Account.EXPENSE,
    openingBalance: 0,
    transactionIds: ["3", "4"]
});

// Note: Only the first 3 transactions have descriptions because only those ones are used
// for testing the search selectors.
const transaction1 = new Transaction({
    id: "3",
    description: "Bought cheese",
    creditAccountId: creditAccount.id,
    debitAccountId: debitAccount.id,
    amount: 10000,
    type: Transaction.EXPENSE,
    date: new Date("2019-01-01").toString()
});

const transaction2 = new Transaction({
    id: "4",
    description: "Paid friend",
    creditAccountId: creditAccount.id,
    debitAccountId: debitAccount.id,
    amount: 100,
    type: Transaction.EXPENSE,
    date: new Date("2019-01-02").toString()
});

const transaction3 = new Transaction({
    id: "5",
    description: "Botched the deal",
    creditAccountId: creditAccount.id,
    debitAccountId: debitAccount.id,
    amount: 100,
    type: Transaction.EXPENSE,
    date: new Date("2019-01-04").toString(),
    createdAt: "2019-01-04 12:00:00"
});

const transaction4 = new Transaction({
    id: "6",
    creditAccountId: creditAccount.id,
    debitAccountId: debitAccount.id,
    amount: 100,
    type: Transaction.EXPENSE,
    date: new Date("2019-01-04").toString(),
    createdAt: "2019-01-04 12:12:12"
});

const transaction5 = new Transaction({
    id: "7",
    creditAccountId: creditAccount.id,
    debitAccountId: debitAccount.id,
    amount: 100,
    type: Transaction.EXPENSE,
    date: new Date("2019-01-05").toString()
});

const transaction6 = new Transaction({
    id: "8",
    creditAccountId: creditAccount.id,
    debitAccountId: debitAccount.id,
    amount: 100,
    type: Transaction.EXPENSE,
    date: new Date("2019-01-06").toString()
});

const transaction1WithAccount = new Transaction({...transaction1, creditAccount, debitAccount});
const transaction2WithAccount = new Transaction({...transaction2, creditAccount, debitAccount});
const transaction3WithAccount = new Transaction({...transaction3, creditAccount, debitAccount});

const mapping1 = new ImportProfileMapping();
const mapping2 = new ImportProfileMapping();

const importProfile1 = new ImportProfile({
    name: "profile1",
    importProfileMappingIds: [mapping1.id]
});
const importProfile2 = new ImportProfile({
    name: "profile2",
    importProfileMappingIds: [mapping2.id]
});

const bigramIndex = {
    bo: {[transaction1.id]: transaction1.id, [transaction3.id]: transaction3.id},
    pa: {[transaction2.id]: transaction2.id}
};

const wordIndex = {
    bought: {[transaction1.id]: transaction1.id},
    cheese: {[transaction1.id]: transaction1.id},
    paid: {[transaction2.id]: transaction2.id},
    friend: {[transaction2.id]: transaction2.id},
    botch: {[transaction3.id]: transaction3.id},
    deal: {[transaction3.id]: transaction3.id}
};

const wordBigramIndex = {
    bo: {bought: "bought", botch: "botch"},
    ch: {cheese: "cheese"},
    pa: {paid: "paid"},
    fr: {friend: "friend"},
    de: {deal: "deal"}
};

const state = {
    [mounts.accounts]: {
        [creditAccount.id]: creditAccount,
        [debitAccount.id]: debitAccount
    },
    [mounts.importProfiles]: {
        [importProfile1.id]: importProfile1,
        [importProfile2.id]: importProfile2
    },
    [mounts.importProfileMappings]: {
        [mapping1.id]: mapping1,
        [mapping2.id]: mapping2
    },
    [mounts.preferences]: {
        showFutureTransactions: true
    },
    [mounts.transactions]: {
        [transaction1.id]: transaction1,
        [transaction2.id]: transaction2
    },
    [mounts.transactionsImport]: {
        accountId: creditAccount.id,
        importProfileId: importProfile1.id
    },
    [mounts.transactionsIndex]: {
        byBigram: bigramIndex,
        byWord: wordIndex,
        byWordBigram: wordBigramIndex
    },
    [mounts.virtualTransactions]: {
        byId: {},
        byRecurringTransactionId: {}
    }
};

const largeState = {
    ...state,
    [mounts.accounts]: {
        [creditAccount.id]: creditAccount,
        [debitAccount.id]: debitAccount
    },
    [mounts.transactions]: {
        [transaction1.id]: transaction1,
        [transaction2.id]: transaction2,
        [transaction3.id]: transaction3,
        [transaction4.id]: transaction4,
        [transaction5.id]: transaction5,
        [transaction6.id]: transaction6
    }
};

const populatedTransaction1 = new Transaction({...transaction1, creditAccount, debitAccount});
const populatedTransaction2 = new Transaction({...transaction2, creditAccount, debitAccount});

const populatedCreditAccount = new Account({
    ...creditAccount,
    balance: creditAccount.openingBalance - transaction1.amount - transaction2.amount,
    transactions: [populatedTransaction1, populatedTransaction2]
});

const populatedDebitAccount = new Account({
    ...debitAccount,
    balance: debitAccount.openingBalance + transaction1.amount + transaction2.amount,
    transactions: [populatedTransaction1, populatedTransaction2]
});

const populatedImportProfile1 = new ImportProfile({
    ...importProfile1,
    importProfileMappings: [mapping1]
});
const populatedImportProfile2 = new ImportProfile({
    ...importProfile2,
    importProfileMappings: [mapping2]
});

describe("Transaction selectors", () => {
    describe("selectTransactionsById", () => {
        it("populates transactions with account data and returns an indexed object", () => {
            expect(crossSliceSelectors.transactions.selectTransactionsById(state)).toEqual({
                [populatedTransaction1.id]: populatedTransaction1,
                [populatedTransaction2.id]: populatedTransaction2
            });
        });
    });

    describe("selectTransactions", () => {
        it("populates transactions with account data", () => {
            expect(crossSliceSelectors.transactions.selectTransactions(state)).toEqual([
                transaction1WithAccount,
                transaction2WithAccount
            ]);
        });
    });

    describe("makeSearchTransactionsSelector", () => {
        const searchTransactions =
            crossSliceSelectors.transactions.makeSearchTransactionsSelector();

        it("can search based on the prefix bigram of the transaction descriptions", () => {
            const query = "bo";
            expect(searchTransactions(largeState, query)).toEqual([
                transaction3WithAccount,
                transaction1WithAccount
            ]);
        });

        it("can search based on the words in the transaction descriptions", () => {
            const query = "friend";
            expect(searchTransactions(largeState, query)).toEqual([transaction2WithAccount]);
        });

        it("can search based on multiple words in the description", () => {
            const query = "botc dea";
            expect(searchTransactions(largeState, query)).toEqual([transaction3WithAccount]);
        });

        it("doesn't return anything when the query contains unknown words", () => {
            const query = "cheese turtles";
            expect(searchTransactions(largeState, query)).toEqual([]);
        });
    });
});

describe("Account selectors", () => {
    describe("selectAccountsById", () => {
        it("populates the accounts into an indexed object", () => {
            expect(crossSliceSelectors.accounts.selectAccountsById(state)).toEqual({
                [populatedCreditAccount.id]: populatedCreditAccount,
                [populatedDebitAccount.id]: populatedDebitAccount
            });
        });
    });

    describe("selectAccountsByType", () => {
        it("populates the accounts with their computed balance value", () => {
            expect(crossSliceSelectors.accounts.selectAccountsByType(state)).toEqual({
                asset: [populatedCreditAccount],
                liability: [],
                income: [],
                expense: [populatedDebitAccount]
            });
        });
    });

    describe("selectAccount", () => {
        it("selects an account with full transaction + balance information", () => {
            expect(crossSliceSelectors.accounts.selectAccount(creditAccount.id)(state)).toEqual(
                populatedCreditAccount
            );
        });
    });
});

describe("Import Profile selectors", () => {
    describe("selectImportProfile", () => {
        it("selects an import profile by ID populated with associated mappings", () => {
            expect(
                crossSliceSelectors.importProfiles.selectImportProfile(importProfile1.id)(state)
            ).toEqual(populatedImportProfile1);
        });
    });

    describe("selectImportProfilesById", () => {
        it("can select all import profiles indexed by ID populated with mappings", () => {
            expect(crossSliceSelectors.importProfiles.selectImportProfilesById(state)).toEqual({
                [populatedImportProfile1.id]: populatedImportProfile1,
                [populatedImportProfile2.id]: populatedImportProfile2
            });
        });
    });

    describe("selectImportProfiles", () => {
        it("can select all import profiles as a list populated with mappings", () => {
            expect(crossSliceSelectors.importProfiles.selectImportProfiles(state)).toEqual([
                populatedImportProfile1,
                populatedImportProfile2
            ]);
        });
    });
});

describe("Transactions Import selectors", () => {
    describe("selectAccount", () => {
        it("can select the full account object for the transactions import", () => {
            const account = crossSliceSelectors.transactionsImport.selectAccount(state);

            // Zero out the properties that don't matter for testing purposes.
            account.balance = 0;
            account.transactions = [];

            expect(account).toMatchObject(creditAccount);
        });
    });

    describe("selectAccountName", () => {
        it("can select the account name for the transactions import", () => {
            expect(crossSliceSelectors.transactionsImport.selectAccountName(state)).toEqual(
                creditAccount.name
            );
        });
    });

    describe("selectProfile", () => {
        it("can select the full import profile object for the transactions import", () => {
            expect(crossSliceSelectors.transactionsImport.selectProfile(state)).toEqual(
                populatedImportProfile1
            );
        });
    });

    describe("selectProfileName", () => {
        it("can select the import profile name for the transactions import", () => {
            expect(crossSliceSelectors.transactionsImport.selectProfileName(state)).toEqual(
                importProfile1.name
            );
        });
    });
});
