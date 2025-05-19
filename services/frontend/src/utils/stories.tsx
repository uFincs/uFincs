import {JSX, useEffect, useState} from "react";
import * as React from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    Account,
    AccountType,
    ImportRule,
    ImportRuleAction,
    ImportRuleCondition,
    RecurringTransaction,
    Transaction
} from "models/";
import {DateService} from "services/";
import {
    accountsSlice,
    crossSliceSelectors,
    importRulesSlice,
    importRuleActionsSlice,
    importRuleConditionsSlice,
    recurringTransactionsSlice,
    transactionsSlice
} from "store/";

/* This file containers helper functions and whatnot for Storybook stories. */

/* Some Default Viewports */

export const smallViewport = {
    viewport: {
        defaultViewport: "iphone6"
    }
} as const;

export const smallLandscapeViewport = {
    viewport: {
        defaultViewport: "iphone6L"
    }
} as const;

/* Wrapper for enabling Redux in Stories */

// eslint-disable-next-line react-refresh/only-export-components
const StateResetWrapper = ({children}: {children: React.ReactNode}) => {
    const [mounted, setMounted] = useState(false);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!mounted) {
            dispatch({type: "RESET_STATE"});
            setMounted(true);
        }
    }, [dispatch, mounted]);

    return <>{mounted ? children : null}</>;
};

interface Story {
    (args: any): JSX.Element;

    // Need this so that we can do things like assign `.parameters` to the function.
    [key: string]: any;
}

// For some reason, it seems like you can't use react-redux hooks (or anything react-redux related)
// directly in a top-level story (i.e. in the story itself; using connected components is fine).
// It just complains that the `Provider` is missing.
//
// But if you wrap the 'story' up as a component and then invoke _that_ as a 'story', it works.
// /shrug
//
// So to use this, just pass your 'story' as the argument and assign the result as the 'story'.
//
// That is, `export const YourStory = storyUsingRedux(() => ...);`
export const storyUsingRedux =
    (Component: React.ComponentType<any>): Story =>
    (args) => (
        <StateResetWrapper>
            <Component {...args} />
        </StateResetWrapper>
    );

// Like the above, but just for enabling stories to use hooks.
// Doesn't need the `StateResetWrapper`.
export const storyUsingHooks =
    (Component: React.ComponentType<any>): Story =>
    (args) => <Component {...args} />;

/* Some Premade Mock Data for using in Stories */

const assetAccount = new Account({
    id: "1",
    name: "Chequing",
    type: Account.ASSET,
    openingBalance: 1234567
});

const liabilityAccount = new Account({id: "2", name: "Credit Card", type: Account.LIABILITY});
const incomeAccount = new Account({id: "3", name: "Salary", type: Account.INCOME});
const expenseAccount = new Account({id: "4", name: "Food", type: Account.EXPENSE});

const accounts = [assetAccount, liabilityAccount, incomeAccount, expenseAccount];

const accountsByType = {
    [Account.ASSET]: [assetAccount],
    [Account.LIABILITY]: [liabilityAccount],
    [Account.INCOME]: [incomeAccount],
    [Account.EXPENSE]: [expenseAccount]
} as Record<AccountType, Array<Account>>;

const transactions = [
    new Transaction({
        id: "1",
        amount: 12345,
        date: "2020-07-07",
        description: "Made money",
        notes: "These are notes",
        type: Transaction.INCOME,
        creditAccount: incomeAccount,
        creditAccountId: incomeAccount.id,
        debitAccount: assetAccount,
        debitAccountId: assetAccount.id
    }),
    new Transaction({
        id: "2",
        amount: 10000,
        date: "2020-07-07",
        description: "Spent money",
        type: Transaction.EXPENSE,
        creditAccount: assetAccount,
        creditAccountId: assetAccount.id,
        debitAccount: expenseAccount,
        debitAccountId: expenseAccount.id
    }),
    new Transaction({
        id: "3",
        amount: 54321,
        date: "2020-07-06",
        description: "Took debt",
        type: Transaction.DEBT,
        creditAccount: liabilityAccount,
        creditAccountId: liabilityAccount.id,
        debitAccount: expenseAccount,
        debitAccountId: expenseAccount.id
    }),
    new Transaction({
        id: "4",
        amount: 123,
        date: "2020-07-03",
        description: "Paid debt",
        type: Transaction.TRANSFER,
        creditAccount: assetAccount,
        creditAccountId: assetAccount.id,
        debitAccount: liabilityAccount,
        debitAccountId: liabilityAccount.id
    })
];

