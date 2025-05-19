import {Meta, StoryObj} from "@storybook/react";
import {DateRangeProvider} from "hooks/";
import {storyData, storyUsingRedux, useCreateAccounts} from "utils/stories";
import AccountsListItem, {PureComponent as PureAccountsListItem} from "./AccountsListItem";

const meta: Meta<typeof PureAccountsListItem> = {
    title: "Molecules/Accounts List Item",
    component: PureAccountsListItem,
    args: {
        name: "Chequing",
        balance: 10000,
        active: true,
        singleLayer: false,
        actionsToShow: ["edit", "delete"]
    }
};

export default meta;
type Story = StoryObj<typeof PureAccountsListItem>;

/** What the double layer (mobile) version of the `AccountsListItem` looks like. */
export const DoubleLayer: Story = {};

/** What the single layer (desktop) version of the `AccountsListItem` looks like. */
export const SingleLayer: Story = {
    args: {
        active: true,
        singleLayer: true
    }
};

/** An example of an `AccountsListItem` with a really long account name. */
export const LongName: Story = {
    args: {
        name: "Chequing Account name that really shouldn't be this long"
    }
};

/** An example of an `AccountsListItem` with a really long account balance. */
export const LongBalance: Story = {
    args: {
        balance: 1000000000000000
    }
};

/** The worst case scenario of an `AccountsListItem` where the name and balance are both long. */
export const LongNameAndBalance: Story = {
    args: {
        name: "Chequing Account name that really shouldn't be this long",
        balance: 1000000000000000
    }
};

/** The `AccountsListItem` with no actions (i.e. a 'read-only' list item). */
export const NoActions: Story = {
    args: {
        actionsToShow: []
    }
};

/** A story that tests that the connected component is working as intended.
 *
 *  If the name and balance show up, then it's working. Otherwise, it isn't.
 */
export const Connected: Story = {
    render: storyUsingRedux((args) => {
        useCreateAccounts(storyData.accounts);

        return (
            <DateRangeProvider>
                <AccountsListItem id="1" {...args} />
            </DateRangeProvider>
        );
    })
};
