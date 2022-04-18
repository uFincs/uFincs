import {Transaction} from "models/";
import {ValueFormatting} from "services/";

export const transactionTypeOptions = [
    {
        label: ValueFormatting.capitalizeString(Transaction.INCOME),
        title: "Income is for money you earn. Things like salary, tips, and gifts.",
        value: Transaction.INCOME
    },
    {
        label: ValueFormatting.capitalizeString(Transaction.EXPENSE),
        title: "Expenses are for money you spend. Things like bills, groceries, and your hobbies.",
        value: Transaction.EXPENSE
    },
    {
        label: ValueFormatting.capitalizeString(Transaction.DEBT),
        title: "Debts are expenses you pay later. Anything you throw on your credit, that's a debt.",
        value: Transaction.DEBT
    },
    {
        label: ValueFormatting.capitalizeString(Transaction.TRANSFER),
        title:
            "Transfers are for moving money between Assets and Liabilities. " +
            "Things like putting money into savings or paying down your credit card.",
        value: Transaction.TRANSFER
    }
];
