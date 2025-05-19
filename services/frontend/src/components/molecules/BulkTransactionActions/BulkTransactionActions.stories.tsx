import type {Meta, StoryObj} from "@storybook/react";
import {SelectableListProvider} from "hooks/";
import {Transaction} from "models/";
import {smallViewport} from "utils/stories";

import BulkTransactionActions from "./BulkTransactionActions";

const meta: Meta<typeof BulkTransactionActions> = {
    title: "Molecules/Bulk Transaction Actions",
    decorators: [
        (Story) => (
            <SelectableListProvider>
                <Story />
            </SelectableListProvider>
        )
    ],
    component: BulkTransactionActions,
    args: {
        transactionsById: {a: new Transaction({id: "a"})}
    }
};

export default meta;
type Story = StoryObj<typeof BulkTransactionActions>;

/** The default view of `BulkTransactionActions`. */
export const Default: Story = {};

/** The small view of `BulkTransactionActions`. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};

Small.parameters = smallViewport;
