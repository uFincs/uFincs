import {TransactionData} from "models/";
import {AnyDate, Cents, ChartDateInterval, DateAmountDataPoint, UTCDateString} from "utils/types";
import DateService from "./DateService";
import MathUtils from "./MathUtils";
import ValueFormatting from "./ValueFormatting";

interface DateAmountDatum {
    /** Whether or not the current data point is 'active', i.e. being hovered over. */
    active: boolean;

    /** The set of data points given to the chart. */
    data: Array<DateAmountDataPoint>;

    /** Yes, I know, it's weird that the index is a string, but that's how it gives it to us. */
    index: string;
}

type MoneyDomain = [Cents, Cents];

export default class ChartService {
    /** Generates the data points for the Account Balance chart. */
    static generateDateAmountData({
        amountReducer,
        transactionsByDate,
        startingBalance,
        startDate,
        endDate,
        usesRunningBalances = true
    }: {
        amountReducer: (total: Cents, transaction: TransactionData, index: number) => Cents;
        transactionsByDate: Record<string, Array<TransactionData>>;
        startingBalance: Cents;
        startDate: UTCDateString;
        endDate: UTCDateString;
        usesRunningBalances?: boolean;
    }): Array<DateAmountDataPoint> {
        const data: Array<DateAmountDataPoint> = [];

        const dateInterval = ChartService.calculateDateInterval(startDate, endDate);

        // Note: DC = Deconstructed
        //
        // We're using deconstructed dates here instead of regular dates because the normal date
        // comparison methods are quite slow when dealing with _tons_ of data (why? because of the number
        // of date objects they instantiate under the hood).
        //
        // For reference, 80 years of dates makes this method take ~150ms, whereas it's ~30ms with
        // deconstructed dates (5x speedup). This is relevant considering this method is run for each
        // chart, so keeping this method performant is important. With these improvements, the
        // bottleneck is now the rendering of the chart itself, rather than the generation of its data.
        const startDateDC = DateService.deconstructDate(startDate);
        const endDateDC = DateService.deconstructDate(endDate);

        // Need to copy the start date so that it doesn't have the same reference.
        let currentDateDC = {...startDateDC};

        // The index is a counter for how many data points are being created.
        let index = 0;

        // Each iteration of this loop is 1 data point in the chart, regardless of date interval.
        while (DateService.isLessThanOrEqualDeconstructed(currentDateDC, endDateDC)) {
            let amount = !usesRunningBalances
                ? 0
                : DateService.isSameDayDeconstructed(currentDateDC, startDateDC)
                  ? startingBalance
                  : data[index - 1].amount;

            // Need to turn `currentDateDC` back into a string for keying `transactionsByDate`.
            let currentDate = DateService.reconstructDateToUTCString(currentDateDC);

            const intervalEndDateDC = DateService.deconstructDate(
                ChartService._getLastDayInInterval(currentDate, dateInterval)
            );

            // This loop will sum up all the dates in the date interval to create a single amount
            // for the end of the interval (i.e. the data point).
            //
            // For example, if the interval was set to months, then this loop will loop over all
            // the days of the month, adding together all the amounts to get one total amount for
            // the month, which would then be the data point displayed in the chart.
            while (
                DateService.isLessThanOrEqualDeconstructed(currentDateDC, intervalEndDateDC) &&
                // Make sure we don't go past the end date.
                DateService.isLessThanOrEqualDeconstructed(currentDateDC, endDateDC)
            ) {
                currentDate = DateService.reconstructDateToUTCString(currentDateDC);

                // It is imperative that this uses a nullish coalescing operator here instead of an OR.
                // Otherwise, if the reduced amount is 0, then it'll shortcut back to the old amount.
                // No bueno.
                amount = transactionsByDate?.[currentDate]?.reduce(amountReducer, amount) ?? amount;

                // The final iteration of the loop will increment the current date so that
                // it's ready for the next data point loop.
                currentDateDC = DateService.addDayDeconstructed(currentDateDC);
            }

            const dataPoint = {
                amount,
                date: DateService.createUTCDate(currentDate)
            };

            data.push(dataPoint);

            // Remember, the index and the current date aren't tied together (except when the
            // interval is in days), as the index represents the number of data points.
            // As such, it is a number of days or weeks or months or years, but not _always_ days.
            index += 1;
        }

        return data;
    }

