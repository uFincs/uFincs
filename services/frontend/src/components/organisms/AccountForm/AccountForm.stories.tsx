import type {Meta, StoryObj} from "@storybook/react";
import {Account} from "models/";
import {smallViewport} from "utils/stories";
import AccountForm, {PureComponent as PureAccountForm} from "./AccountForm";

const accountForEditing = new Account({
    name: "Test",
    openingBalance: 12345,
    interest: 1230,
    type: Account.ASSET
});

const meta: Meta<typeof PureAccountForm> = {
    title: "Organisms/Account Form",
    component: PureAccountForm,
    args: {
        isEditing: false
    }
};

export default meta;
type Story = StoryObj<typeof PureAccountForm>;

/** The default view of the `AccountForm`. */
export const Default: Story = {};

/** Small is the more realistic view of the `AccountForm`, since the form only takes up
 *  limited horizontal screen space when displayed in a `Sidebar`. */
export const Small: Story = {
    parameters: smallViewport
};

/** The view of the `AccountForm` when editing an account. */
export const Editing: Story = {
    args: {
        accountForEditing: accountForEditing,
        isEditing: true
    },
    parameters: smallViewport
};

/** The view of the `AccountForm` when editing an invalid account. */
export const InvalidEditingAccount: Story = {
    args: {
        isEditing: true
    },
    parameters: smallViewport
};

/** A story for testing that the connected `AccountForm` is working. */
export const Connected: Story = {
    render: (args) => <AccountForm {...args} />
};
