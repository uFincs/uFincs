import {actions} from "@storybook/addon-actions";
import {Meta} from "@storybook/react";
import {PaginationSwitcher} from "components/molecules";
import {PaginationProvider} from "hooks/";
import {Transaction} from "models/";
import {
    smallViewport,
    smallLandscapeViewport,
    storyData,
    storyUsingRedux,
    useCreateAccounts,
    useCreateTransactions
} from "utils/stories";
import TransactionsList from "./TransactionsList";

const meta: Meta<typeof TransactionsList> = {
    title: "Organisms/Transactions List",
    component: TransactionsList
};

export default meta;

const listActions = actions("onAddTransaction");

const {accounts, transactions} = storyData;

// Dispatches the account and transaction data to the store so that the Connected component
// can work.
//
// Exported for reuse by the Transactions scene.
//
// Note: Even though the Connected TransactionsList doesn't pull transactions from the store,
// the underlying TransactionsListItems _do_. That's why the transactions need to be in the store
// for the list to work.
//
// @param transactions  The transactions to put in the store.
// @param multiplier    How many times to duplicate each transaction in the store.
//                      Used for testing pagination.
const useMakeFunctional = (transactions: Array<Transaction>, multiplier: number = 1) => {
    useCreateAccounts(accounts);
    useCreateTransactions(transactions, multiplier);

    return transactions;
};

/** The default view of the `TransactionsList`. */
export const Default = storyUsingRedux(() => {
    const storeTransactions = useMakeFunctional(transactions);
    return <TransactionsList transactions={storeTransactions} {...listActions} />;
});

/** The `TransactionsList` with running balances (end-of-day balances) enabled. */
export const WithRunningBalances = storyUsingRedux(() => {
    const storeTransactions = useMakeFunctional(transactions);

    return (
        <TransactionsList
            account={storyData.accounts[0]}
            accountStartingBalance={100000}
            transactions={storeTransactions}
            {...listActions}
        />
    );
});

/** The `TransactionsList` when there are no transactions at all. */
export const Empty = storyUsingRedux(() => {
    const storeTransactions = useMakeFunctional([]);
    return <TransactionsList transactions={storeTransactions} {...listActions} />;
});

/** The `TransactionsList` with a lot of transactions to test out pagination. */
export const Paginated = storyUsingRedux(() => {
    const storeTransactions = useMakeFunctional(transactions, 20);

    return (
        <PaginationProvider totalItems={storeTransactions.length}>
            <TransactionsList transactions={storeTransactions} {...listActions} />
            <PaginationSwitcher />
        </PaginationProvider>
    );
});

/** The small view of the `TransactionsList`. */
export const Small = storyUsingRedux(() => {
    const storeTransactions = useMakeFunctional(transactions);
    return <TransactionsList transactions={storeTransactions} {...listActions} />;
});

Small.parameters = smallViewport;

/** The small landscape view of the `TransactionsList`. */
export const SmallLandscape = storyUsingRedux(() => {
    const storeTransactions = useMakeFunctional(transactions);
    return <TransactionsList transactions={storeTransactions} {...listActions} />;
});

SmallLandscape.parameters = smallLandscapeViewport;
