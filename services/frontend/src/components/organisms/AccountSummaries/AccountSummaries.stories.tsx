import React from "react";
import {DateRangeProvider} from "hooks/";
import {
    smallViewport,
    storyData,
    storyUsingRedux,
    useCreateAccounts,
    useCreateTransactions
} from "utils/stories";
import AccountSummaries from "./AccountSummaries";

export default {
    title: "Organisms/Account Summaries",
    component: AccountSummaries
};

const WrappedAccountSummaries = () => (
    <DateRangeProvider>
        <AccountSummaries />
    </DateRangeProvider>
);

const useMakeFunctional = () => {
    useCreateAccounts(storyData.accounts);
    useCreateTransactions(storyData.transactions);
};

/** The large view of the `AccountSummaries`. */
export const Large = storyUsingRedux(() => {
    useMakeFunctional();

    return <WrappedAccountSummaries />;
});

/** The small view of the `AccountSummaries`. */
export const Small = storyUsingRedux(() => {
    useMakeFunctional();

    return <WrappedAccountSummaries />;
});

Small.parameters = smallViewport;
