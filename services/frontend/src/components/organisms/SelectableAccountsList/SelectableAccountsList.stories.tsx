import {actions} from "@storybook/addon-actions";
import {select} from "@storybook/addon-knobs";
import React from "react";
import {Account} from "models/";
import SelectableAccountsList from "./SelectableAccountsList";

export default {
    title: "Organisms/Selectable Accounts List",
    component: SelectableAccountsList
};

const accounts = [
    new Account({name: "Chequing Account", openingBalance: 0}),
    new Account({name: "Savings", openingBalance: 0}),
    new Account({name: "Cash", openingBalance: 0})
];

const selectedAccounts = {
    [accounts[0].id]: true,
    [accounts[1].id]: false,
    [accounts[2].id]: true
};

const listActions = actions("onAddAccount", "onSelectAccount", "onValueChange");

const type = () =>
    select(
        "Type",
        [Account.ASSET, Account.LIABILITY, Account.INCOME, Account.EXPENSE],
        Account.ASSET
    );

/** The default view of `SelectableAccountsList`. */
export const Default = () => (
    <SelectableAccountsList
        accounts={accounts}
        selectedAccounts={selectedAccounts}
        type={type()}
        {...listActions}
    />
);
