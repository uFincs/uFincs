import React from "react";
import {TransactionsSearchProvider} from "hooks/";
import TransactionsSearchInput from "./TransactionsSearchInput";

export default {
    title: "Molecules/Transactions Search Input",
    component: TransactionsSearchInput
};

/** The default view of `TransactionsSearchInput`. */
export const Default = () => (
    <TransactionsSearchProvider>
        <TransactionsSearchInput />
    </TransactionsSearchProvider>
);
