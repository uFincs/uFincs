import {Transaction} from "models/";
import InputValidation from "values/inputValidation";
import Account, {AccountOption, AccountType} from "./Account";

const assetAccountId = "1";
const liabilityAccountId = "2";
const incomeAccountId = "3";
const expenseAccountId = "4";

/* Transactions test data */

const expenseTransaction = new Transaction({
    id: "5",
    type: Transaction.EXPENSE,
    amount: 5000,
    creditAccountId: assetAccountId,
    debitAccountId: expenseAccountId
});

const incomeTransaction = new Transaction({
    id: "6",
    type: Transaction.INCOME,
    amount: 3750,
    creditAccountId: incomeAccountId,
    debitAccountId: assetAccountId
});

const debtTransaction = new Transaction({
    id: "7",
    type: Transaction.DEBT,
    amount: 2500,
    creditAccountId: liabilityAccountId,
    debitAccountId: expenseAccountId
});

const fromAssetTransferTransaction = new Transaction({
    id: "8",
    type: Transaction.TRANSFER,
    amount: 1000,
    creditAccountId: assetAccountId,
    debitAccountId: liabilityAccountId
});

const fromLiabilityTransferTransaction = new Transaction({
    id: "9",
    type: Transaction.TRANSFER,
    amount: 1000,
    creditAccountId: liabilityAccountId,
    debitAccountId: assetAccountId
});

const transactionsById = {
    [expenseTransaction.id]: expenseTransaction,
    [incomeTransaction.id]: incomeTransaction,
    [debtTransaction.id]: debtTransaction,
    [fromAssetTransferTransaction.id]: fromAssetTransferTransaction,
    [fromLiabilityTransferTransaction.id]: fromLiabilityTransferTransaction
};

const transactionIds = Object.keys(transactionsById);

const baseTransactions = [expenseTransaction, incomeTransaction, debtTransaction];

const allTransactions = [
    ...baseTransactions,
    fromAssetTransferTransaction,
    fromLiabilityTransferTransaction
];

// Transactions where the 'From' account (i.e. the credit account) is the Asset.
const transactionsWithFromAsset = [...baseTransactions, fromAssetTransferTransaction];

// Transactions where the 'From' account (i.e. the credit account) is the Liability.
const transactionsWithFromLiability = [...baseTransactions, fromLiabilityTransferTransaction];

/* Accounts test data */

const assetAccount = new Account({
    id: assetAccountId,
    type: Account.ASSET,
    openingBalance: 10000,
    transactionIds
});

const liabilityAccount = new Account({
    id: liabilityAccountId,
    type: Account.LIABILITY,
    openingBalance: 50000,
    transactionIds
});

const incomeAccount = new Account({
    id: incomeAccountId,
    type: Account.INCOME,
    openingBalance: 0,
    transactionIds
});

const expenseAccount = new Account({
    id: expenseAccountId,
    type: Account.EXPENSE,
    openingBalance: 0,
    transactionIds
});

const assetFromBalance =
    assetAccount.openingBalance +
    incomeTransaction.amount -
    expenseTransaction.amount -
    fromAssetTransferTransaction.amount;

const assetToBalance =
    assetAccount.openingBalance +
    incomeTransaction.amount -
    expenseTransaction.amount +
    fromLiabilityTransferTransaction.amount;

const liabilityToBalance =
    liabilityAccount.openingBalance + debtTransaction.amount - fromAssetTransferTransaction.amount;

const liabilityFromBalance =
    liabilityAccount.openingBalance +
    debtTransaction.amount +
    fromLiabilityTransferTransaction.amount;

const incomeBalance = incomeAccount.openingBalance + incomeTransaction.amount;

const expenseBalance =
    expenseAccount.openingBalance + expenseTransaction.amount + debtTransaction.amount;

const accountsById = {
    [assetAccount.id]: assetAccount,
    [liabilityAccount.id]: liabilityAccount,
    [incomeAccount.id]: incomeAccount,
    [expenseAccount.id]: expenseAccount
};

const accountsByType = {
    [AccountType.asset]: [assetAccount],
    [AccountType.liability]: [liabilityAccount],
    [AccountType.income]: [incomeAccount],
    [AccountType.expense]: [expenseAccount]
};

