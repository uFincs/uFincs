import {actions} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import {PureComponent as SubscriptionPlanForm} from "./SubscriptionPlanForm";

const meta: Meta<typeof SubscriptionPlanForm> = {
    title: "Organisms/Subscription Plan Form",
    component: SubscriptionPlanForm,
    parameters: {
        backgrounds: {
            default: "Dark"
        }
    }
};

export default meta;
type Story = StoryObj<typeof SubscriptionPlanForm>;

const formActions = actions("onCancel", "onCheckout");

/** The default view of `SubscriptionPlanForm`. */
export const Default: Story = {
    args: {},
    render: () => <SubscriptionPlanForm {...formActions} />
};