const recurringTransactions = [
    new RecurringTransaction({
        id: "5",
        amount: 12345,
        description: "Made money",
        notes: "These are notes",
        type: Transaction.INCOME,
        creditAccount: incomeAccount,
        creditAccountId: incomeAccount.id,
        debitAccount: assetAccount,
        debitAccountId: assetAccount.id,
        interval: 2,
        freq: RecurringTransaction.FREQUENCIES.weekly,
        on: 2,
        startDate: "2020-07-07",
        count: 2
    }),
    new RecurringTransaction({
        id: "6",
        amount: 10000,
        description: "Spent money",
        type: Transaction.EXPENSE,
        creditAccount: assetAccount,
        creditAccountId: assetAccount.id,
        debitAccount: expenseAccount,
        debitAccountId: expenseAccount.id,
        interval: 4,
        freq: RecurringTransaction.FREQUENCIES.daily,
        on: 0,
        startDate: "2020-07-07",
        endDate: "2021-07-07"
    }),
    new RecurringTransaction({
        id: "7",
        amount: 54321,
        description: "Took debt",
        type: Transaction.DEBT,
        creditAccount: liabilityAccount,
        creditAccountId: liabilityAccount.id,
        debitAccount: expenseAccount,
        debitAccountId: expenseAccount.id,
        interval: 1,
        freq: RecurringTransaction.FREQUENCIES.yearly,
        on: 123,
        startDate: "2020-07-06",
        neverEnds: true
    }),
    new RecurringTransaction({
        id: "8",
        amount: 123,
        description: "Paid debt",
        type: Transaction.TRANSFER,
        creditAccount: assetAccount,
        creditAccountId: assetAccount.id,
        debitAccount: liabilityAccount,
        debitAccountId: liabilityAccount.id,
        interval: 1,
        freq: RecurringTransaction.FREQUENCIES.monthly,
        on: 15,
        startDate: "2020-07-03",
        neverEnds: true
    })
];

const importRules = [
    new ImportRule({id: "1", importRuleActionIds: ["1"], importRuleConditionIds: ["1"]}),
    new ImportRule({id: "2", importRuleActionIds: ["2", "3"], importRuleConditionIds: ["2", "3"]})
];

const importRuleActions = [
    new ImportRuleAction({
        id: "1",
        importRuleId: "1",
        property: ImportRuleAction.PROPERTY_DESCRIPTION,
        value: "New Description"
    }),
    new ImportRuleAction({
        id: "2",
        importRuleId: "2",
        property: ImportRuleAction.PROPERTY_ACCOUNT,
        value: "New Account"
    }),
    new ImportRuleAction({
        id: "3",
        importRuleId: "2",
        property: ImportRuleAction.PROPERTY_DESCRIPTION,
        value: "New Description 2"
    })
];

const importRuleConditions = [
    new ImportRuleCondition({
        id: "1",
        importRuleId: "1",
        condition: ImportRuleCondition.CONDITION_CONTAINS,
        property: ImportRuleCondition.PROPERTY_DESCRIPTION,
        value: "Old Description"
    }),
    new ImportRuleCondition({
        id: "2",
        importRuleId: "2",
        condition: ImportRuleCondition.CONDITION_CONTAINS,
        property: ImportRuleCondition.PROPERTY_ACCOUNT,
        value: "Old Account"
    }),
    new ImportRuleCondition({
        id: "3",
        importRuleId: "2",
        condition: ImportRuleCondition.CONDITION_MATCHES,
        property: ImportRuleCondition.PROPERTY_DESCRIPTION,
        value: "Old Description 2"
    })
];