const moreAccountsByType = {
    [AccountType.asset]: [new Account({balance: 50}), new Account({balance: 50})],
    [AccountType.liability]: [
        new Account({balance: 100}),
        new Account({balance: 25}),
        new Account({balance: 25})
    ],
    [AccountType.income]: [new Account({balance: 50})],
    [AccountType.expense]: [new Account({balance: 5}), new Account({balance: 15})]
};

// Corresponds with balances in moreAccountsByType
const balancesByType = {
    [AccountType.asset]: 100,
    [AccountType.liability]: 150,
    [AccountType.income]: 50,
    [AccountType.expense]: 20
};

const netWorth = -50;

describe("Constructor", () => {
    it("converts string opening balances to integers", () => {
        const account = new Account({openingBalance: "123"});

        expect(account.openingBalance).toBe(123);
    });

    it("converts string interests to integers", () => {
        const account = new Account({interest: "123"});

        expect(account.interest).toBe(123);
    });
});

describe("validate", () => {
    const validAccount = new Account({
        id: "1",
        transactionIds: ["2"],
        name: "test",
        type: Account.ASSET,
        openingBalance: 0,
        interest: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        balance: 0,
        transactions: []
    });

    it("doesn't throw an error for a valid account", () => {
        expect(() => validAccount.validate()).not.toThrow();
    });

    it("checks for name existence", () => {
        const invalidAccount = new Account({...validAccount, name: ""});
        expect(() => invalidAccount.validate()).toThrow("name");
    });

    it("checks for type existence", () => {
        // @ts-expect-error Allow testing for invalid types.
        const invalidAccount = new Account({...validAccount, type: ""});
        expect(() => invalidAccount.validate()).toThrow("type");
    });

    it("checks for valid type", () => {
        // @ts-expect-error Allow testing for invalid types.
        const invalidAccount = new Account({...validAccount, type: "test"});
        expect(() => invalidAccount.validate()).toThrow("type");
    });

    describe("opening balance validity", () => {
        it("rejects opening balances that are null", () => {
            const invalidAccount = new Account({...validAccount});

            // @ts-expect-error Allow testing invalid values.
            invalidAccount.openingBalance = null;

            expect(() => invalidAccount.validate()).toThrow("opening balance");
        });

        it("rejects opening balances that are undefined", () => {
            const invalidAccount = new Account({...validAccount});

            // @ts-expect-error Allow testing invalid values.
            invalidAccount.openingBalance = undefined;

            expect(() => invalidAccount.validate()).toThrow("opening balance");
        });

        it("rejects opening balances that are not numbers", () => {
            const invalidAccount = new Account({...validAccount});

            // @ts-expect-error Allow testing invalid values.
            invalidAccount.openingBalance = "test";

            expect(() => invalidAccount.validate()).toThrow("opening balance");
        });

        it("rejects opening balances that are greater than the max allowed number", () => {
            const invalidAccount = new Account({...validAccount});
            invalidAccount.openingBalance = InputValidation.maxNumber + 1;

            expect(() => invalidAccount.validate()).toThrow("opening balance");
        });

        it("rejects opening balances that are negative", () => {
            const invalidAccount = new Account({...validAccount});
            invalidAccount.openingBalance = -100;

            expect(() => invalidAccount.validate()).toThrow("balance negative");
        });
    });

    describe("interest rate validity", () => {
        it("rejects interests that are null", () => {
            const invalidAccount = new Account({...validAccount});

            // @ts-expect-error Allow testing invalid values.
            invalidAccount.interest = null;

            expect(() => invalidAccount.validate()).toThrow("interest");
        });

        it("rejects interests that are undefined", () => {
            const invalidAccount = new Account({...validAccount});

            // @ts-expect-error Allow testing invalid values.
            invalidAccount.interest = undefined;

            expect(() => invalidAccount.validate()).toThrow("interest");
        });

        it("rejects interest that are not numbers", () => {
            const invalidAccount = new Account({...validAccount});

            // @ts-expect-error Allow testing invalid values.
            invalidAccount.interest = "test";

            expect(() => invalidAccount.validate()).toThrow("interest");
        });

        it("rejects interests that are greater than the max number", () => {
            const invalidAccount = new Account({...validAccount});
            invalidAccount.interest = InputValidation.maxNumber + 1;

            expect(() => invalidAccount.validate()).toThrow("interest");
        });

        it("rejects interests that are negative", () => {
            const invalidAccount = new Account({...validAccount});
            invalidAccount.interest = -100;

            expect(() => invalidAccount.validate()).toThrow("rate negative");
        });
    });
});

