import type {Meta, StoryObj} from "@storybook/react";
import Account from "models/Account";
import {smallViewport} from "utils/stories";
import AccountTypePicker from "./AccountTypePicker";

const meta: Meta<typeof AccountTypePicker> = {
    title: "Molecules/Account Type Picker",
    component: AccountTypePicker,
    args: {
        id: "Story-AccountTypePicker",
        label: "Type",
        value: Account.ASSET,
        onChange: () => {},
        disabled: false,
        typesToShow: []
    }
};

export default meta;
type Story = StoryObj<typeof AccountTypePicker>;

/** The default view of the `AccountTypePicker`. */
export const Default: Story = {
    args: {
        label: "Type"
    }
};

/** An example of the `AccountTypePicker` with fewer types to pick from. */
export const FewerTypes: Story = {
    args: {
        label: "Type",
        typesToShow: [Account.ASSET, Account.LIABILITY]
    }
};

/** The small (mobile) view of the `AccountTypePicker`.
 *
 *  This is the more realistic view, since the picker is primarily used in the `AccountForm`,
 *  which has a very constrained width (being in the Sidebar and all). */
export const Small: Story = {
    args: {
        label: "Type"
    }
};

Small.parameters = smallViewport;

/** The disabled view of the `AccountTypePicker`. */
export const Disabled: Story = {
    args: {
        label: "Type",
        disabled: true
    }
};
