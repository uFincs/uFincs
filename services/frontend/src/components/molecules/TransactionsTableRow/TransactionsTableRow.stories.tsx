import {Decorator, Meta, StoryObj} from "@storybook/react";
import classNames from "classnames";
import {SelectableListProvider} from "hooks/";
import {Transaction} from "models/";
import {PureComponent as PureTransactionsTableRow} from "./TransactionsTableRow";

const meta: Meta<typeof PureTransactionsTableRow> = {
    title: "Molecules/Transactions Table Row",
    component: PureTransactionsTableRow,
    args: {
        id: "123",
        amount: 12345,
        date: "2020-07-11",
        description: "Bought a whole metric ton of food.",
        type: Transaction.EXPENSE,
        creditAccountName: "Cash",
        debitAccountName: "Food"
    }
};

export default meta;
type Story = StoryObj<typeof PureTransactionsTableRow>;

const TransactionsTableDecorator =
    ({full = false, runningBalance = false} = {}): Decorator =>
    (Story) => (
        <div
            className={classNames({
                "TransactionsTable--full": full,
                "TransactionsTable--running-balance": runningBalance
            })}
            style={{width: "100%"}}
        >
            <Story />
        </div>
    );

/** The compressed (default) view of the `TransactionsTableRow` where the From and To accounts
 *  are compressed into one column underneath Description. */
export const Compressed: Story = {};

/** The compressed view of the `TransactionsTableRow` with the running balance enabled. */
export const CompressedWithRunningBalance: Story = {
    // This uses `TransactionsTable--running-balance` class to force the running balance view.
    // Also, need to force 100% width on the container for story purposes, so that it looks nice.
    decorators: [TransactionsTableDecorator({runningBalance: true})],
    args: {
        runningBalance: 67890
    }
};

/** The full view of the `TransactionsTableRow` where each piece of data gets its own column, */
export const Full: Story = {
    // This uses the `TransactionsTable--full` class to force the full view.
    decorators: [TransactionsTableDecorator({full: true})]
};

/** The full view of the `TransactionsTableRow` with the running balance enabled. */
export const FullWithRunningBalance: Story = {
    decorators: [TransactionsTableDecorator({full: true, runningBalance: true})],
    args: {
        runningBalance: 67890
    }
};

/** The disabled view of the `TransactionsTableRow`. */
export const Disabled: Story = {
    decorators: [TransactionsTableDecorator({full: true})],
    args: {
        disabled: true
    }
};

/** The 'error' view of the `TransactionsTableRow`. */
export const HasError: Story = {
    decorators: [TransactionsTableDecorator({full: true})],
    args: {
        hasError: true
    }
};

/** Enabling the selectable view of the `TransactionsTableRow`. */
export const Selectable: Story = {
    decorators: [
        (Story) => (
            <SelectableListProvider>
                <Story />
            </SelectableListProvider>
        ),
        TransactionsTableDecorator({full: true})
    ]
};

/** An example of an 'importable' `TransactionsTableRow`.
 *
 *  The target account name should be displayed differently than a regular account name. */
export const Importable: Story = {
    decorators: [TransactionsTableDecorator({full: true})],
    args: {
        debitAccountName: "",
        placeholderDebitAccountName: "CANADA"
    }
};

/** An example of a 'recurring' `TransactionsTableRow`.
 *
 *  The only change should be that the Delete action has a different tooltip, emphasizing how deleting
 *  a recurring transaction won't delete its realized transactions. */
export const Recurring: Story = {
    decorators: [TransactionsTableDecorator({full: true})],
    args: {
        isRecurringTransaction: true
    }
};

/** An example of a 'virtual' `TransactionsTableRow` (i.e. a future transaction that was derived from
 *  a recurring transaction).
 *
 *  It should have the date italicized and de-emphasized, to show how this isn't a 'real' transaction. */
export const Virtual: Story = {
    decorators: [TransactionsTableDecorator({full: true})],
    args: {
        isVirtualTransaction: true
    }
};

/** An example of a 'future' `TransactionsTableRow` (i.e. a transaction that happens in the future).
 *
 *  It should have a pink accent bar on the left side to indicate that it is a 'future' transaction. */
export const Future: Story = {
    decorators: [TransactionsTableDecorator({full: true})],
    args: {
        isFutureTransaction: true
    }
};
