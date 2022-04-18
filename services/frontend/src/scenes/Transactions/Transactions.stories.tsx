import React from "react";
import {DateRangeProvider, PaginationProvider, TransactionTypesProvider} from "hooks/";
import {Transaction} from "models/";
import {
    smallViewport,
    smallLandscapeViewport,
    storyData,
    storyUsingRedux,
    useCreateAccounts,
    useCreateTransactions
} from "utils/stories";
import Transactions, {PureComponent as PureTransactions} from "./Transactions";

// Note: All of the stories that use the PureTransactions are there for testing with manually
// injected transactions that _aren't_ filtered by date range.
//
// Only the 'connected' stories use date range filtering.

export default {
    title: "Scenes/Transactions",
    component: PureTransactions
};

const {accounts, transactions} = storyData;

const WrappedPureTransactions = (props: any) => (
    <DateRangeProvider>
        <TransactionTypesProvider>
            <PaginationProvider totalItems={props.transactions.length}>
                <PureTransactions {...props} />
            </PaginationProvider>
        </TransactionTypesProvider>
    </DateRangeProvider>
);

const WrappedTransactions = () => (
    <DateRangeProvider>
        <Transactions />
    </DateRangeProvider>
);

const useMakeFunctional = (transactions: Array<Transaction>, multiplier: number = 1) => {
    useCreateAccounts(accounts);
    useCreateTransactions(transactions, multiplier);

    return transactions;
};

/** The default view of the `Transactions` scene with just a handful of transactions. */
export const Default = storyUsingRedux(() => {
    const storeTransactions = useMakeFunctional(transactions);
    return <WrappedPureTransactions transactions={storeTransactions} />;
});

/** The `Transactions` scene without any transactions. The Pagination should be hidden. */
export const Empty = storyUsingRedux(() => {
    const storeTransactions = useMakeFunctional([]);
    return <WrappedPureTransactions transactions={storeTransactions} />;
});

/** The `Transactions` scene with a lot of transactions to test out pagination. */
export const Paginated = storyUsingRedux(() => {
    const storeTransactions = useMakeFunctional(transactions, 20);
    return <WrappedPureTransactions transactions={storeTransactions} />;
});

/** The small view of the `Transactions` scene. */
export const Small = storyUsingRedux(() => {
    const storeTransactions = useMakeFunctional(transactions);
    return <WrappedPureTransactions transactions={storeTransactions} />;
});

Small.parameters = smallViewport;

/** The small landscape view of the `Transactions` scene. */
export const SmallLandscape = storyUsingRedux(() => {
    const storeTransactions = useMakeFunctional(transactions);
    return <WrappedPureTransactions transactions={storeTransactions} />;
});

SmallLandscape.parameters = smallLandscapeViewport;

/** A test of the fully connected `Transactions` scene. */
export const Connected = storyUsingRedux(() => {
    useMakeFunctional(transactions);
    return <WrappedTransactions />;
});

/** A test of the fully connected `Transactions` with no transactions. */
export const ConnectedEmpty = storyUsingRedux(() => {
    useMakeFunctional([]);
    return <WrappedTransactions />;
});
