import classNames from "classnames";
import {useCurrencySymbol} from "hooks/";
import {ValueFormatting} from "services/";
import {Cents} from "utils/types";
import "./FromAmount.scss";

interface FromAmountProps {
    /** Custom class name. */
    className?: string;

    /** The amount to display. */
    amount: Cents;

    /** Whether or not to use a light shade for the amount; for use on dark backgrounds. */
    lightShade?: boolean;
}

/** A small component for display the 'From' amount in things like the Transaction Type filters
 *  or the Account Summaries. */
const FromAmount = ({className, amount, lightShade}: FromAmountProps) => {
    const currencySymbol = useCurrencySymbol();
    const formattedAmount = ValueFormatting.formatMoney(amount, {currencySymbol});

    return (
        <p
            className={classNames("FromAmount", {"FromAmount--light-shade": lightShade}, className)}
            title={`from ${formattedAmount}`}
        >
            from
            <span className="FromAmount-amount"> {formattedAmount}</span>
        </p>
    );
};

export default FromAmount;
