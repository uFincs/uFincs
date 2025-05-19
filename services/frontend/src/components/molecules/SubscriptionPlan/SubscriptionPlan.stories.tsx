import type {Meta, StoryObj} from "@storybook/react";
import SubscriptionPlan from "./SubscriptionPlan";

const meta: Meta<typeof SubscriptionPlan> = {
    title: "Molecules/Subscription Plan",
    component: SubscriptionPlan,
    args: {
        className: "SubscriptionPlan--story",
        alternativePeriod: "year",
        alternativePrice: "120",
        monthlyPrice: "10.00",
        name: "Annually",
        percentOff: "50",
        selected: false
    }
};

export default meta;
type Story = StoryObj<typeof SubscriptionPlan>;

/** The monthly plan version of `SubscriptionPlan`. */
export const Monthly: Story = {
    args: {
        alternativePeriod: "year",
        monthlyPrice: "20.00",
        name: "Monthly"
    }
};

/** The annual plan version of `SubscriptionPlan`. */
export const Annually: Story = {
    args: {
        alternativePeriod: "year",
        alternativePrice: "120",
        monthlyPrice: "10.00",
        name: "Annually",
        percentOff: "50"
    }
};

/** The lifetime plan version of `SubscriptionPlan`. */
export const Lifetime: Story = {
    args: {
        alternativePrice: "400",
        name: "Lifetime"
    }
};
