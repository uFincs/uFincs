import {boolean, select} from "@storybook/addon-knobs";
import React, {useState} from "react";
import {Transaction} from "models/";
import TransactionTypeIcon from "./TransactionTypeIcon";

export default {
    title: "Atoms/Transaction Type Icon",
    component: TransactionTypeIcon
};

const backgroundKnob = () => boolean("With Background", true);
const typeKnob = () => select("Type", Transaction.TRANSACTION_TYPES, Transaction.INCOME);

/** The default view of the `TransactionTypeIcon`, with configurable type. */
export const Default = () => (
    <TransactionTypeIcon type={typeKnob()} withBackground={backgroundKnob()} />
);

/** The checkbox view of the `TransactionTypeIcon`. */
export const Checkbox = () => {
    const [checked, setChecked] = useState(false);

    return (
        <TransactionTypeIcon
            checkable={true}
            checked={checked}
            type={typeKnob()}
            withBackground={backgroundKnob()}
            onCheck={setChecked}
        />
    );
};

/** The income type of the `TransactionTypeIcon`. */
export const Income = () => (
    <TransactionTypeIcon type={Transaction.INCOME} withBackground={backgroundKnob()} />
);

/** The expense type of the `TransactionTypeIcon`. */
export const Expense = () => (
    <TransactionTypeIcon type={Transaction.EXPENSE} withBackground={backgroundKnob()} />
);

/** The debt type of the `TransactionTypeIcon`. */
export const Debt = () => (
    <TransactionTypeIcon type={Transaction.DEBT} withBackground={backgroundKnob()} />
);

/** The transfer type of the `TransactionTypeIcon`. */
export const Transfer = () => (
    <TransactionTypeIcon type={Transaction.TRANSFER} withBackground={backgroundKnob()} />
);
