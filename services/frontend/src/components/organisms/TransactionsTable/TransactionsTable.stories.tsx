import {actions} from "@storybook/addon-actions";
import type {Meta} from "@storybook/react";
import {PaginationProvider, SelectableListProvider} from "hooks/";
import {Transaction} from "models/";
import {storyData, storyUsingRedux, useCreateAccounts, useCreateTransactions} from "utils/stories";
import TransactionsTable from "./TransactionsTable";

const meta: Meta<typeof TransactionsTable> = {
    title: "Organisms/Transactions Table",
    component: TransactionsTable
};

export default meta;

const {accounts, transactions} = storyData;

const useMakeFunctional = (transactions: Array<Transaction>, multiplier: number = 1) => {
    useCreateAccounts(accounts);
    useCreateTransactions(transactions, multiplier);

    return transactions;
};

const tableActions = actions("onAddTransaction");

/** The default view of the `TransactionsTable`. */
export const Default = storyUsingRedux(() => {
    const storeTransactions = useMakeFunctional(transactions);

    return (
        // The table must be always be wrapped in a PaginationProvider since it has the
        // keyboard navigation for pagination.
        <PaginationProvider totalItems={storeTransactions.length}>
            <TransactionsTable transactions={storeTransactions} {...tableActions} />
        </PaginationProvider>
    );
});

/** The `TransactionsTable` with the running balances enabled. */
export const WithRunningBalances = storyUsingRedux(() => {
    const storeTransactions = useMakeFunctional(transactions);

    return (
        <PaginationProvider totalItems={storeTransactions.length}>
            <TransactionsTable
                account={storyData.accounts[0]}
                accountStartingBalance={100000}
                transactions={storeTransactions}
                {...tableActions}
            />
        </PaginationProvider>
    );
});

/** The `TransactionsTable` with selectable rows. */
export const WithSelectableRows = storyUsingRedux(() => {
    const storeTransactions = useMakeFunctional(transactions);

    return (
        <SelectableListProvider>
            <PaginationProvider totalItems={storeTransactions.length}>
                <TransactionsTable
                    account={storyData.accounts[0]}
                    accountStartingBalance={100000}
                    transactions={storeTransactions}
                    {...tableActions}
                />
            </PaginationProvider>
        </SelectableListProvider>
    );
});

/** The `TransactionsTable` showing 'recurring' transactions. Just changes some display elements. */
export const WithRecurringTransactions = storyUsingRedux(() => {
    const storeTransactions = useMakeFunctional(transactions);

    return (
        <PaginationProvider totalItems={storeTransactions.length}>
            <TransactionsTable
                isRecurringTransactions={true}
                transactions={storeTransactions}
                {...tableActions}
            />
        </PaginationProvider>
    );
});

/** The empty view of the `TransactionsTable`. */
export const Empty = storyUsingRedux(() => {
    const storeTransactions = useMakeFunctional([]);

    return (
        <PaginationProvider totalItems={storeTransactions.length}>
            <TransactionsTable transactions={storeTransactions} {...tableActions} />
        </PaginationProvider>
    );
});

/** The compressed view of the `TransactionsTable`, where the From and To columns are
 *  compressed into the Description column. */
export const Compressed = storyUsingRedux(() => {
    const storeTransactions = useMakeFunctional(transactions);

    return (
        <PaginationProvider totalItems={storeTransactions.length}>
            <TransactionsTable transactions={storeTransactions} {...tableActions} />
        </PaginationProvider>
    );
});

Compressed.parameters = {
    viewport: {
        // Has 834px width.
        defaultViewport: "ipad10p"
    }
};

/** The full view of the `TransactionsTable`, where each piece of data gets its own column. */
export const Full = storyUsingRedux(() => {
    const storeTransactions = useMakeFunctional(transactions);

    return (
        <PaginationProvider totalItems={storeTransactions.length}>
            <TransactionsTable transactions={storeTransactions} {...tableActions} />
        </PaginationProvider>
    );
});

Full.parameters = {
    viewport: {
        // Has 1024px width.
        defaultViewport: "ipad12p"
    }
};
