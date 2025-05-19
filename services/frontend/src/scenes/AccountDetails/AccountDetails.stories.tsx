import type {Meta, StoryObj} from "@storybook/react";
import {DateRangeProvider} from "hooks/";
import {
    smallViewport,
    storyData,
    storyUsingRedux,
    useCreateAccounts,
    useCreateTransactions
} from "utils/stories";
import AccountDetails from "./AccountDetails";

const meta: Meta<typeof AccountDetails> = {
    title: "Scenes/Account Details",
    decorators: [
        (Story) => (
            <DateRangeProvider>
                <Story />
            </DateRangeProvider>
        )
    ],
    component: AccountDetails,
    args: {
        id: storyData.accounts[0].id
    },
    render: storyUsingRedux((args) => {
        useCreateAccounts(storyData.accounts);
        useCreateTransactions(storyData.transactions);

        return <AccountDetails {...args} />;
    })
};

export default meta;
type Story = StoryObj<typeof AccountDetails>;

/** The default view of the `AccountDetails` scene. */
export const Default: Story = {};

/** The small view of the `AccountDetails` scene. */
export const Small: Story = {
    parameters: {
        ...smallViewport
    }
};

/** The `AccountDetails` scene with an invalid account. */
export const InvalidAccount: Story = {
    args: {
        id: ""
    }
};