const rawChartData = [
    {amount: 1900, date: "2020-06-01T00:00:00.000Z"},
    {amount: 2700, date: "2020-06-02T00:00:00.000Z"},
    {amount: 1800, date: "2020-07-02T00:00:00.000Z"},
    {amount: 800, date: "2020-07-01T00:00:00.000Z"},
    {amount: 2700, date: "2020-07-03T00:00:00.000Z"},
    {amount: 9400, date: "2019-06-01T00:00:00.000Z"},
    {amount: 1900, date: "2020-05-01T00:00:00.000Z"},
    {amount: 7600, date: "2019-08-03T00:00:00.000Z"},
    {amount: 800, date: "2019-08-01T00:00:00.000Z"}
];

const chartData = rawChartData.map(({amount, date}) => ({
    amount,
    date: DateService.createUTCDate(date)
}));

export const storyData = {
    accounts,
    accountsByType,
    chartData,
    importRules,
    importRuleActions,
    importRuleConditions,
    recurringTransactions,
    transactions
};

export const multiplyTransactions = (transactions: Array<Transaction> = [], multiplier = 1) => {
    if (multiplier === 1) {
        // Don't want the IDs to be random when not multiplying the transactions.
        return transactions;
    } else {
        return transactions.reduce<Array<Transaction>>((acc, transaction) => {
            const multipliedTransactions = [...Array(multiplier)].map(
                () =>
                    new Transaction({
                        ...transaction,
                        id: Math.random().toString()
                    })
            );

            return acc.concat(multipliedTransactions);
        }, []);
    }
};

/* Custom Redux Hooks for Stories */

export const useCreateAccounts = (accounts: Array<Account>) => {
    const dispatch = useDispatch();

    useEffect(() => {
        for (const account of accounts) {
            dispatch(accountsSlice.actions.add(account));
        }
    }, [dispatch, accounts]);

    return accounts;
};

export const useCreateTransactions = (transactions: Array<Transaction>, multiplier = 1) => {
    const dispatch = useDispatch();

    useEffect(() => {
        for (const transaction of multiplyTransactions(transactions, multiplier)) {
            dispatch(transactionsSlice.actions.add(transaction));
        }
    }, [dispatch, transactions, multiplier]);

    return transactions;
};

export const useCreateRecurringTransactions = (
    recurringTransactions: Array<RecurringTransaction>
) => {
    const dispatch = useDispatch();

    useEffect(() => {
        for (const recurringTransaction of recurringTransactions) {
            dispatch(recurringTransactionsSlice.actions.add(recurringTransaction));
        }
    }, [dispatch, recurringTransactions]);

    return recurringTransactions;
};

export const useCreateImportRules = (
    rules: Array<ImportRule> = importRules,
    actions: Array<ImportRuleAction> = importRuleActions,
    conditions: Array<ImportRuleCondition> = importRuleConditions
) => {
    const dispatch = useDispatch();

    useEffect(() => {
        for (const rule of rules) {
            dispatch(importRulesSlice.actions.add(rule));
        }

        for (const action of actions) {
            dispatch(importRuleActionsSlice.actions.add(action));
        }

        for (const condition of conditions) {
            dispatch(importRuleConditionsSlice.actions.add(condition));
        }
    }, [dispatch, rules, actions, conditions]);

    // Because the rules in the storyData are unpopulated, we need to query them
    // to get the populated versions for things like editing in the ImportRuleForm to work.
    const populatedRules = useSelector(crossSliceSelectors.importRules.selectImportRules);

    return populatedRules;
};
