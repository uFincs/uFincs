import type {Meta, StoryObj} from "@storybook/react";
import {Account} from "models/";
import SelectableAccountsList from "./SelectableAccountsList";

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

const meta: Meta<typeof SelectableAccountsList> = {
    title: "Organisms/Selectable Accounts List",
    component: SelectableAccountsList,
    args: {
        accounts: accounts,
        selectedAccounts: selectedAccounts,
        type: Account.ASSET
    }
};

export default meta;
type Story = StoryObj<typeof SelectableAccountsList>;

/** The default view of `SelectableAccountsList`. */
export const Default: Story = {};