    /** Splits a given data set into two separate lists: current and future.
     *
     *  This is used (currently) for things like the Date/Amount line charts so that we can style
     *  the future data differently. */
    static splitCurrentFutureData(
        data: Array<DateAmountDataPoint>,
        dateInterval: ChartDateInterval
    ): {currentData: Array<DateAmountDataPoint>; futureData: Array<DateAmountDataPoint>} {
        const today = DateService.getTodayDate();
        const todayTime = today.getTime();

        const result: {
            currentData: Array<DateAmountDataPoint>;
            futureData: Array<DateAmountDataPoint>;
        } = {currentData: [], futureData: []};

        for (let i = 0; i < data.length; i++) {
            const point = data[i];
            const {date} = point;

            const pointTime = date.getTime();

            if (
                // The following conditions handle linking the current and future data sets together,
                // so that there isn't a gap between the two sets on the chart.
                //
                // The first condition is the simplest: when the data point is for today (and the interval
                // is in days), take the point and add it to both data sets.
                //
                // The second condition is slightly more complicated: we basically want to take the point
                // that comes right after today (or _is_ today), and add it to both data sets.
                (dateInterval === ChartDateInterval.days && pointTime === todayTime) ||
                (dateInterval !== ChartDateInterval.days &&
                    data?.[i - 1]?.date?.getTime() <= todayTime &&
                    todayTime <= pointTime)
            ) {
                result.currentData.push(point);
                result.futureData.push(point);
            } else if (DateService.isLessThan(date, today)) {
                result.currentData.push(point);
            } else {
                result.futureData.push(point);
            }
        }

        return result;
    }

    /** Calculates the type of date interval being used based on the number of days
     *  between the start and end date. The rational behind this is that as the number of days
     *  between the start and end date increases, we want to compress/aggregate the data so that
     *  overall trends are more easily visible.
     *
     *  Also so that we don't have to generate as many points to optimize chart performance. */
    static calculateDateInterval(
        startDate: UTCDateString,
        endDate: UTCDateString
    ): ChartDateInterval {
        const daysBetween = DateService.daysBetween(startDate, endDate);

        return daysBetween <= 60
            ? ChartDateInterval.days
            : // 180 days = ~1/2 year or 6 months
              daysBetween <= 180
              ? ChartDateInterval.weeks
              : // 1800 days = ~5 years
                daysBetween <= 1800
                ? ChartDateInterval.months
                : ChartDateInterval.years;
    }

    // Note: Need the tuple type otherwise the domain prop of the chart complains about it.
    static calculateMoneyDomain(amounts: Array<Cents> | Array<DateAmountDataPoint>): MoneyDomain {
        if (amounts.length > 0 && typeof amounts[0] === "object") {
            amounts = (amounts as Array<DateAmountDataPoint>).map(({amount}) => amount);
        }

        amounts = amounts as Array<Cents>;

        const min = Math.min(...amounts);
        const max = Math.max(...amounts);

        // Add an offset so that the line doesn't hit the very top or very bottom of the chart.
        // Use the nearest order of magnitude of the min _as a minimum_, in case the difference
        // is very small.
        const offset =
            max === min ? MathUtils.nearestOrderOfMagnitude(min) / 10 : Math.abs((max - min) / 4);

        // If the min is less than 0, that means we have a negative amount at some point.
        // That means we want the domain to go below 0. But if we don't have a negative amount,
        // then we need to make sure subtracting the offset doesn't cause the domain to go
        // negative, cause then it'd just look stupid.
        const offsetMin = min < 0 ? min - offset : Math.max(min - offset, 0);
        let offsetMax = max + offset;

        // Having the min and max of the domain as the same number is considered 'invalid' by
        // the chart. Need to add a little something extra to the max in this case, just
        // to make it different.
        // Note: A common reason this happens is that the amount is always 0.
        if (offsetMin === offsetMax) {
            offsetMax = offsetMin + 100;
        }

        return [offsetMin, offsetMax];
    }

