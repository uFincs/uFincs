import type {Decorator, Meta, StoryObj} from "@storybook/react";
import {Transaction} from "models/";
import {smallViewport} from "utils/stories";
import TransactionTypeOption, {
    TransactionTypeOptionIncome,
    TransactionTypeOptionExpense,
    TransactionTypeOptionDebt,
    TransactionTypeOptionTransfer
} from "./TransactionTypeOption";

const meta: Meta<typeof TransactionTypeOption> = {
    title: "Molecules/Transaction Type Option",
    component: TransactionTypeOption,
    args: {
        active: false,
        fromAmount: 14000,
        currentAmount: 15000,
        type: Transaction.INCOME
    }
};

export default meta;
type Story = StoryObj<typeof TransactionTypeOption>;

const FilteringDecorator: Decorator = (Story) => (
    <div className="TransactionTypeOption--story-filtering">
        <Story />
    </div>
);

/** The default view of a `TransactionTypeOption`, with configurable props. */
export const Default: Story = {};

/** The filtering view of a `TransactionTypeOption`, that shows from/current amounts. */
export const ForFiltering: Story = {
    decorators: [FilteringDecorator]
};

/** The small, for filtering, view of a `TransactionTypeOption`. */
export const SmallForFiltering: Story = {
    parameters: {
        ...smallViewport
    }
};

/** The Income type of a `TransactionTypeOption`. */
export const Income: Story = {
    render: ({type: _type, ...args}) => <TransactionTypeOptionIncome {...args} />
};

/** The Income type of a `TransactionTypeOption`, for filtering. */
export const IncomeFiltering: Story = {
    decorators: [FilteringDecorator],
    render: ({type: _type, ...args}) => <TransactionTypeOptionIncome {...args} />
};

/** The Expense type of a `TransactionTypeOption`. */
export const Expense: Story = {
    render: ({type: _type, ...args}) => <TransactionTypeOptionExpense {...args} />
};

/** The Expense type of a `TransactionTypeOption`, for filtering. */
export const ExpenseFiltering: Story = {
    decorators: [FilteringDecorator],
    render: ({type: _type, ...args}) => <TransactionTypeOptionExpense {...args} />
};

/** The Debt type of a `TransactionTypeOption`. */
export const Debt: Story = {
    render: ({type: _type, ...args}) => <TransactionTypeOptionDebt {...args} />
};

/** The Debt type of a `TransactionTypeOption`, for filtering. */
export const DebtFiltering: Story = {
    decorators: [FilteringDecorator],
    render: ({type: _type, ...args}) => <TransactionTypeOptionDebt {...args} />
};

/** The Transfer type of a `TransactionTypeOption`. */
export const Transfer: Story = {
    render: ({type: _type, ...args}) => <TransactionTypeOptionTransfer {...args} />
};

/** The Transfer type of a `TransactionTypeOption`, for filtering. */
export const TransferFiltering: Story = {
    decorators: [FilteringDecorator],
    render: ({type: _type, ...args}) => <TransactionTypeOptionTransfer {...args} />
};
