import type {Meta} from "@storybook/react";
import {DateRangeProvider, TransactionTypesProvider} from "hooks/";
import {Transaction} from "models/";
import {DateService} from "services/";
import {smallViewport, storyUsingRedux, useCreateTransactions} from "utils/stories";
import TransactionTypeFilters from "./TransactionTypeFilters";

const meta: Meta<typeof TransactionTypeFilters> = {
    title: "Organisms/Transaction Type Filters",
    component: TransactionTypeFilters
};

export default meta;

const WrappedTransactionTypeFilters = (props: any) => (
    <DateRangeProvider>
        <TransactionTypesProvider>
            <TransactionTypeFilters {...props} />
        </TransactionTypesProvider>
    </DateRangeProvider>
);

// Because the default Date Range is 'Monthly', and we don't want to make these stories
// any more complicated than they have to be, we're just creating a set of transactions
// for the current month and the last month for demonstration purposes.
const currentMonth = DateService.getCurrentMonth();
const lastMonth = DateService.subtractMonth(currentMonth);

const currentMonthTransactions = [
    new Transaction({amount: 150000, date: currentMonth, type: Transaction.INCOME}),
    new Transaction({amount: 32000, date: currentMonth, type: Transaction.EXPENSE}),
    new Transaction({amount: 4000, date: currentMonth, type: Transaction.DEBT}),
    new Transaction({amount: 89000, date: currentMonth, type: Transaction.TRANSFER})
];

const lastMonthTransactions = [
    new Transaction({amount: 140000, date: lastMonth, type: Transaction.INCOME}),
    new Transaction({amount: 30000, date: lastMonth, type: Transaction.EXPENSE}),
    new Transaction({amount: 60500, date: lastMonth, type: Transaction.DEBT}),
    new Transaction({amount: 90000, date: lastMonth, type: Transaction.TRANSFER})
];

/** The default view of `TransactionTypeFilters`. */
export const Default = storyUsingRedux(() => {
    useCreateTransactions(currentMonthTransactions);
    useCreateTransactions(lastMonthTransactions);

    return <WrappedTransactionTypeFilters />;
});

/** The small view of `TransactionTypeFilters`. */
export const Small = storyUsingRedux(() => {
    useCreateTransactions(currentMonthTransactions);
    useCreateTransactions(lastMonthTransactions);

    return <WrappedTransactionTypeFilters style={{width: "100%"}} />;
});

Small.parameters = smallViewport;
