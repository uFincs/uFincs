import type {Meta, StoryObj} from "@storybook/react";
import {AccountTypesProvider, DateRangeProvider} from "hooks/";
import {smallViewport} from "utils/stories";
import AccountTypeFilters from "./AccountTypeFilters";

const meta: Meta<typeof AccountTypeFilters> = {
    title: "Organisms/Account Type Filters",
    decorators: [
        (Story) => (
            <DateRangeProvider>
                <AccountTypesProvider>
                    <Story />
                </AccountTypesProvider>
            </DateRangeProvider>
        )
    ],
    component: AccountTypeFilters
};

export default meta;
type Story = StoryObj<typeof AccountTypeFilters>;

/** The default view of the `AccountTypeFilters`. */
export const Default: Story = {
    args: {}
};

/** The small view of the `AccountTypeFilters`. */
export const Small: Story = {
    args: {
        style: {width: "100%"}
    },
    parameters: {
        ...smallViewport
    }
};
