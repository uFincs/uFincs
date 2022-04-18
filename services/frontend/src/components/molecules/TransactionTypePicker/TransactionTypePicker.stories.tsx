import {text} from "@storybook/addon-knobs";
import React, {useState} from "react";
import {Transaction} from "models/";
import {smallViewport} from "utils/stories";
import TransactionTypePicker from "./TransactionTypePicker";

export default {
    title: "Molecules/Transaction Type Picker",
    component: TransactionTypePicker
};

const labelKnob = () => text("Label", "Type");

/** The default view of the `TransactionTypePicker`. */
export const Default = () => {
    const [value, setValue] = useState<string>(Transaction.INCOME);

    return (
        <TransactionTypePicker
            id="Story-TransactionTypePicker"
            label={labelKnob()}
            value={value}
            onChange={setValue}
        />
    );
};

/** An example of the `TransactionTypePicker` with fewer types to pick from. */
export const FewerTypes = () => {
    const [value, setValue] = useState<string>(Transaction.INCOME);

    return (
        <TransactionTypePicker
            id="Story-TransactionTypePicker"
            label={labelKnob()}
            typesToShow={[Transaction.INCOME, Transaction.EXPENSE]}
            value={value}
            onChange={setValue}
        />
    );
};

/** The (more realistic) small view of the `TransactionTypePicker`. */
export const Small = () => {
    const [value, setValue] = useState<string>(Transaction.INCOME);

    return (
        <TransactionTypePicker
            id="Story-TransactionTypePicker"
            label={labelKnob()}
            value={value}
            onChange={setValue}
        />
    );
};
Small.parameters = smallViewport;

/** The disabled view of the `TransactionTypePicker`. */
export const Disabled = () => {
    const [value, setValue] = useState<string>(Transaction.INCOME);

    return (
        <TransactionTypePicker
            id="Story-TransactionTypePicker"
            disabled={true}
            label={labelKnob()}
            value={value}
            onChange={setValue}
        />
    );
};
