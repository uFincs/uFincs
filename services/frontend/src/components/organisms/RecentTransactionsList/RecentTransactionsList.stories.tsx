import React from "react";
import {storyData, storyUsingRedux, useCreateAccounts, useCreateTransactions} from "utils/stories";
import {PureComponent as RecentTransactionsList} from "./RecentTransactionsList";

export default {
    title: "Organisms/Recent Transactions List",
    component: RecentTransactionsList
};

const {accounts, transactions} = storyData;

/** The default view of `RecentTransactionsList`. */
export const Default = storyUsingRedux(() => {
    useCreateAccounts(accounts);
    useCreateTransactions(transactions);

    return <RecentTransactionsList transactions={transactions} />;
});
