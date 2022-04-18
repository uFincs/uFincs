import {actions} from "@storybook/addon-actions";
import React from "react";
import {PureComponent as SubscriptionPlanForm} from "./SubscriptionPlanForm";

export default {
    title: "Organisms/Subscription Plan Form",
    component: SubscriptionPlanForm,
    parameters: {
        backgrounds: {
            default: "Dark"
        }
    }
};

const formActions = actions("onCancel", "onCheckout");

/** The default view of `SubscriptionPlanForm`. */
export const Default = () => <SubscriptionPlanForm {...formActions} />;
