import {actions} from "@storybook/addon-actions";
import {boolean, text} from "@storybook/addon-knobs";
import React from "react";
import SubscriptionPlan from "./SubscriptionPlan";

export default {
    title: "Molecules/Subscription Plan",
    component: SubscriptionPlan
};

const planActions = actions("onSelected");

const alternativePeriod = (value = "year") => text("Alternative Period", value);
const alternativePrice = (value = "120") => text("Alternative Price", value);
const monthlyPrice = (value = "10.00") => text("Monthly Price", value);
const name = (value = "Annually") => text("Name", value);
const percentOff = (value = "50") => text("Percent Off", value);
const selected = () => boolean("Selected", false);

/** The monthly plan version of `SubscriptionPlan`. */
export const Monthly = () => (
    <SubscriptionPlan
        className="SubscriptionPlan--story"
        alternativePeriod={alternativePeriod()}
        alternativePrice={alternativePrice("")}
        monthlyPrice={monthlyPrice("20.00")}
        name={name("Monthly")}
        percentOff={percentOff("")}
        selected={selected()}
        {...planActions}
    />
);

/** The annual plan version of `SubscriptionPlan`. */
export const Annually = () => (
    <SubscriptionPlan
        className="SubscriptionPlan--story"
        alternativePeriod={alternativePeriod()}
        alternativePrice={alternativePrice()}
        monthlyPrice={monthlyPrice()}
        name={name()}
        percentOff={percentOff()}
        selected={selected()}
        {...planActions}
    />
);

/** The lifetime plan version of `SubscriptionPlan`. */
export const Lifetime = () => (
    <SubscriptionPlan
        className="SubscriptionPlan--story"
        alternativePeriod={alternativePeriod("")}
        alternativePrice={alternativePrice("400")}
        monthlyPrice={monthlyPrice("")}
        name={name("Lifetime")}
        percentOff={percentOff("")}
        selected={selected()}
        {...planActions}
    />
);