describe("populateAccount", () => {
    const originalAccountData = new Account(expenseAccount);

    const expectedAccount = new Account({
        ...expenseAccount,
        balance: expenseBalance,
        transactions: allTransactions
    });

    it("populates (merges) transaction data into an account's data", () => {
        expect(Account.populateAccount(transactionsById)(expenseAccount)).toEqual(expectedAccount);

        // Doesn't change original account data
        expect(expenseAccount).toEqual(originalAccountData);
    });
});

describe("calculateBalance", () => {
    // These tests assume that the transactions being passed to calculateBalance()
    // are in fact related to the account whose balance is being calculated
    // (i.e. it is implied that the account is either creditAccount or debitAccount on the transaction)...

    it("calculates balance for an asset account with a 'from asset' transfer", () => {
        expect(Account.calculateBalance(assetAccount, transactionsWithFromAsset)).toBe(
            assetFromBalance
        );
    });

    it("calculates balance for an asset account with a 'to asset' transfer", () => {
        expect(Account.calculateBalance(assetAccount, transactionsWithFromLiability)).toBe(
            assetToBalance
        );
    });

    it("calculates balance for a liability account with a 'to liability' transfer", () => {
        expect(Account.calculateBalance(liabilityAccount, transactionsWithFromAsset)).toBe(
            liabilityToBalance
        );
    });

    it("calculates balance for a liability account with a 'from liability' transfer", () => {
        expect(Account.calculateBalance(liabilityAccount, transactionsWithFromLiability)).toBe(
            liabilityFromBalance
        );
    });

    it("calculates balance for an income account", () => {
        expect(Account.calculateBalance(incomeAccount, transactionsWithFromAsset)).toBe(
            incomeBalance
        );

        expect(Account.calculateBalance(incomeAccount, transactionsWithFromLiability)).toBe(
            incomeBalance
        );
    });

    it("calculates balance for an expense account", () => {
        expect(Account.calculateBalance(expenseAccount, transactionsWithFromAsset)).toBe(
            expenseBalance
        );

        expect(Account.calculateBalance(expenseAccount, transactionsWithFromLiability)).toBe(
            expenseBalance
        );
    });

    it("ignores undefined transactions", () => {
        // @ts-expect-error Allow testing invalid values.
        expect(Account.calculateBalance(assetAccount, [undefined])).toBe(
            assetAccount.openingBalance
        );

        // @ts-expect-error Allow testing invalid values.
        expect(Account.calculateBalance(liabilityAccount, [undefined])).toBe(
            liabilityAccount.openingBalance
        );

        // @ts-expect-error Allow testing invalid values.
        expect(Account.calculateBalance(incomeAccount, [undefined])).toBe(
            incomeAccount.openingBalance
        );

        // @ts-expect-error Allow testing invalid values.
        expect(Account.calculateBalance(expenseAccount, [undefined])).toBe(
            expenseAccount.openingBalance
        );
    });
});

describe("calculateBalanceChange", () => {
    it("calculates balance for an asset account with a 'from asset' transfer", () => {
        expect(Account.calculateBalanceChange(assetAccount, transactionsWithFromAsset)).toBe(
            assetFromBalance - assetAccount.openingBalance
        );
    });

    it("calculates balance for an asset account with a 'to asset' transfer", () => {
        expect(Account.calculateBalanceChange(assetAccount, transactionsWithFromLiability)).toBe(
            assetToBalance - assetAccount.openingBalance
        );
    });

    it("calculates balance for a liability account with a 'to liability' transfer", () => {
        expect(Account.calculateBalanceChange(liabilityAccount, transactionsWithFromAsset)).toBe(
            liabilityToBalance - liabilityAccount.openingBalance
        );
    });

    it("calculates balance for a liability account with a 'from liability' transfer", () => {
        expect(
            Account.calculateBalanceChange(liabilityAccount, transactionsWithFromLiability)
        ).toBe(liabilityFromBalance - liabilityAccount.openingBalance);
    });

    it("calculates balance for an income account", () => {
        expect(Account.calculateBalanceChange(incomeAccount, transactionsWithFromAsset)).toBe(
            incomeBalance - incomeAccount.openingBalance
        );

        expect(Account.calculateBalanceChange(incomeAccount, transactionsWithFromLiability)).toBe(
            incomeBalance - incomeAccount.openingBalance
        );
    });

    it("calculates balance for an expense account", () => {
        expect(Account.calculateBalanceChange(expenseAccount, transactionsWithFromAsset)).toBe(
            expenseBalance - expenseAccount.openingBalance
        );

        expect(Account.calculateBalanceChange(expenseAccount, transactionsWithFromLiability)).toBe(
            expenseBalance - expenseAccount.openingBalance
        );
    });
});

