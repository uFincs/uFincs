import classNames from "classnames";
import {animated, to as interpolate, useSpring} from "react-spring";
import {useCurrencySymbol} from "hooks/";
import {ValueFormatting} from "services/";
import {Cents} from "utils/types";
import "./CurrentAmount.scss";

interface CurrentAmountProps {
    /** Custom class name. */
    className?: string;

    /** The (current) amount to display. */
    amount: Cents;

    /** Whether or not to use a light shade for the amount; for use on dark backgrounds. */
    lightShade?: boolean;
}

/** A small component for display the current amount in things like the Transaction Type filters
 *  or the Account Summaries. */
const CurrentAmount = ({className, amount, lightShade}: CurrentAmountProps) => {
    const currencySymbol = useCurrencySymbol();

    const formattedAmount = ValueFormatting.formatMoney(amount, {
        currencySymbol,
        withoutDollarSign: true
    });

    const {cents} = useSpring({
        // Why is it called cents? Because amount is already taken and they're effectively the same thing.
        // Also, using this setup (without a `from` amount) makes it so that the amounts don't animate
        // on first render -- this is intended.
        //
        // Also, need to use 0 as a default, because if an undefined amount happens to sneak through,
        // that'll make react-spring blow up (specifically, the interpolation).
        cents: amount || 0,
        // This is a much faster, less springy/more linear config.
        // Don't want the animations to last too long, otherwise it's far too distracting.
        // And we _definitely_ don't want the animation to be springy, cause then the numbers will
        // overshoot the endpoint.
        config: {
            mass: 1,
            tension: 400,
            friction: 40
        },
        // Want just a small delay whenever the amount changes, mostly to give time for the Transaction
        // form to close before the user sees the animations, but also because it just _feels_ better.
        delay: 300
    });

    return (
        <p
            className={classNames(
                "CurrentAmount",
                {"CurrentAmount--light-shade": lightShade},
                className
            )}
            title={`${currencySymbol}${formattedAmount}`}
        >
            <span className="CurrentAmount-dollar-sign">{currencySymbol}</span>

            {/* @ts-expect-error Missing children prop: https://github.com/pmndrs/react-spring/issues/2358 */}
            <animated.span className="CurrentAmount-amount">
                {interpolate([cents], (cents) =>
                    // Need to floor the cents since react-spring will give it decimal places.
                    // And we don't want decimal places because then `formatMoney` will format it
                    // to 3 decimal places, which looks really silly while the amounts are animating.
                    ValueFormatting.formatMoney(Math.floor(cents), {
                        currencySymbol,
                        withoutDollarSign: true
                    })
                )}
            </animated.span>
        </p>
    );
};

export default CurrentAmount;
