import React from "react";
import {storyUsingRedux, storyData, useCreateAccounts} from "utils/stories";
import TransactionsImport from "./TransactionsImport";

export default {
    title: "Scenes/Transactions Import/All Steps",
    component: TransactionsImport
};

/** The connected view of `TransactionsImport`. */
export const Connected = storyUsingRedux(() => {
    useCreateAccounts(storyData.accounts);

    return <TransactionsImport />;
});
