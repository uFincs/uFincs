import classNames from "classnames";
import React from "react";
import {useCurrencySymbol} from "hooks/";
import {MathUtils, ValueConversion, ValueFormatting} from "services/";
import {Cents} from "utils/types";
import "./AmountChange.scss";

interface AmountChangeProps {
    /** Custom class name. */
    className?: string;

    /** The 'old' amount, in cents. */
    oldAmount: Cents;

    /** The 'new' amount, in cents. */
    newAmount: Cents;

    /** Whether or not to use a light shade for the amount; for use on dark backgrounds. */
    lightShade?: boolean;

    /** Since percentages are relative to the account/transaction type, an increase for certain
     *  types can can be bad, while a decrease can be good (e.g. a positive increase in expenses
     *  or debts is bad).
     *
     *  The correlation to 'positive is bad' is obviously 'negative is good'.
     *
     *  As such, we need to be able to control which way is which.
     *
     *  Note: Technically the percentage change in Transfers is neither necessarily good nor bad,
     *        but we're labelling it as positiveIsBad = false (i.e. the norm, like Income)
     *        just so that the Transaction types are nicely balanced :)
     */
    positiveIsBad?: boolean;

    /** Whether or not to show the difference between the amounts, along with the percentage. */
    showDifference?: boolean;
}

/** A small component for displaying percentage/difference changes between amounts. */
const AmountChange = ({
    className,
    oldAmount,
    newAmount,
    lightShade = false,
    positiveIsBad = false,
    showDifference = false
}: AmountChangeProps) => {
    const currencySymbol = useCurrencySymbol();

    const oldDollars = ValueConversion.convertCentsToDollars(oldAmount);
    const newDollars = ValueConversion.convertCentsToDollars(newAmount);

    const percent = MathUtils.percentageChange(oldDollars, newDollars);

    // Note: formatMoney expects the amounts in cents, not dollars.
    const formattedDifference = ValueFormatting.formatMoney(newAmount - oldAmount, {
        currencySymbol,
        withoutNegativeSign: true
    });

    const formattedPercent = ValueFormatting.formatPercent(percent, {
        decimalPlaces: 2,
        withSignSymbols: true
    });

    // NaN happens, for example, when both amounts are 0.
    // In that case, we want to just render 'N/A'.
    return isNaN(percent) ? (
        <p
            className={classNames(
                "AmountChange--na",
                {"AmountChange--light-shade": lightShade},
                className
            )}
            // eslint-disable-next-line max-len
            title={`Yeah, there isn't really a 'percentage' for ${currencySymbol}0 to ${currencySymbol}0 :(`}
        >
            N/A
        </p>
    ) : (
        <p
            className={classNames(
                "AmountChange",
                {"AmountChange--light-shade": lightShade},
                {
                    "AmountChange--positive":
                        (percent >= 0 && !positiveIsBad) || (percent < 0 && positiveIsBad),
                    "AmountChange--negative":
                        (percent < 0 && !positiveIsBad) || (percent >= 0 && positiveIsBad)
                },
                className
            )}
            title={`${formattedPercent} change (${formattedDifference} difference)`}
        >
            <span className="AmountChange-percent">{formattedPercent}</span>

            {showDifference && (
                <span className="AmountChange-difference">{` (${formattedDifference})`}</span>
            )}
        </p>
    );
};

export default AmountChange;