    /** Formats the labels for an (x-)axis as dates.
     *
     *  Uses a cache because this function is called a lot (every time the user's cursor
     *  moves over a chart... for each data label). */
    static formatDateLabels(dateInterval: ChartDateInterval) {
        const cache: Record<number, string> = {};

        return (date: Date) => {
            const time = date.getTime();

            if (time in cache) {
                return cache[time];
            } else {
                let label = "";

                if (
                    dateInterval === ChartDateInterval.days ||
                    dateInterval === ChartDateInterval.weeks
                ) {
                    // When the interval is days or weeks, we want the labels to be days.
                    // This gets us something like "Jul 1".
                    label = ValueFormatting.formatDateAsMonthAndDay(date);
                } else if (dateInterval === ChartDateInterval.months) {
                    // Look, dates are frigging mystical. When using a monthly interval, the scale
                    // gives back dates that are off by one month.
                    // Buuut... if we subtract a day, then it's all good!
                    date = DateService.subtractDays(date, 1);
                    label = ValueFormatting.formatDateAsShortMonthAndYear(date);
                } else if (dateInterval === ChartDateInterval.years) {
                    date = DateService.subtractDays(date, 1);
                    label = ValueFormatting.formatDateAsYear(date);
                }

                cache[time] = label;
                return label;
            }
        };
    }

    /** Formats the labels for a (y-)axis as money.
     *
     *  Uses a cache because this function is called a lot (every time the user's cursor
     *  moves over a chart... for each data label). */
    static formatMoneyLabels(moneyDomain: MoneyDomain, {currencySymbol = "$"} = {}) {
        const cache: Record<Cents, string> = {};

        return (money: Cents) => {
            if (money in cache) {
                return cache[money];
            } else {
                // When the domain is sufficiently small (here, arbitrarily chosen to be below $5),
                // show the decimal places.
                const domainDifference = moneyDomain[1] - moneyDomain[0];
                const withoutDecimals = domainDifference > 500 || domainDifference === 0;
                const formatted = ValueFormatting.formatMoney(money, {
                    currencySymbol,
                    withoutDecimals
                });

                cache[money] = formatted;
                return formatted;
            }
        };
    }

