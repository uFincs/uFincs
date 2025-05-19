import {actions} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import BulkActionDialog from "./BulkActionDialog";

const meta: Meta<typeof BulkActionDialog> = {
    title: "Molecules/Bulk Action Dialog",
    component: BulkActionDialog,
    args: {
        ...actions("onClose", "onSubmit")
    }
};

export default meta;
type Story = StoryObj<typeof BulkActionDialog>;

const suggestions = [
    {label: "Chequing", value: "1"},
    {label: "Savings", value: "2"},
    {label: "Credit Card", value: "3"}
];

/** The text input version of `BulkActionDialog`. */
export const Text: Story = {
    args: {
        inputType: "text",
        label: "Description"
    }
};

/** The date input version of `BulkActionDialog`. */
export const Date: Story = {
    args: {
        inputType: "date",
        label: "Date"
    }
};

/** The money input version of `BulkActionDialog`. */
export const Money: Story = {
    args: {
        inputType: "money",
        label: "Amount"
    }
};

/** The select input version of `BulkActionDialog`. */
export const Select: Story = {
    args: {
        inputType: "select",
        label: "Account",
        suggestions: suggestions
    }
};

/** The transaction type input version of `BulkActionDialog`. */
export const TransactionType: Story = {
    args: {
        inputType: "transactionType",
        label: "Type"
    }
};
