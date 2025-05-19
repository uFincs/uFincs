import {actions} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as Billing} from "./Billing";

const meta: Meta<typeof Billing> = {
    title: "Scenes/Settings/Sections/Billing",
    component: Billing
};

export default meta;
type Story = StoryObj<typeof Billing>;

const formActions = actions("gotoCustomerPortal");

/** The default view of `Billing`. */
export const Default: Story = {
    args: {},
    render: () => <Billing {...formActions} />
};