    /** Formats tooltips that have a date and amount component.
     *
     *  Uses a cache because this function is called a lot (every time the user's cursor
     *  moves over a chart... for each data point). '
     *
     *  @param dateInterval     The size of the data points.
     *  @param prefix           An optional string to put in front of the date.
     *  @param currencySymbol   The currency symbol to format money amounts with. */
    static formatMoneyTooltips(
        dateInterval: ChartDateInterval,
        prefix: string = "",
        {currencySymbol = "$"} = {}
    ) {
        const cache: Record<number, string> = {};

        return (datum: DateAmountDatum) => {
            // Don't bother formatting anything when this isn't an active data point (this function
            // gets called for every data point for every movement of the cursor) for performance
            // reasons.
            if (!datum.active) {
                return "";
            }

            const {data} = datum;

            // The index is a string, for some reason.
            // Convert it to a number for strict equality comparisons below.
            const index = parseInt(datum.index);

            const dataPoint = datum.data[index];
            const date = dataPoint.date as Date;

            // Sometimes, the date just doesn't exist. Sometimes, it's just because
            // our story data sucks. /shrug
            if (!date) {
                return "";
            }

            const time = date.getTime();

            if (time in cache) {
                return cache[time];
            } else {
                const amount = dataPoint.amount as Cents;
                const formattedAmount = ValueFormatting.formatMoney(amount, {currencySymbol});

                const formattedDate = ValueFormatting.formatDateAsMonthAndDay(date);

                let tooltip = "";

                if (dateInterval === ChartDateInterval.days) {
                    // When there are newlines, Victory automatically converts each piece
                    // into a separate tspan element.
                    // This is why the Tooltip's label styles use arrays.
                    tooltip = `${prefix}${formattedDate}\n${formattedAmount}`;
                } else if (dateInterval === ChartDateInterval.weeks) {
                    // When this is the last data point in the chart, we need to check how
                    // many days away it is from the second-to-last data point, since they can
                    // be less than a week apart.
                    const dateSubtraction =
                        data.length > 1 && index === data.length - 1
                            ? DateService.daysBetween(data[index - 1].date, date) - 1
                            : 6;

                    const weekStart = DateService.subtractDays(date, dateSubtraction);
                    const formattedWeekStart = ValueFormatting.formatDateAsMonthAndDay(weekStart);

                    // When the start of the week is the same as the date, we should only show
                    // the date. This can happen when the date of the last data point is the day
                    // after the date of the second-to-last data point (i.e. dateSubtraction
                    // ends up as 0).
                    if (formattedWeekStart === formattedDate) {
                        tooltip = `${prefix}${formattedDate}\n${formattedAmount}`;
                    } else {
                        tooltip = `${prefix}${formattedWeekStart} - ${formattedDate}\n${formattedAmount}`;
                    }
                } else if (dateInterval === ChartDateInterval.months) {
                    const formattedMonth = ValueFormatting.formatDateAsShortMonthAndYear(date);
                    tooltip = `${prefix}${formattedMonth}\n${formattedAmount}`;
                } else if (dateInterval === ChartDateInterval.years) {
                    const formattedYear = ValueFormatting.formatDateAsYear(date);
                    tooltip = `${prefix}${formattedYear}\n${formattedAmount}`;
                }

                cache[time] = tooltip;
                return tooltip;
            }
        };
    }

    /** Charts can want the x-axis tick labels to have an angle so that they fit better on
     *  small screens. If we calculate the angle as a function of the width of the chart, then
     *  we can get this nice smooth rotation animation as the width decreases (which really only
     *  matters for us, the devs, since what users are just going to be changing the viewport
     *  size constantly...). */
    static calculateTickLabelAngle(width: number): number {
        // Subtract from 90 so that the angle starts from 0 when the width is sufficiently large.
        // Bound the angle between 90 degrees and 0 so that it doesn't go crazy.
        // Make the final angle negative so that the angle rotates counter-clockwise as the
        // width decreases.
        return -(90 - MathUtils.boundNumber(width / 5, 90, 0));
    }

    /** This calculates how much padding there should be on the y-axis (i.e. the left padding
     *  of the chart) based on how long the max amount in the data is. */
    static calculateYAxisPadding(amounts: Array<Cents> | Array<DateAmountDataPoint>): number {
        if (amounts.length > 0 && typeof amounts[0] === "object") {
            amounts = (amounts as Array<DateAmountDataPoint>).map(({amount}) => amount);
        }

        amounts = amounts as Array<Cents>;

        const max = Math.max(...amounts);

        // 60 = The default 50 + 10. Why? Because, I wanted more default padding as a baseline.
        // Why 4 * length? Because it just looks/feels right.
        return 60 + 4 * max.toString().length;
    }

    static _getLastDayInInterval(date: AnyDate, dateInterval: ChartDateInterval): Date {
        if (dateInterval === ChartDateInterval.weeks) {
            return DateService.addDays(date, 6);
        } else if (dateInterval === ChartDateInterval.months) {
            return DateService.getLastDayInMonth(date);
        } else if (dateInterval === ChartDateInterval.years) {
            return DateService.getLastDayInYear(date);
        } else {
            return DateService.createUTCDate(date);
        }
    }
}
