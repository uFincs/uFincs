import {actions} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import {TransactionsSearchProvider} from "hooks/";
import TransactionsImportEditForm from "./TransactionsImportEditForm";

const meta: Meta<typeof TransactionsImportEditForm> = {
    title: "Organisms/Transactions Import Edit Form",
    decorators: [
        (Story) => (
            <TransactionsSearchProvider>
                <Story />
            </TransactionsSearchProvider>
        )
    ],
    component: TransactionsImportEditForm
};

export default meta;
type Story = StoryObj<typeof TransactionsImportEditForm>;

/** The default view of `TransactionsImportEditForm`. */
export const Default: Story = {
    args: {},
    parameters: {
        ...actions("onClose")
    }
};
