import type {Meta, StoryObj} from "@storybook/react";
import {Account} from "models/";
import {PureComponent as TransactionsSummary} from "./TransactionsSummary";

const meta: Meta<typeof TransactionsSummary> = {
    title: "Organisms/Transactions Summary",
    component: TransactionsSummary,
    args: {
        expenseAccounts: [
            new Account({name: "Food", balance: 120000}),
            new Account({name: "Video Games", balance: 60000}),
            new Account({name: "Subscriptions", balance: 30000}),
            new Account({name: "Groceries", balance: 15000}),
            new Account({name: "Electronics", balance: 15000})
        ],
        incomeAccounts: [
            new Account({name: "Salary", balance: 150000}),
            new Account({name: "Other Income", balance: 50000}),
            new Account({name: "Interest", balance: 10000})
        ],
        cashFlow: -30000
    }
};

export default meta;
type Story = StoryObj<typeof TransactionsSummary>;

/** The default view of `TransactionsSummary`. */
export const Default: Story = {};