describe("calculateAccountsBalanceChanges", () => {
    it("can calculate the changes in every account's balance", () => {
        const accountsWithBalanceChanges = Account.calculateAccountsBalanceChanges(
            accountsById,
            baseTransactions
        );

        expect(accountsWithBalanceChanges[assetAccountId].balance).toEqual(-1250);
        expect(accountsWithBalanceChanges[liabilityAccountId].balance).toEqual(2500);
        expect(accountsWithBalanceChanges[incomeAccountId].balance).toEqual(3750);
        expect(accountsWithBalanceChanges[expenseAccountId].balance).toEqual(7500);
    });

    it("works even when the account objects don't start with a balance property", () => {
        const accountsWithoutBalance = Object.keys(accountsById).reduce(
            (acc, id) => {
                const account = new Account({...accountsById[id]});

                // @ts-expect-error Allow removing balance.
                delete account.balance;

                acc[id] = account;
                return acc;
            },
            {} as typeof accountsById
        );

        const accountsWithBalanceChanges = Account.calculateAccountsBalanceChanges(
            accountsWithoutBalance,
            baseTransactions
        );

        expect(accountsWithBalanceChanges[assetAccountId].balance).toEqual(-1250);
        expect(accountsWithBalanceChanges[liabilityAccountId].balance).toEqual(2500);
        expect(accountsWithBalanceChanges[incomeAccountId].balance).toEqual(3750);
        expect(accountsWithBalanceChanges[expenseAccountId].balance).toEqual(7500);
    });
});

describe("calculateRunningBalances", () => {
    const account = new Account({type: Account.ASSET});
    const startingBalance = 1000;

    const transaction1 = new Transaction({
        date: "2020-08-01",
        amount: 1000,
        type: Transaction.INCOME
    });

    const transaction2 = new Transaction({
        date: "2020-08-02",
        amount: 2000,
        type: Transaction.EXPENSE
    });

    const transaction3 = new Transaction({
        date: "2020-08-03",
        amount: 3000,
        type: Transaction.INCOME
    });

    const unsortedTransactions = [transaction2, transaction3, transaction1];

    it("calculates the running balances", () => {
        const runningBalances = Account.calculateRunningBalances(
            unsortedTransactions,
            account,
            startingBalance
        );

        expect(runningBalances[transaction1.id]).toBe(2000);
        expect(runningBalances[transaction2.id]).toBe(0);
        expect(runningBalances[transaction3.id]).toBe(3000);
    });

    it("just returns an empty object when the startingBalance or account aren't passed", () => {
        expect(Account.calculateRunningBalances(unsortedTransactions, account, undefined)).toEqual(
            {}
        );

        expect(
            Account.calculateRunningBalances(unsortedTransactions, undefined, startingBalance)
        ).toEqual({});

        expect(
            Account.calculateRunningBalances(unsortedTransactions, undefined, undefined)
        ).toEqual({});
    });
});

describe("calculateNetWorth", () => {
    it("calculates the net worth given a set of accounts", () => {
        expect(Account.calculateNetWorth(balancesByType)).toEqual(netWorth);
    });
});

describe("categorizeByType", () => {
    it("categorizes accounts by their type", () => {
        expect(Account.categorizeByType(accountsById)).toEqual(accountsByType);
    });
});

describe("sumByType", () => {
    it("sums each account's balance for each type", () => {
        expect(Account.sumByType(moreAccountsByType)).toEqual(balancesByType);
    });
});

