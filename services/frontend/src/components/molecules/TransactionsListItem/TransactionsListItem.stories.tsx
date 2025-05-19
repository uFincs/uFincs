import {Meta, StoryObj} from "@storybook/react";
import {SelectableListProvider} from "hooks/";
import {TransactionType} from "models/";
import {
    smallViewport,
    storyData,
    storyUsingRedux,
    useCreateAccounts,
    useCreateTransactions
} from "utils/stories";
import TransactionsListItem, {
    PureComponent as PureTransactionsListItem
} from "./TransactionsListItem";

const meta: Meta<typeof PureTransactionsListItem> = {
    title: "Molecules/Transactions List Item",
    component: PureTransactionsListItem,
    args: {
        id: "123",
        amount: 12345,
        description: "Bought some food",
        type: TransactionType.expense,
        creditAccountName: "Cash",
        debitAccountName: "Food"
    }
};

export default meta;
type Story = StoryObj<typeof PureTransactionsListItem>;

/** The default view of a `TransactionsListItem` with all knobs. */
export const Default: Story = {};

/** The more realistic view of a `TransactionsListItem`, since it's used on mobile. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};

/** A `TransactionsListItem` with the income type. */
export const Income: Story = {
    args: {
        type: TransactionType.income
    }
};

/** A `TransactionsListItem` with the expense type. */
export const Expense: Story = {
    args: {
        type: TransactionType.expense
    }
};

/** A `TransactionsListItem` with the debt type. */
export const Debt: Story = {
    args: {
        type: TransactionType.debt
    }
};

/** A `TransactionsListItem` with the transfer type. */
export const Transfer: Story = {
    args: {
        type: TransactionType.transfer
    }
};

/** The `TransactionsListItem` with no actions (i.e. a 'read-only' list item). */
export const NoActions: Story = {
    args: {
        actionsToShow: []
    }
};

/** The disabled view of a `TransactionsListItem`. */
export const Disabled: Story = {
    args: {
        disabled: true
    }
};

/** The 'error' view of a `TransactionsListItem`. */
export const HasError: Story = {
    args: {
        hasError: true
    }
};

/** The selectable view of a `TransactionsListItem`. */
export const Selectable: Story = {
    decorators: [
        (Story) => (
            <SelectableListProvider>
                <Story />
            </SelectableListProvider>
        )
    ]
};

/** The importable view of a `TransactionsListItem`.
 *
 *  The target account name should be displayed differently than a regular account name. */
export const Importable: Story = {
    args: {
        debitAccountName: "",
        placeholderDebitAccountName: "CANADA"
    }
};

/** An example of a 'virtual' `TransactionsListItem`.
 *
 *  It should have the date italicized and de-emphasized, to show how this isn't a 'real' transaction. */
export const Virtual: Story = {
    args: {
        isVirtualTransaction: true
    }
};

/** An example of a 'future' `TransactionsListItem`.
 *
 *  It should have a pink accent bar on the left side to indicate that it is a 'future' transaction. */
export const Future: Story = {
    args: {
        isFutureTransaction: true
    }
};

/** A story that tests that the connected component is working as intended. */
export const Connected: Story = {
    render: storyUsingRedux(() => {
        useCreateAccounts(storyData.accounts);
        useCreateTransactions(storyData.transactions);

        return <TransactionsListItem id="3" />;
    })
};
