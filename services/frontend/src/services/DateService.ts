import {AnyDate, UTCDate, UTCDateString} from "utils/types";

export interface DeconstructedDate {
    year: number;
    month: number;
    day: number;
}

const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

// Taken from https://stackoverflow.com/a/64936088.
const UTC_DATE_STRING_REGEX = /^\d{4}-([0][1-9]|1[0-2])-([0-2][1-9]|[1-3]0|3[01])$/;

const getDaysInMonth = (month: number | string): number => {
    if (typeof month === "string") {
        month = parseInt(month);
    }

    // Using 2021 here just as any non leap-year year. We're not gonna bother
    // supporting doing stuff like recurring transactions on _just_ Feb 29.
    //
    // Also, we add 1 to the month to take advantage of the '0' day that gets us the last day
    // of the 'previous' month (or something). Because months are 0-indexed instead of 1-indexed.
    //
    // Yeah, it's just jank.
    return new Date(2021, month + 1, 0).getDate();
};

const MONTH_DAY_COUNTS = [...Array(12).keys()].reduce((acc, month) => {
    acc[month] = getDaysInMonth(month);
    return acc;
}, {} as Record<number, number>);

// Note:
//
// For the purposes of this service, a "UTC String" refers to an ISO 8601 date string,
// i.e. "yyyy-mm-dd" or e.g. "2020-01-01".
// NOTE: "2020-1-1" _DOES NOT COUNT_. Unfortunately, that matters.
//
// Additionally, a "UTC Date" (i.e. the `UTCDate` type) refers to regular JavaScript Date object
// that has been constructed with a "UTC String" as the argument. This actually changes
// the functionality of the Date object from using local time to using UTC time.
//
// As far as I'm aware, this is the only way to construct a new Date object using UTC time.
//
// Why UTC time? Cause timezones suck, we don't care about time, and we only want dates.

export default class DateService {
    static MONTH_DAY_COUNTS = MONTH_DAY_COUNTS;

    // This is used by the RecurringTransaction to denote the cutoff point for when yearly
    // dates need to be adjusted during leap years.
    //
    // That is, this value represents March 1 in "day of year" notation for regular years.
    //
    // So why is it in DateService instead of the RecurringTransaction model? Cause of import order.
    // That is, if we try to derive this value in the model file outside of a function call,
    // DateService will be undefined. So we can't.
    static YEARLY_LEAP_YEAR_CUTOFF = getDaysInMonth(0) + getDaysInMonth(1);

    /** Makes sure the given value is a valid Date object. */
    static isValidDate(date: unknown): boolean {
        return date instanceof Date && !isNaN(date.getTime());
    }

    /** Makes sure the given value is a valid Date value (can be a string, number or Date). */
    static isValidDateValue(date: AnyDate): boolean {
        return DateService.isValidDate(new Date(date));
    }

    /** Creates a date object in the user's local timezone.
     *
     *  As a rule of thumb, this should _not_ be used. `createUTCDate` should be used instead.
     *  There are very few instances where we care about time (created/updated at timestamps
     *  being the prime example); otherwise, we only care about the date, and UTC dates are
     *  better for that. */
    static createDate(date: AnyDate): Date {
        if (date) {
            const dateObject = new Date(date);

            if (DateService.isValidDate(dateObject)) {
                return dateObject;
            }
        }

        throw new Error("Invalid date");
    }

    /** Creates an ISO 8061 date string (i.e. "yyyy-mm-dd"). */
    static createUTCString(year: number, month: number, day: number): UTCDateString {
        // Add 1 because it expects a 0-indexed month, like the Date constructor.
        month = month + 1;

        // Have to pad the month/day with a leading 0 for values less than 10, otherwise
        // it doesn't count as a valid UTC string. This results in the date being in local
        // timezone instead of UTC.
        const monthString = month < 10 ? `0${month}` : `${month}`;
        const dayString = day < 10 ? `0${day}` : `${day}`;

        return `${year}-${monthString}-${dayString}` as UTCDateString;
    }

