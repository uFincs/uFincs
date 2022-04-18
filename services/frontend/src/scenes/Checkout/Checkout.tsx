import classNames from "classnames";
import React from "react";
import {SubscriptionPlanForm} from "components/organisms";
import "./Checkout.scss";

interface CheckoutProps {
    /** Custom class name. */
    className?: string;
}

/** The scene for letting a user pick their subscription plan and then checking out. */
const Checkout = ({className}: CheckoutProps) => (
    <div className={classNames("Checkout", className)}>
        <SubscriptionPlanForm />
    </div>
);

export default Checkout;