describe("generateAccountOptions", () => {
    const accountA = new Account({name: "a"});
    const accountB = new Account({name: "b"});
    const accountC = new Account({name: "c"});

    const accountsByType = {
        [AccountType.asset]: [accountB, accountA, accountC],
        [AccountType.liability]: [accountA, accountB],
        [AccountType.income]: [accountC, accountA],
        [AccountType.expense]: [accountB]
    };

    const expectOptionToEqualAccount = (option: AccountOption, account: Account) => {
        expect(option.label).toEqual(account.name);
        expect(option.value).toEqual(account.id);
    };

    it("can take a type to get a set of sorted account options for a dropdown", () => {
        const options = Account.generateAccountOptions([Account.ASSET], accountsByType);

        expectOptionToEqualAccount(options[0], accountA);
        expectOptionToEqualAccount(options[1], accountB);
        expectOptionToEqualAccount(options[2], accountC);
    });

    it("can take multiples to get a set of sorted account options for a dropdown", () => {
        const options = Account.generateAccountOptions(
            [Account.ASSET, Account.LIABILITY],
            accountsByType
        );

        expectOptionToEqualAccount(options[0], accountA);
        expectOptionToEqualAccount(options[1], accountA);
        expectOptionToEqualAccount(options[2], accountB);
        expectOptionToEqualAccount(options[3], accountB);
        expectOptionToEqualAccount(options[4], accountC);
    });

    it("throws an error if it isn't passed an array for 'types'", () => {
        // @ts-expect-error Allow testing invalid values.
        expect(() => Account.generateAccountOptions(Account.ASSET, accountsByType)).toThrow();
    });
});

describe("balanceSortDesc", () => {
    const highAccount = new Account({balance: 64000});
    const mediumAccount = new Account({balance: 20000});
    const lowAccount = new Account({balance: 1000});

    it("returns a negative number when the first account has more money", () => {
        expect(Account.balanceSortDesc(highAccount, lowAccount)).toBeLessThan(0);
    });

    it("returns a positive number when the first account has less money", () => {
        expect(Account.balanceSortDesc(lowAccount, highAccount)).toBeGreaterThan(0);
    });

    it("can be used to sort arrays of accounts descending by balance", () => {
        const unorderedAccounts = [mediumAccount, highAccount, lowAccount];
        const orderedAccounts = [highAccount, mediumAccount, lowAccount];

        expect(unorderedAccounts.sort(Account.balanceSortDesc)).toEqual(orderedAccounts);
    });
});

describe("netWorthReducer", () => {
    const asset = new Account({type: Account.ASSET});
    const liability = new Account({type: Account.LIABILITY});

    const income = new Transaction({type: Transaction.INCOME, amount: 1000});
    const expense = new Transaction({type: Transaction.EXPENSE, amount: 2000});
    const debt = new Transaction({type: Transaction.DEBT, amount: 3000});

    const transferAssetToAsset = new Transaction({
        type: Transaction.TRANSFER,
        creditAccount: asset,
        debitAccount: asset,
        amount: 1000
    });

    const transferAssetToLiability = new Transaction({
        type: Transaction.TRANSFER,
        creditAccount: asset,
        debitAccount: liability,
        amount: 1000
    });

    const transferLiabilityToAsset = new Transaction({
        type: Transaction.TRANSFER,
        creditAccount: liability,
        debitAccount: asset,
        amount: 1000
    });

    const transferLiabilityToLiability = new Transaction({
        type: Transaction.TRANSFER,
        creditAccount: liability,
        debitAccount: liability,
        amount: 1000
    });

    const transferTransactions = [
        transferAssetToAsset,
        transferAssetToLiability,
        transferLiabilityToAsset,
        transferLiabilityToLiability
    ];

    const allTransactions = [income, expense, debt, ...transferTransactions];

    const startingNetWorth = 10000;

    it("increases net worth with income transactions", () => {
        expect(Account.netWorthReducer(startingNetWorth, income)).toBe(11000);
    });

    it("decreases net worth with expense transactions", () => {
        expect(Account.netWorthReducer(startingNetWorth, expense)).toBe(8000);
    });

    it("decreases net worth with debt transactions", () => {
        expect(Account.netWorthReducer(startingNetWorth, debt)).toBe(7000);
    });

    it("doesn't do anything with transfer transactions", () => {
        expect(transferTransactions.reduce(Account.netWorthReducer, startingNetWorth)).toBe(
            startingNetWorth
        );
    });

    it("can reducer over an array of transactions to calculate net worth", () => {
        expect(allTransactions.reduce(Account.netWorthReducer, startingNetWorth)).toBe(6000);
    });
});
