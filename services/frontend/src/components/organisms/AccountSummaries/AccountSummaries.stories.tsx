import type {Meta, StoryObj} from "@storybook/react";
import {DateRangeProvider} from "hooks/";
import {
    smallViewport,
    storyData,
    storyUsingRedux,
    useCreateAccounts,
    useCreateTransactions
} from "utils/stories";
import AccountSummaries from "./AccountSummaries";

const meta: Meta<typeof AccountSummaries> = {
    title: "Organisms/Account Summaries",
    component: AccountSummaries
};

export default meta;
type Story = StoryObj<typeof AccountSummaries>;

const WrappedAccountSummaries = () => (
    <DateRangeProvider>
        <AccountSummaries />
    </DateRangeProvider>
);

const useMakeFunctional = () => {
    useCreateAccounts(storyData.accounts);
    useCreateTransactions(storyData.transactions);
};

/** The large view of the `AccountSummaries`. */
export const Large: Story = {
    render: storyUsingRedux((args) => {
        useMakeFunctional();

        return <WrappedAccountSummaries {...args} />;
    })
};

/** The small view of the `AccountSummaries`. */
export const Small: Story = {
    render: storyUsingRedux((args) => {
        useMakeFunctional();

        return <WrappedAccountSummaries {...args} />;
    })
};

Small.parameters = smallViewport;
