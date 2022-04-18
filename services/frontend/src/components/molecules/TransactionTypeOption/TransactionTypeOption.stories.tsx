import {action} from "@storybook/addon-actions";
import {boolean, number, select} from "@storybook/addon-knobs";
import React from "react";
import {Transaction} from "models/";
import {smallViewport} from "utils/stories";
import TransactionTypeOption, {
    TransactionTypeOptionIncome,
    TransactionTypeOptionExpense,
    TransactionTypeOptionDebt,
    TransactionTypeOptionTransfer
} from "./TransactionTypeOption";

export default {
    title: "Molecules/Transaction Type Option",
    component: TransactionTypeOption
};

const clickAction = () => action("click");

const activeKnob = () => boolean("Active", false);
const fromKnob = () => number("From Amount", 140000);
const currentKnob = () => number("Current Amount", 150000);
const typeKnob = () => select("Type", Transaction.TRANSACTION_TYPES, Transaction.INCOME);

/** The default view of a `TransactionTypeOption`, with configurable props. */
export const Default = () => (
    <TransactionTypeOption active={activeKnob()} type={typeKnob()} onClick={clickAction()} />
);

/** The filtering view of a `TransactionTypeOption`, that shows from/current amounts. */
export const ForFiltering = () => (
    <TransactionTypeOption
        className="TransactionTypeOption--story-filtering"
        active={activeKnob()}
        fromAmount={fromKnob()}
        currentAmount={currentKnob()}
        type={typeKnob()}
        onClick={clickAction()}
    />
);

/** The small, for filtering, view of a `TransactionTypeOption`. */
export const SmallForFiltering = () => (
    <TransactionTypeOption
        active={activeKnob()}
        fromAmount={fromKnob()}
        currentAmount={currentKnob()}
        type={typeKnob()}
        onClick={clickAction()}
    />
);

SmallForFiltering.parameters = smallViewport;

/** The Income type of a `TransactionTypeOption`. */
export const Income = () => (
    <TransactionTypeOptionIncome active={activeKnob()} onClick={clickAction()} />
);

/** The Income type of a `TransactionTypeOption`, for filtering. */
export const IncomeFiltering = () => (
    <TransactionTypeOptionIncome
        className="TransactionTypeOption--story-filtering"
        active={activeKnob()}
        fromAmount={fromKnob()}
        currentAmount={currentKnob()}
        onClick={clickAction()}
    />
);

/** The Expense type of a `TransactionTypeOption`. */
export const Expense = () => (
    <TransactionTypeOptionExpense active={activeKnob()} onClick={clickAction()} />
);

/** The Expense type of a `TransactionTypeOption`, for filtering. */
export const ExpenseFiltering = () => (
    <TransactionTypeOptionExpense
        className="TransactionTypeOption--story-filtering"
        active={activeKnob()}
        fromAmount={fromKnob()}
        currentAmount={currentKnob()}
        onClick={clickAction()}
    />
);

/** The Debt type of a `TransactionTypeOption`. */
export const Debt = () => (
    <TransactionTypeOptionDebt active={activeKnob()} onClick={clickAction()} />
);

/** The Debt type of a `TransactionTypeOption`, for filtering. */
export const DebtFiltering = () => (
    <TransactionTypeOptionDebt
        className="TransactionTypeOption--story-filtering"
        active={activeKnob()}
        fromAmount={fromKnob()}
        currentAmount={currentKnob()}
        onClick={clickAction()}
    />
);

/** The Transfer type of a `TransactionTypeOption`. */
export const Transfer = () => (
    <TransactionTypeOptionTransfer active={activeKnob()} onClick={clickAction()} />
);

/** The Transfer type of a `TransactionTypeOption`, for filtering. */
export const TransferFiltering = () => (
    <TransactionTypeOptionTransfer
        className="TransactionTypeOption--story-filtering"
        active={activeKnob()}
        fromAmount={fromKnob()}
        currentAmount={currentKnob()}
        onClick={clickAction()}
    />
);
