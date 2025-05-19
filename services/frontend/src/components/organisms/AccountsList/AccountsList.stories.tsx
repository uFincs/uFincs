import type {Meta, StoryObj} from "@storybook/react";
import {useSelector} from "react-redux";
import {DateRangeProvider} from "hooks/";
import {Account} from "models/";
import {accountsSlice} from "store/";
import {
    smallViewport,
    smallLandscapeViewport,
    storyUsingRedux,
    useCreateAccounts
} from "utils/stories";
import AccountsList, {PureComponent as PureAccountsList} from "./AccountsList";

const meta: Meta<typeof AccountsList> = {
    title: "Organisms/Accounts List",
    decorators: [
        (Story) => (
            <DateRangeProvider>
                <Story />
            </DateRangeProvider>
        )
    ],
    component: AccountsList,
    args: {
        singleLayer: false
    }
};

export default meta;
type Story = StoryObj<typeof AccountsList>;

const assetLiabilityAccounts = [
    new Account({id: "1", name: "Chequing", type: Account.ASSET, openingBalance: 22000}),
    new Account({id: "2", name: "Savings", type: Account.ASSET, openingBalance: 2200000}),
    new Account({id: "3", name: "Savings", type: Account.ASSET, openingBalance: 2200000}),
    new Account({id: "4", name: "Credit Card", type: Account.LIABILITY, openingBalance: 1000}),
    new Account({id: "5", name: "Credit Card", type: Account.LIABILITY, openingBalance: 1000})
];

const accounts = [
    ...assetLiabilityAccounts,
    new Account({id: "6", name: "Chequing", type: Account.INCOME}),
    new Account({id: "7", name: "Savings", type: Account.INCOME}),
    new Account({id: "8", name: "Credit Card", type: Account.INCOME}),
    new Account({id: "9", name: "Chequing", type: Account.EXPENSE}),
    new Account({id: "10", name: "Savings", type: Account.EXPENSE}),
    new Account({id: "11", name: "Credit Card", type: Account.EXPENSE})
];

const useMakeFunctional = (accounts: Array<Account>) => {
    useCreateAccounts(accounts);

    return useSelector(accountsSlice.selectors.selectSortedAccountsByType);
};

/** The default view of the `AccountsList`. */
export const Default: Story = {
    render: storyUsingRedux((args) => {
        const accountsByType = useMakeFunctional(accounts);

        return <PureAccountsList {...args} accountsByType={accountsByType} />;
    })
};

/** The `AccountsList` when some of the sections (but not all) are empty. */
export const EmptySections: Story = {
    render: storyUsingRedux((args) => {
        const accountsByType = useMakeFunctional(assetLiabilityAccounts);

        return <PureAccountsList {...args} accountsByType={accountsByType} />;
    })
};

/** The `AccountsList` when there are no accounts at all. */
export const EmptyList: Story = {
    render: storyUsingRedux((args) => {
        const accountsByType = useMakeFunctional([]);

        return <PureAccountsList {...args} accountsByType={accountsByType} />;
    })
};

/** The `AccountsList` with no-actions, effectively read-only. */
export const NoActions: Story = {
    args: {
        actionsToShow: []
    },
    render: storyUsingRedux((args) => {
        const accountsByType = useMakeFunctional(accounts);

        return <PureAccountsList {...args} accountsByType={accountsByType} />;
    })
};

/** The small view of the `AccountsList`. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    },
    render: storyUsingRedux((args) => {
        const accountsByType = useMakeFunctional(accounts);

        return <PureAccountsList {...args} accountsByType={accountsByType} />;
    })
};

/** The small landscape view of the `AccountsList`. */
export const SmallLandscape: Story = {
    parameters: {
        ...smallLandscapeViewport
    },
    render: storyUsingRedux((args) => {
        const accountsByType = useMakeFunctional(accounts);

        return <PureAccountsList {...args} accountsByType={accountsByType} />;
    })
};

/** A test of the fully connected `AccountsList`. */
export const Connected: Story = {
    render: storyUsingRedux((args) => {
        const accountsByType = useMakeFunctional(accounts);
        return <AccountsList {...args} accountsByType={accountsByType} />;
    })
};

/** A test of the fully connected `AccountsList` with no accounts. */
export const ConnectedEmpty: Story = {
    render: storyUsingRedux((args) => {
        const accountsByType = useMakeFunctional([]);
        return <AccountsList {...args} accountsByType={accountsByType} />;
    })
};