    /** Creates a UTC date from the year/month/day parts.
     *
     *  This is used as a replacement for calling `new Date(year, month, day)`. */
    static createUTCDateFromParts(year: number, month: number, day: number): UTCDate {
        const string = DateService.createUTCString(year, month, day);
        return new Date(string) as UTCDate;
    }

    /** Creates a date object in UTC time.
     *
     *  This should be the default way of dealing with dates. */
    static createUTCDate(date: AnyDate): UTCDate {
        if (date) {
            const dateObject = new Date(date);

            if (DateService.isValidDate(dateObject)) {
                return DateService.createUTCDateFromParts(
                    dateObject.getUTCFullYear(),
                    dateObject.getUTCMonth(),
                    dateObject.getUTCDate()
                ) as UTCDate;
            }
        }

        throw new Error("Invalid date");
    }

    /** Converts a date to an ISO timestamp, _with time_. Yes, this is the only actual
     *  function where the time matters.
     *
     *  Why? Because it's used for the createdAt/updatedAt properties of the models.
     *  They are literally the only things that care about time.
     *
     *  Everything else is just the date. */
    static convertToTimestamp(date: AnyDate): string {
        if (!(date instanceof Date)) {
            // Use createDate because timestamps are used for createdAt/updatedAt, and it needs
            // to preserve the time.
            date = DateService.createDate(date);
        }

        return date.toISOString();
    }

    /** Returns whether or not the string is a UTC string. */
    static isUTCString(date: string): date is UTCDateString {
        return !!date.match(UTC_DATE_STRING_REGEX);
    }

    /** The format of an input of type='date' is `yyyy-mm-dd`, which is the date component
     *  of the ISO format (i.e. what we use for the timestamp format above). */
    static convertToUTCString(date: AnyDate): UTCDateString {
        // If the date is already a UTC string, just return it.
        // Doing the regex check is _much_ faster than having to instantiate a date object and format it.
        if (typeof date === "string" && DateService.isUTCString(date)) {
            return date as UTCDateString;
        }

        if (!(date instanceof Date)) {
            date = DateService.createUTCDate(date);
        }

        return date.toISOString().split("T")[0] as UTCDateString;
    }

    /** Validates a date string as a 'UTC Date String' (i.e. an ISO 8061 string).
     *
     *  Acts as a type guard for TypeScript. */
    static validateUTCString(date: string): UTCDateString {
        if (DateService.isUTCString(date)) {
            return date as UTCDateString;
        } else {
            throw new Error(`Invalid UTC date string: ${date}`);
        }
    }

    /** Gets today as a UTC date. */
    static getTodayDate(): UTCDate {
        const today = new Date();

        return DateService.createUTCDateFromParts(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );
    }

