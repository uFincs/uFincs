import type {Meta, StoryObj} from "@storybook/react";
import {Transaction} from "models/";
import {smallViewport} from "utils/stories";
import TransactionTypePicker from "./TransactionTypePicker";

const meta: Meta<typeof TransactionTypePicker> = {
    title: "Molecules/Transaction Type Picker",
    component: TransactionTypePicker,
    args: {
        value: "income",
        label: "Type",
        disabled: false
    }
};

export default meta;
type Story = StoryObj<typeof TransactionTypePicker>;

/** The default view of the `TransactionTypePicker`. */
export const Default: Story = {};

/** An example of the `TransactionTypePicker` with fewer types to pick from. */
export const FewerTypes: Story = {
    args: {
        typesToShow: [Transaction.INCOME, Transaction.EXPENSE]
    }
};

/** The (more realistic) small view of the `TransactionTypePicker`. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};

/** The disabled view of the `TransactionTypePicker`. */
export const Disabled: Story = {
    args: {
        disabled: true
    }
};
