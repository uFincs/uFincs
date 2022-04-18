import {actions} from "@storybook/addon-actions";
import {boolean} from "@storybook/addon-knobs";
import React from "react";
import {useSelector} from "react-redux";
import {DateRangeProvider} from "hooks/";
import {Account} from "models/";
import {accountsSlice} from "store/";
import {
    smallViewport,
    smallLandscapeViewport,
    storyUsingRedux,
    useCreateAccounts
} from "utils/stories";
import AccountsList, {PureComponent as PureAccountsList} from "./AccountsList";

export default {
    title: "Organisms/Accounts List",
    component: AccountsList
};

const listActions = actions("onAddAccount", "navigateToAccount");
const singleLayerKnob = () => boolean("Single Layer", false);

const assetLiabilityAccounts = [
    new Account({id: "1", name: "Chequing", type: Account.ASSET, openingBalance: 22000}),
    new Account({id: "2", name: "Savings", type: Account.ASSET, openingBalance: 2200000}),
    new Account({id: "3", name: "Savings", type: Account.ASSET, openingBalance: 2200000}),
    new Account({id: "4", name: "Credit Card", type: Account.LIABILITY, openingBalance: 1000}),
    new Account({id: "5", name: "Credit Card", type: Account.LIABILITY, openingBalance: 1000})
];

const accounts = [
    ...assetLiabilityAccounts,
    new Account({id: "6", name: "Chequing", type: Account.INCOME}),
    new Account({id: "7", name: "Savings", type: Account.INCOME}),
    new Account({id: "8", name: "Credit Card", type: Account.INCOME}),
    new Account({id: "9", name: "Chequing", type: Account.EXPENSE}),
    new Account({id: "10", name: "Savings", type: Account.EXPENSE}),
    new Account({id: "11", name: "Credit Card", type: Account.EXPENSE})
];

const useMakeFunctional = (accounts: Array<Account>) => {
    useCreateAccounts(accounts);

    return useSelector(accountsSlice.selectors.selectSortedAccountsByType);
};

/** The default view of the `AccountsList`. */
export const Default = storyUsingRedux(() => {
    const accountsByType = useMakeFunctional(accounts);

    return (
        <DateRangeProvider>
            <PureAccountsList
                accountsByType={accountsByType}
                singleLayer={singleLayerKnob()}
                {...listActions}
            />
        </DateRangeProvider>
    );
});

/** The `AccountsList` when some of the sections (but not all) are empty. */
export const EmptySections = storyUsingRedux(() => {
    const accountsByType = useMakeFunctional(assetLiabilityAccounts);

    return (
        <DateRangeProvider>
            <PureAccountsList
                accountsByType={accountsByType}
                singleLayer={singleLayerKnob()}
                {...listActions}
            />
        </DateRangeProvider>
    );
});

/** The `AccountsList` when there are no accounts at all. */
export const EmptyList = storyUsingRedux(() => {
    const accountsByType = useMakeFunctional([]);

    return (
        <DateRangeProvider>
            <PureAccountsList
                accountsByType={accountsByType}
                singleLayer={singleLayerKnob()}
                {...listActions}
            />
        </DateRangeProvider>
    );
});

/** The `AccountsList` with no-actions, effectively read-only. */
export const NoActions = storyUsingRedux(() => {
    const accountsByType = useMakeFunctional(accounts);

    return (
        <DateRangeProvider>
            <PureAccountsList
                accountsByType={accountsByType}
                actionsToShow={[]}
                singleLayer={singleLayerKnob()}
                {...listActions}
            />
        </DateRangeProvider>
    );
});

/** The small view of the `AccountsList`. */
export const Small = storyUsingRedux(() => {
    const accountsByType = useMakeFunctional(accounts);

    return (
        <DateRangeProvider>
            <PureAccountsList
                accountsByType={accountsByType}
                singleLayer={singleLayerKnob()}
                {...listActions}
            />
        </DateRangeProvider>
    );
});

Small.parameters = smallViewport;

/** The small landscape view of the `AccountsList`. */
export const SmallLandscape = storyUsingRedux(() => {
    const accountsByType = useMakeFunctional(accounts);

    return (
        <DateRangeProvider>
            <PureAccountsList
                accountsByType={accountsByType}
                singleLayer={singleLayerKnob()}
                {...listActions}
            />
        </DateRangeProvider>
    );
});

SmallLandscape.parameters = smallLandscapeViewport;

/** A test of the fully connected `AccountsList`. */
export const Connected = storyUsingRedux(() => {
    const accountsByType = useMakeFunctional(accounts);
    return (
        <DateRangeProvider>
            <AccountsList accountsByType={accountsByType} singleLayer={singleLayerKnob()} />
        </DateRangeProvider>
    );
});

/** A test of the fully connected `AccountsList` with no accounts. */
export const ConnectedEmpty = storyUsingRedux(() => {
    const accountsByType = useMakeFunctional([]);
    return (
        <DateRangeProvider>
            <AccountsList accountsByType={accountsByType} singleLayer={singleLayerKnob()} />
        </DateRangeProvider>
    );
});
