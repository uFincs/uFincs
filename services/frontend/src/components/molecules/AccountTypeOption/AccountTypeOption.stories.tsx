import {action} from "@storybook/addon-actions";
import {Meta, StoryObj} from "@storybook/react";
import {Account} from "models/";
import AccountTypeOption, {
    AccountTypeOptionAsset,
    AccountTypeOptionLiability,
    AccountTypeOptionIncome,
    AccountTypeOptionExpense
} from "./AccountTypeOption";

const clickAction = () => action("click");

const meta: Meta<typeof AccountTypeOption> = {
    title: "Molecules/Account Type Option",
    component: AccountTypeOption,
    args: {
        className: "AccountTypeOption--story-sample",
        active: false,
        type: Account.ASSET,
        onClick: clickAction()
    }
};

export default meta;
type Story = StoryObj<typeof AccountTypeOption>;

/** The default view of the `AccountTypeOption`, with configurable props. */
export const Default: Story = {};

/** The `AccountTypeOption` with a balance for use with filtering the `AccountsList`. */
export const WithBalance: Story = {
    args: {
        balance: 4000000
    }
};

/** The 'Asset' type of the `AccountTypeOption`. */
export const Asset: Story = {
    render: ({type: _type, ...args}) => <AccountTypeOptionAsset {...args} />
};

/** The 'Liability' type of the `AccountTypeOption`. */
export const Liability: Story = {
    render: ({type: _type, ...args}) => <AccountTypeOptionLiability {...args} />
};

/** The 'Income' type of the `AccountTypeOption`. */
export const Income: Story = {
    render: ({type: _type, ...args}) => <AccountTypeOptionIncome {...args} />
};

/** The 'Expense' type of the `AccountTypeOption`. */
export const Expense: Story = {
    render: ({type: _type, ...args}) => <AccountTypeOptionExpense {...args} />
};
