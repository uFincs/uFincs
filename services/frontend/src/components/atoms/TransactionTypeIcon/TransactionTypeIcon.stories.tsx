import type {Meta, StoryObj} from "@storybook/react";
import {Transaction} from "models/";
import TransactionTypeIcon from "./TransactionTypeIcon";

const meta: Meta<typeof TransactionTypeIcon> = {
    title: "Atoms/Transaction Type Icon",
    component: TransactionTypeIcon,
    args: {
        withBackground: true,
        type: Transaction.INCOME
    }
};

export default meta;
type Story = StoryObj<typeof TransactionTypeIcon>;

/** The default view of the `TransactionTypeIcon`, with configurable type. */
export const Default: Story = {};

/** The checkbox view of the `TransactionTypeIcon`. */
export const Checkbox: Story = {
    args: {
        checkable: true
    }
};

/** The income type of the `TransactionTypeIcon`. */
export const Income: Story = {
    args: {
        type: Transaction.INCOME
    }
};

/** The expense type of the `TransactionTypeIcon`. */
export const Expense: Story = {
    args: {
        type: Transaction.EXPENSE
    }
};

/** The debt type of the `TransactionTypeIcon`. */
export const Debt: Story = {
    args: {
        type: Transaction.DEBT
    }
};

/** The transfer type of the `TransactionTypeIcon`. */
export const Transfer: Story = {
    args: {
        type: Transaction.TRANSFER
    }
};
