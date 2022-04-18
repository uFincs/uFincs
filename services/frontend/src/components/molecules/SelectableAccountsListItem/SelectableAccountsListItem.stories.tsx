import {actions} from "@storybook/addon-actions";
import {number, select, text} from "@storybook/addon-knobs";
import React, {useState} from "react";
import {SelectableListProvider} from "hooks/";
import {Account} from "models/";
import SelectableAccountsListItem from "./SelectableAccountsListItem";

export default {
    title: "Molecules/Selectable Accounts List Item",
    component: SelectableAccountsListItem
};

const itemActions = actions("onValueChange");

const initialName = () => text("Initial Name", "Chequing Account");
const initialBalance = () => number("Initial Balance", 0);

const typeSelect = () =>
    select(
        "Type",
        [Account.ASSET, Account.LIABILITY, Account.INCOME, Account.EXPENSE],
        Account.ASSET
    );

/** The default view of `SelectableAccountsListItem`. */
export const Default = () => {
    const [selected, setSelected] = useState(false);

    return (
        <SelectableListProvider>
            <SelectableAccountsListItem
                id="123"
                initialName={initialName()}
                initialOpeningBalance={initialBalance()}
                selected={selected}
                type={typeSelect()}
                onSelect={setSelected}
                {...itemActions}
            />
        </SelectableListProvider>
    );
};