    /** Gets today, as a date with time.
     *  Used for the createdAt/updatedAt times of the models. Doesn't need to be UTC. */
    static getTodayDateTime(): Date {
        const today = new Date();

        // Honestly, I have no idea why this is implemented like this. Was too long ago.
        // I don't _think_ this implementation is any different from just `new Date()`,
        // but I'm not about to change it now.
        return new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            today.getHours(),
            today.getMinutes(),
            today.getSeconds()
        );
    }

    /** Get today's date (no time) in the ISO format of yyyy-mm-dd, which is used
     *  by inputs of type 'date'. */
    static getTodayAsUTCString(): UTCDateString {
        return DateService.convertToUTCString(DateService.getTodayDate());
    }

    /** Get a UTC date of the first day of the current month.
     *  Used for things like the date range picker. */
    static getCurrentMonth(): UTCDate {
        const date = DateService.getTodayDate();
        date.setUTCDate(1);

        return date;
    }

    /** Get a UTC date of the last day of the current month.
     *  Used for things like the date range picker. */
    static getCurrentMonthLastDay(): UTCDate {
        return DateService.getLastDayInMonth(DateService.getTodayDate());
    }

    /** Strips the time (i.e. sets hours/minutes/seconds to 0) of a date. */
    static stripTime(date: AnyDate): UTCDate {
        const dateObject = DateService.createUTCDate(date);

        dateObject.setUTCHours(0);
        dateObject.setUTCMinutes(0);
        dateObject.setUTCSeconds(0);

        return dateObject;
    }

    /** Deconstructs a date into its year/month/day as an object.
     *  Useful for doing certain date arithmetic. */
    static deconstructDate(date: AnyDate): DeconstructedDate {
        const dateObject = DateService.createUTCDate(date);

        return {
            year: dateObject.getUTCFullYear(),
            month: dateObject.getUTCMonth(),
            day: dateObject.getUTCDate()
        };
    }

    /** Reconstructs a date object from its deconstructed year/month/day parts. */
    static reconstructDate(date: DeconstructedDate): UTCDate {
        return DateService.createUTCDateFromParts(date.year, date.month, date.day);
    }

    /** Reconstructs the parts of a date into a UTC date string.
     *  Used as an optimization for certain indexing/caching structures. */
    static reconstructDateToUTCString(date: DeconstructedDate): UTCDateString {
        return DateService.createUTCString(date.year, date.month, date.day);
    }

    /** Gets the first day in the month of the given date. */
    static getFirstDayInMonth(date: AnyDate): UTCDate {
        const dateObject = DateService.createUTCDate(date);

        const firstDay = DateService.createUTCDateFromParts(
            dateObject.getUTCFullYear(),
            dateObject.getUTCMonth(),
            1
        );

        return firstDay;
    }

    /** Gets the last day in the month of the given date. */
    static getLastDayInMonth(date: AnyDate): UTCDate {
        const dateObject = DateService.createUTCDate(date);

        const lastDay = new Date(dateObject.getUTCFullYear(), dateObject.getUTCMonth() + 1, 0);

        return DateService.createUTCDateFromParts(
            lastDay.getUTCFullYear(),
            lastDay.getUTCMonth(),
            // NOTE: It is important that this is `getDate` instead of `getUTCDate`, because
            // `lastDay` is a normal, timezone dependent date.
            lastDay.getDate()
        );
    }

    /** Gets the first day in the year of the given date. */
    static getFirstDayInYear(date: AnyDate): UTCDate {
        const dateObject = DateService.createUTCDate(date);
        return DateService.createUTCDateFromParts(dateObject.getUTCFullYear(), 0, 1);
    }

    /** Gets the lsat day in the year of the given date. */
    static getLastDayInYear(date: AnyDate): UTCDate {
        const dateObject = DateService.createUTCDate(date);
        return DateService.createUTCDateFromParts(dateObject.getUTCFullYear(), 11, 31);
    }

    /** Gets the number of days in a month (ignoring leap years). */
    static getDaysInMonth(month: number | string): number {
        return getDaysInMonth(month);
    }

    /** Converts a month/day pair into a number representing the day of the year (ignoring leap years). */
    static getDayOfYear(month: number | string, day: number | string): number {
        month = typeof month === "string" ? parseInt(month) : month;
        day = typeof day === "string" ? parseInt(day) : day;

        let dayOfYear = 0;

        for (let i = 0; i <= month; i++) {
            if (i === month) {
                dayOfYear += day;
            } else {
                dayOfYear += MONTH_DAY_COUNTS[i];
            }
        }

        return dayOfYear;
    }

    /** Converts a number representing a day of the year into a month/day pair (ignoring leap years). */
    static getMonthDayFromDayOfYear(dayOfYear: number | string): {month: number; day: number} {
        dayOfYear = typeof dayOfYear === "string" ? parseInt(dayOfYear) : dayOfYear;

        let month = 0;
        let day = 0;

        for (let i = 0; i < Object.keys(MONTH_DAY_COUNTS).length; i++) {
            month = i;

            // Because `dayOfYear` is 1-indexed (and MONTH_DAY_COUNTS are 1-indexed),
            // use '<=' rather than '<'.
            if (dayOfYear <= MONTH_DAY_COUNTS[i]) {
                day = dayOfYear;

                return {month, day};
            } else {
                dayOfYear -= MONTH_DAY_COUNTS[i];
            }
        }

        return {month, day};
    }

    /** Used in `useDateRange` to determine whether or not 'today' is in the same month as the given
     *  end date. This way, we can align daily/weekly ranges based on 'today' rather than the end of
     *  the month/other period.  */
    static isTodayInMonth(endDate: AnyDate) {
        const today = DateService.getTodayDate();
        const endDateObject = DateService.createUTCDate(endDate);

        return (
            today.getUTCMonth() === endDateObject.getUTCMonth() &&
            // Note: We also need to ensure the years are the same, otherwise the logic for `useDateRange`
            // becomes quite messed up (i.e. re-aligning to today when we shouldn't).
            today.getUTCFullYear() === endDateObject.getUTCFullYear()
        );
    }

    /** Used in `useDateRange` to determine whether or not 'today' is in the same year as the given
     *  end date. This way, we align the monthly range based on 'today' rather than the end of the range. */
    static isTodayInYear(endDate: AnyDate) {
        const today = DateService.getTodayDate();
        const endDateObject = DateService.createUTCDate(endDate);

        return today.getUTCFullYear() === endDateObject.getUTCFullYear();
    }

    /** Used in `useDateRange` to determine if the start/end dates share the same month (including year).
     *  This way, we can determine whether or not to align against the month the current range or the
     *  current month. */
    static datesShareMonth(startDate: AnyDate, endDate: AnyDate) {
        const startDateObject = DateService.createUTCDate(startDate);
        const endDateObject = DateService.createUTCDate(endDate);

        return (
            startDateObject.getUTCMonth() === endDateObject.getUTCMonth() &&
            startDateObject.getUTCFullYear() === endDateObject.getUTCFullYear()
        );
    }

    /** Acts as a TypeScript type guard for ensuring a date is a DeconstructedDate. */
    static isDeconstructedDate(date: unknown): date is DeconstructedDate {
        const deconstructedDate = date as DeconstructedDate;

        return (
            deconstructedDate?.year !== undefined &&
            deconstructedDate?.month !== undefined &&
            deconstructedDate?.day !== undefined
        );
    }

    /** Compares two deconstructed dates using '<'. */
    static isLessThanDeconstructed(date1: DeconstructedDate, date2: DeconstructedDate): boolean {
        if (date1.year < date2.year) {
            return true;
        } else if (date1.year === date2.year) {
            if (date1.month < date2.month) {
                return true;
            } else if (date1.month === date2.month) {
                if (date1.day < date2.day) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    /** Compares two deconstructed dates using '<='. */
    static isLessThanOrEqualDeconstructed(
        date1: DeconstructedDate,
        date2: DeconstructedDate
    ): boolean {
        if (date1.year < date2.year) {
            return true;
        } else if (date1.year === date2.year) {
            if (date1.month < date2.month) {
                return true;
            } else if (date1.month === date2.month) {
                if (date1.day <= date2.day) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    /** Tests whether the first date is less than (but not equal) to the second date. */
    static isLessThan(date1: AnyDate, date2: AnyDate): boolean {
        if (!(date1 instanceof Date)) {
            date1 = DateService.createUTCDate(date1);
        }

        if (!(date2 instanceof Date)) {
            date2 = DateService.createUTCDate(date2);
        }

        return date1 < date2;
    }

    /** Tests whether the first date is less than or equal to the second date. */
    static isLessThanOrEqual(date1: AnyDate, date2: AnyDate): boolean {
        if (!(date1 instanceof Date)) {
            date1 = DateService.createUTCDate(date1);
        }

        if (!(date2 instanceof Date)) {
            date2 = DateService.createUTCDate(date2);
        }

        return date1 <= date2;
    }

    /** Tests whether two dates have the same year/month/day. Time doesn't matter. */
    static isSameDay(date1: AnyDate, date2: AnyDate): boolean {
        const date1Object = DateService.createUTCDate(date1);
        const date2Object = DateService.createUTCDate(date2);

        return (
            date1Object.getUTCFullYear() === date2Object.getUTCFullYear() &&
            date1Object.getUTCMonth() === date2Object.getUTCMonth() &&
            date1Object.getUTCDate() === date2Object.getUTCDate()
        );
    }

    /** Tests whether two deconstructed dates have the same year/month/day. */
    static isSameDayDeconstructed(date1: DeconstructedDate, date2: DeconstructedDate): boolean {
        return date1.day === date2.day && date1.month === date2.month && date1.year === date2.year;
    }

    /** Gets the number of days between two dates. */
    static daysBetween(startDate: AnyDate, endDate: AnyDate): number {
        const startDateObject = DateService.createUTCDate(startDate);
        const endDateObject = DateService.createUTCDate(endDate);

        return Math.round(
            (endDateObject.getTime() - startDateObject.getTime()) / MILLISECONDS_IN_DAY
        );
    }

    /** Checks whether two dates are a week apart. Although it's probably more accurate
     *  to say it checks whether the start date is the _start_ of a week and the end date
     *  is the _end_ of week, since we check that they're 6 days apart as opposed to 7.
     *
     *  If we checked for 7, then we'd be checking if each date were the
     *  start of separate weeks. */
    static isOneWeekApart(startDate: AnyDate, endDate: AnyDate): boolean {
        return DateService.daysBetween(startDate, endDate) === 6;
    }

    /** Checks if two dates are a month apart.
     *
     *  For our uses, 'a month apart' can mean either the dates are start/end of a single month,
     *  or they are the same date number of two consecutive months. */
    static isOneMonthApart(startDate: AnyDate, endDate: AnyDate): boolean {
        // Swap the dates around if the end is actually before the start.
        // This is relevant for the year calculation in the second conditional.
        if (!DateService.isLessThan(startDate, endDate)) {
            [startDate, endDate] = [endDate, startDate];
        }

        const start = DateService.deconstructDate(startDate);
        const end = DateService.deconstructDate(endDate);

        // Same year, same day, 1 month apart
        if (start.year === end.year && start.day === end.day && end.month - start.month === 1) {
            return true;
        } else if (
            // Dates are the start/end of a month.
            start.year === end.year &&
            start.month === end.month &&
            start.day === 1 &&
            end.day === DateService.getLastDayInMonth(endDate).getUTCDate()
        ) {
            return true;
        } else if (
            // Dates are in December/January of consecutive years.
            // Note that we don't need special month end checking since January and December
            // both have 31 days.
            start.month === 11 &&
            end.month === 0 &&
            end.year - start.year === 1 &&
            start.day === end.day
        ) {
            return true;
        } else {
            return false;
        }
    }

    /** Checks if two dates are a year apart.
     *
     *  For our uses, 'a year apart' means either the dates are the start/end of a year
     *  (i.e. Jan 1st and Dec 31st) or the dates share the same day/month,
     *  but in consecutive years. */
    static isOneYearApart(startDate: AnyDate, endDate: AnyDate): boolean {
        // Swap the dates around if the end is actually before the start.
        if (!DateService.isLessThan(startDate, endDate)) {
            [startDate, endDate] = [endDate, startDate];
        }

        const start = DateService.deconstructDate(startDate);
        const end = DateService.deconstructDate(endDate);

        // Month/day are the same; years are one apart.
        if (start.month === end.month && start.day === end.day && end.year - start.year === 1) {
            return true;
        } else if (
            // Dates are the first/last day of a year.
            start.year === end.year &&
            start.month === 0 &&
            end.month === 11 &&
            start.day === 1 &&
            end.day === 31
        ) {
            return true;
        } else {
            return false;
        }
    }

    /** Adds the given number of days to the date. */
    static addDays(date: AnyDate, days: number): UTCDate {
        const dateObject = DateService.createUTCDate(date);

        dateObject.setUTCDate(dateObject.getUTCDate() + days);
        return dateObject;
    }

    /** Adds a single day to a deconstructed date.
     *
     *  This (just like all the deconstructed date specific functions) exist as a performance optimization,
     *  since we can skip creating new date objects by just operating on a single deconstructed date
     *  directly.
     *
     *  Why not be able to add multiple days, like `addDays` above? Cause that would be more work/math,
     *  and we currently only need to add 1 day for our current deconstructed date uses. */
    static addDayDeconstructed(date: DeconstructedDate): DeconstructedDate {
        date.day += 1;

        if (date.day > MONTH_DAY_COUNTS[date.month]) {
            if (DateService.isLeapYear(date.year) && date.month === 1 && date.day === 29) {
                // Remember, MONTH_DAY_COUNTS uses a non-leap-year February (i.e. 28 days).
                // So during a leap year, it's fine that adding a day pushes it to 29 days.
                return date;
            } else if (date.month === 11) {
                // Need to rollover to a new year when going past December.
                date.year += 1;
                date.month = 0;
                date.day = 1;
            } else {
                // Need to go to the next month when going past the current month.
                date.month += 1;
                date.day = 1;
            }
        }

        return date;
    }

    /** Subtracts the given number of days to the date. */
    static subtractDays(date: AnyDate, days: number): UTCDate {
        const dateObject = DateService.createUTCDate(date);

        dateObject.setUTCDate(dateObject.getUTCDate() - days);
        return dateObject;
    }

    /** Adds a week (7 days) to the date. */
    static addWeek(date: AnyDate): UTCDate {
        return DateService.addDays(date, 7);
    }

    /** Subtracts a week (7 days) to the date. */
    static subtractWeek(date: AnyDate): UTCDate {
        return DateService.subtractDays(date, 7);
    }

    /** Adds a month to the date.
     *
     *  In general, this just means incrementing the month and keeping the same day,
     *  but if the date is the last day of the month, we want to go to the last day day of the
     *  next month. */
    static addMonth(date: AnyDate): UTCDate {
        const parts = DateService.deconstructDate(date);

        const lastDay = DateService.getLastDayInMonth(date).getUTCDate();

        if (parts.month === 11) {
            // When in December, we need to increment the year and loop back to January.
            parts.year += 1;
            parts.month = 0;
        } else if (parts.day === lastDay) {
            // When the day is the last day of the month, we want the next month to also be
            // at its last day.
            parts.month = parts.month + 1;

            const nextLastDay = DateService.getLastDayInMonth(
                DateService.reconstructDate({...parts, day: 1})
            ).getUTCDate();

            parts.day = nextLastDay;
        } else {
            parts.month = parts.month + 1;

            // We have to make sure that we don't go past the end of the month.
            // For example, January 30th +1 month should go to February 28/29, not March whatever.
            const nextLastDay = DateService.getLastDayInMonth(
                DateService.reconstructDate({...parts, day: 1})
            ).getUTCDate();

            parts.day = Math.min(parts.day, nextLastDay);
        }

        return DateService.reconstructDate(parts);
    }

    /** Subtracts a month from the date. */
    static subtractMonth(date: AnyDate): UTCDate {
        const parts = DateService.deconstructDate(date);

        const lastDay = DateService.getLastDayInMonth(date).getUTCDate();

        if (parts.month === 0) {
            // When in January, we need to decrement the year and loop back to December.
            parts.year -= 1;
            parts.month = 11;
        } else if (parts.day === lastDay) {
            // When the day is the last day of the month, we want the next month to also be
            // at its last day.
            parts.month = parts.month - 1;

            const previousLastDay = DateService.getLastDayInMonth(
                DateService.reconstructDate({...parts, day: 1})
            ).getUTCDate();

            parts.day = previousLastDay;
        } else {
            parts.month = parts.month - 1;

            // We have to make sure that we don't go past the end of the month.
            // For example, March 30th -1 month should go to February 28/29, not the 27th/whatever.
            const previousLastDay = DateService.getLastDayInMonth(
                DateService.reconstructDate({...parts, day: 1})
            ).getUTCDate();

            parts.day = Math.min(parts.day, previousLastDay);
        }

        return DateService.reconstructDate(parts);
    }

    /** Adds a year to the date. */
    static addYear(date: AnyDate): UTCDate {
        const parts = DateService.deconstructDate(date);
        parts.year += 1;

        return DateService.reconstructDate(parts);
    }

    /** Subtracts a year to the date. */
    static subtractYear(date: AnyDate): UTCDate {
        const parts = DateService.deconstructDate(date);
        parts.year -= 1;

        return DateService.reconstructDate(parts);
    }

    /** Determines whether a given year is a leap year. */
    static isLeapYear(year: number): boolean {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    }
}
