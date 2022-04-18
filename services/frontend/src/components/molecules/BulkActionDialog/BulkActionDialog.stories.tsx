import {actions} from "@storybook/addon-actions";
import React from "react";
import BulkActionDialog from "./BulkActionDialog";

export default {
    title: "Molecules/Bulk Action Dialog",
    component: BulkActionDialog
};

const dialogActions = actions("onClose", "onSubmit");

const suggestions = [
    {label: "Chequing", value: "1"},
    {label: "Savings", value: "2"},
    {label: "Credit Card", value: "3"}
];

/** The text input version of `BulkActionDialog`. */
export const Text = () => {
    return <BulkActionDialog inputType="text" label="Description" {...dialogActions} />;
};

/** The date input version of `BulkActionDialog`. */
export const Date = () => {
    return <BulkActionDialog inputType="date" label="Date" {...dialogActions} />;
};

/** The money input version of `BulkActionDialog`. */
export const Money = () => {
    return <BulkActionDialog inputType="money" label="Amount" {...dialogActions} />;
};

/** The select input version of `BulkActionDialog`. */
export const Select = () => {
    return (
        <BulkActionDialog
            inputType="select"
            label="Account"
            suggestions={suggestions}
            {...dialogActions}
        />
    );
};

/** The transaction type input version of `BulkActionDialog`. */
export const TransactionType = () => {
    return <BulkActionDialog inputType="transactionType" label="Type" {...dialogActions} />;
};
