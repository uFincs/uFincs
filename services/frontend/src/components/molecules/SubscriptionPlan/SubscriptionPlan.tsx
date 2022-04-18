import classNames from "classnames";
import React from "react";
import {ListItemCheckbox, TextField} from "components/atoms";
import "./SubscriptionPlan.scss";

interface SubscriptionPlanProps {
    /** Custom class name. */
    className?: string;

    /** [optional] If this plan is billed in an alternative period (to monthly), this is it. */
    alternativePeriod?: string;

    /** [optional] If this plan is billed in an alternative period, then this is the amount that is
     *  billed per one of those alternative periods.
     *
     *  If `alternativePrice` gets passed but _not_ `monthlyPrice`, then the `alternativePrice` is
     *  considered to be a 'lifetime' price (aka a pay-once price). */
    alternativePrice?: string;

    /** The monthly price (or equivalent) of this plan. */
    monthlyPrice?: string;

    /** The name of this plan. */
    name: string;

    /** [optional] If this plan is billed in an alternative period, then the percent off is how much
     *  the user saves by choosing plan in an alternative period to monthly. */
    percentOff?: string;

    /** Whether or not the user has selected this plan. */
    selected: boolean;

    /** Handler for when this plan becomes selected. */
    onSelected: () => void;
}

/** The view for displaying a single subscription plan that the user can choose from. */
const SubscriptionPlan = ({
    className,
    alternativePeriod,
    alternativePrice,
    monthlyPrice,
    name,
    percentOff,
    selected = false,
    onSelected
}: SubscriptionPlanProps) => (
    <div
        className={classNames(
            "SubscriptionPlan",
            {"SubscriptionPlan--selected": selected},
            className
        )}
        onClick={onSelected}
    >
        <div className="SubscriptionPlan-left-section">
            <ListItemCheckbox
                aria-label="Select Plan"
                checked={selected}
                tabIndex={selected ? 0 : -1}
                onCheck={onSelected}
            />

            <div className="SubscriptionPlan-name-container">
                <TextField className="SubscriptionPlan-name">{name}</TextField>

                {percentOff && (
                    <TextField className="SubscriptionPlan-percent-off">
                        Save {percentOff}%
                    </TextField>
                )}

                {!percentOff && alternativePrice && !monthlyPrice && (
                    <TextField className="SubscriptionPlan-percent-off">Only pay once!</TextField>
                )}
            </div>
        </div>

        <div className="SubscriptionPlan-right-section">
            {monthlyPrice && (
                <div className="SubscriptionPlan-price-container">
                    <TextField className="SubscriptionPlan-price">${monthlyPrice}</TextField>
                    <TextField className="SubscriptionPlan-month">/ month</TextField>
                </div>
            )}

            {alternativePrice && !monthlyPrice && (
                <div className="SubscriptionPlan-price-container">
                    <TextField className="SubscriptionPlan-price">${alternativePrice}</TextField>
                </div>
            )}

            {alternativePrice && monthlyPrice && (
                <div className="SubscriptionPlan-alternative-price-container">
                    <TextField className="SubscriptionPlan-alternative-price">
                        billed as ${alternativePrice} / {alternativePeriod}
                    </TextField>
                </div>
            )}
        </div>
    </div>
);

export default SubscriptionPlan;
