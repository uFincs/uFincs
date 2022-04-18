import {AnyDate, Cents, Millipercents} from "utils/types";

// Note: These imports are relative so that this module (ValueFormatting) can be used in Cypress
// tests. We can't use files that use absolute imports in Cypress tests (because Cypress
// uses a separate TypeScript config).
import DateService from "./DateService";
import ValueConversion from "./ValueConversion";

export default class ValueFormatting {
    /** Formats money (in cents) for display.
     *
     *  By default, it is formatted with a dollar sign, with an (as applicable) negative sign,
     *  and with decimal places, but each of those things can be optionally turned off.
     *
     *  Examples, with -123456 as input:
     *
     *  Default: "-$1,234.56"
     *
     *  Without Dollar Sign:    "-1,234.56"
     *  Without Negative Sign:  "$1,234.56"
     *  Without Decimals:       "-$1,234" */
    static formatMoney(
        cents: Cents,
        {
            currencySymbol = "$",
            withoutDollarSign = false,
            withoutNegativeSign = false,
            withoutDecimals = false
        } = {}
    ): string {
        const negative = cents < 0;
        const dollars = Math.abs(ValueConversion.convertCentsToDollars(cents));

        let withSymbols = `${withoutDollarSign ? "" : currencySymbol}${dollars.toLocaleString()}`;

        if (negative && !withoutNegativeSign) {
            withSymbols = `-${withSymbols}`;
        }

        if (dollars % 1 === 0 && !withoutDecimals) {
            return `${withSymbols}.00`;
        } else if ((dollars * 10) % 1 === 0 && !withoutDecimals) {
            // Add a trailing zero when the cents is divisible by 10.
            // e.g. turn "1.1" into "1.10".
            return `${withSymbols}0`;
        } else if (withoutDecimals) {
            return withSymbols.split(".")[0];
        } else {
            return withSymbols;
        }
    }

    /** Formats a date for display purposes.
     *
     *  By default, it is formatted as "Tuesday, Aug 11" (long weekday, short month, numeric date).
     *
     *  But if the date is outside of the current year or the `useFullYear` option is set,
     *  then it would be formatted as "Aug 11, 2020" (short month, numeric date, numeric year).
     *
     *  The reason that it gets formatted differently when the date is outside the current year
     *  is so because the default doesn't include the year, so users need a way to know that
     *  dates (transactions) aren't recent. */
    static formatDate(date: AnyDate, {useFullYear = false} = {}): string {
        let dateObject: Date;

        try {
            dateObject = DateService.createUTCDate(date);
        } catch {
            return "";
        }

        const currentYear = DateService.getTodayDate().getUTCFullYear();

        if (dateObject.getUTCFullYear() !== currentYear || useFullYear) {
            return dateObject.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC"
            });
        } else {
            return dateObject.toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
                timeZone: "UTC"
            });
        }
    }

    /** Formats a date like "Jul 12" (short month, numeric date).
     *  This is particularly useful for things like charts, when displaying at most a couple
     *  of months of data. */
    static formatDateAsMonthAndDay(date: AnyDate): string {
        const dateObject = DateService.createUTCDate(date);

        return dateObject.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC"
        });
    }

    /** Formats a date like "Jul '20" (short month, short year).
     *  This is also quite useful things like charts, when displaying many months of data. */
    static formatDateAsShortMonthAndYear(date: AnyDate): string {
        const dateObject = DateService.createUTCDate(date);

        const month = dateObject.toLocaleDateString("en-US", {
            month: "short",
            timeZone: "UTC"
        });

        const year = `${dateObject.getUTCFullYear()}`;

        // This is something like "Jul '20".
        return `${month} '${year.slice(2, 4)}`;
    }

    static formatDateAsYear(date: AnyDate): string {
        const dateObject = DateService.createUTCDate(date);

        return `${dateObject.getUTCFullYear()}`;
    }

    /** Formats a percent like "1.234%".
     *
     *  Since we use 'millipercents', we default to 3 decimal places of significance,
     *  but this can be changed.
     *
     *  The percentage symbol (%) can also be optionally be removed. */
    static formatPercent(
        milliPercents: Millipercents,
        {decimalPlaces = 3, withSignSymbols = false} = {}
    ): string {
        const percentage = ValueConversion.convertMillipercentsToPercent(milliPercents);
        const absPercentage = Math.abs(percentage);

        let finalPercentage = absPercentage.toFixed(decimalPlaces);

        if (withSignSymbols) {
            const sign = percentage > 0 ? "+" : percentage === 0 ? "" : "-";
            finalPercentage = `${sign}${finalPercentage}`;
        }

        return `${finalPercentage}%`;
    }

    /** Capitalizes the first character of a string. */
    static capitalizeString(str: string = ""): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
