import {action} from "@storybook/addon-actions";
import {boolean, number, select} from "@storybook/addon-knobs";
import React from "react";
import {Account} from "models/";
import AccountTypeOption, {
    AccountTypeOptionAsset,
    AccountTypeOptionLiability,
    AccountTypeOptionIncome,
    AccountTypeOptionExpense
} from "./AccountTypeOption";

export default {
    title: "Molecules/Account Type Option",
    component: AccountTypeOption
};

const clickAction = () => action("click");

const activeKnob = () => boolean("Active", false);
const balanceKnob = () => number("Balance", 4000000);
const typeKnob = () => select("Type", Account.ACCOUNT_TYPES, Account.ASSET);

/** The default view of the `AccountTypeOption`, with configurable props. */
export const Default = () => (
    <AccountTypeOption
        className="AccountTypeOption--story-sample"
        active={activeKnob()}
        type={typeKnob()}
        onClick={clickAction()}
    />
);

/** The `AccountTypeOption` with a balance for use with filtering the `AccountsList`. */
export const WithBalance = () => (
    <AccountTypeOption
        active={activeKnob()}
        balance={balanceKnob()}
        type={typeKnob()}
        onClick={clickAction()}
    />
);

/** The 'Asset' type of the `AccountTypeOption`. */
export const Asset = () => (
    <AccountTypeOptionAsset
        className="AccountTypeOption--story-sample"
        active={activeKnob()}
        onClick={clickAction()}
    />
);

/** The 'Liability' type of the `AccountTypeOption`. */
export const Liability = () => (
    <AccountTypeOptionLiability
        className="AccountTypeOption--story-sample"
        active={activeKnob()}
        onClick={clickAction()}
    />
);

/** The 'Income' type of the `AccountTypeOption`. */
export const Income = () => (
    <AccountTypeOptionIncome
        className="AccountTypeOption--story-sample"
        active={activeKnob()}
        onClick={clickAction()}
    />
);

/** The 'Expense' type of the `AccountTypeOption`. */
export const Expense = () => (
    <AccountTypeOptionExpense
        className="AccountTypeOption--story-sample"
        active={activeKnob()}
        onClick={clickAction()}
    />
);
