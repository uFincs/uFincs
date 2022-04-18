import React from "react";
import {Account} from "models/";
import {PureComponent as TransactionsSummary} from "./TransactionsSummary";

export default {
    title: "Organisms/Transactions Summary",
    component: TransactionsSummary
};

const incomeAccounts = [
    new Account({name: "Salary", balance: 150000}),
    new Account({name: "Other Income", balance: 50000}),
    new Account({name: "Interest", balance: 10000})
];

const expenseAccounts = [
    new Account({name: "Food", balance: 120000}),
    new Account({name: "Video Games", balance: 60000}),
    new Account({name: "Subscriptions", balance: 30000}),
    new Account({name: "Groceries", balance: 15000}),
    new Account({name: "Electronics", balance: 15000})
];

/** The default view of `TransactionsSummary`. */
export const Default = () => (
    <TransactionsSummary
        expenseAccounts={expenseAccounts}
        incomeAccounts={incomeAccounts}
        cashFlow={-30000}
    />
);
