import {actions} from "@storybook/addon-actions";
import {boolean, number, text} from "@storybook/addon-knobs";
import React from "react";
import {DateRangeProvider} from "hooks/";
import {storyData, storyUsingRedux, useCreateAccounts} from "utils/stories";
import AccountsListItem, {PureComponent as PureAccountsListItem} from "./AccountsListItem";

export default {
    title: "Molecules/Accounts List Item",
    component: PureAccountsListItem
};

const connectedActions = actions("onClick", "onDelete", "onEdit");

const navigationActions = actions("onFirstItem", "onLastItem", "onPreviousItem", "onNextItem");

/** What the double layer (mobile) version of the `AccountsListItem` looks like. */
export const DoubleLayer = () => (
    <PureAccountsListItem
        name={text("Name", "Chequing")}
        balance={number("Balance", 10000)}
        {...connectedActions}
        {...navigationActions}
    />
);

/** What the single layer (desktop) version of the `AccountsListItem` looks like. */
export const SingleLayer = () => (
    <PureAccountsListItem
        name={text("Name", "Chequing")}
        balance={number("Balance", 10000)}
        active={boolean("Active", true)}
        singleLayer={true}
        {...connectedActions}
        {...navigationActions}
    />
);

/** An example of an `AccountsListItem` with a really long account name. */
export const LongName = () => (
    <PureAccountsListItem
        name={text("Name", "Chequing Account name that really shouldn't be this long")}
        balance={number("Balance", 10000)}
        active={boolean("Active", true)}
        singleLayer={boolean("Single Layer", false)}
        {...connectedActions}
        {...navigationActions}
    />
);

/** An example of an `AccountsListItem` with a really long account balance. */
export const LongBalance = () => (
    <PureAccountsListItem
        name={text("Name", "Chequing")}
        balance={number("Balance", 1000000000000000)}
        active={boolean("Active", true)}
        singleLayer={boolean("Single Layer", false)}
        {...connectedActions}
        {...navigationActions}
    />
);

/** The worst case scenario of an `AccountsListItem` where the name and balance are both long. */
export const LongNameAndBalance = () => (
    <PureAccountsListItem
        name={text("Name", "Chequing Account name that really shouldn't be this long")}
        balance={number("Balance", 1000000000000000)}
        active={boolean("Active", true)}
        singleLayer={boolean("Single Layer", false)}
        {...connectedActions}
        {...navigationActions}
    />
);

/** The `AccountsListItem` with no actions (i.e. a 'read-only' list item). */
export const NoActions = () => (
    <PureAccountsListItem
        actionsToShow={[]}
        name={text("Name", "Chequing")}
        balance={number("Balance", 10000)}
        {...connectedActions}
        {...navigationActions}
    />
);

/** A story that tests that the connected component is working as intended.
 *
 *  If the name and balance show up, then it's working. Otherwise, it isn't.
 */
export const Connected = storyUsingRedux(() => {
    useCreateAccounts(storyData.accounts);

    return (
        <DateRangeProvider>
            <AccountsListItem
                id="1"
                singleLayer={boolean("Single Layer", false)}
                {...navigationActions}
            />
        </DateRangeProvider>
    );
});
