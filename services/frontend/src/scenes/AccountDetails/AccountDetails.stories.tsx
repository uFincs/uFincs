import React from "react";
import {DateRangeProvider} from "hooks/";
import {
    smallViewport,
    storyData,
    storyUsingRedux,
    useCreateAccounts,
    useCreateTransactions
} from "utils/stories";
import AccountDetails from "./AccountDetails";

export default {
    title: "Scenes/Account Details",
    component: AccountDetails
};

const WrappedAccountDetails = (props: any) => (
    <DateRangeProvider>
        <AccountDetails {...props} />
    </DateRangeProvider>
);

/** The default view of the `AccountDetails` scene. */
export const Default = storyUsingRedux(() => {
    useCreateAccounts(storyData.accounts);
    useCreateTransactions(storyData.transactions);

    return <WrappedAccountDetails id={storyData.accounts[0].id} />;
});

/** The small view of the `AccountDetails` scene. */
export const Small = storyUsingRedux(() => {
    useCreateAccounts(storyData.accounts);
    useCreateTransactions(storyData.transactions);

    return <WrappedAccountDetails id={storyData.accounts[0].id} />;
});

Small.parameters = smallViewport;

/** The `AccountDetails` scene with an invalid account. */
export const InvalidAccount = storyUsingRedux(() => <WrappedAccountDetails id="" />);
