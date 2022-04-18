import {monthDaysToYearDay, yearDayToMonthDays} from "testData/DateService.test.data";
import DateService from "./DateService";

const {
    addDays,
    addDayDeconstructed,
    addMonth,
    addWeek,
    addYear,
    createUTCString,
    convertToTimestamp,
    convertToUTCString,
    daysBetween,
    deconstructDate,
    getDayOfYear,
    getDaysInMonth,
    getFirstDayInMonth,
    getFirstDayInYear,
    getLastDayInMonth,
    getLastDayInYear,
    getMonthDayFromDayOfYear,
    getTodayDate,
    getTodayDateTime,
    getTodayAsUTCString,
    isLeapYear,
    isLessThan,
    isLessThanDeconstructed,
    isLessThanOrEqual,
    isLessThanOrEqualDeconstructed,
    isOneWeekApart,
    isOneMonthApart,
    isOneYearApart,
    isSameDay,
    isSameDayDeconstructed,
    isTodayInMonth,
    isValidDate,
    reconstructDate,
    reconstructDateToUTCString,
    stripTime,
    subtractDays,
    subtractMonth,
    subtractWeek,
    subtractYear
} = DateService;

const dateString = "2019-03-01 12:12:12";
const dateObject = new Date(dateString);
const utcString = "2019-03-01";

const expectedTimestamp = "2019-03-01T12:12:12.000Z";
const expectedDateInputFormat = "2019-03-01";

describe("createUTCString", () => {
    it("creates a UTC string from year/month/day parts", () => {
        expect(createUTCString(2020, 9, 15)).toBe("2020-10-15");
        expect(createUTCString(2020, 10, 15)).toBe("2020-11-15");
    });

    it("pads months/days less than 10 with a leading zero", () => {
        expect(createUTCString(2020, 8, 1)).toBe("2020-09-01");
    });
});

describe("convertToTimestamp", () => {
    it("converts a date string to a timestamp object", () => {
        expect(convertToTimestamp(dateString)).toEqual(expectedTimestamp);
    });

    it("converts a date object to a timestamp string", () => {
        expect(convertToTimestamp(dateObject)).toEqual(expectedTimestamp);
    });

    it("throws an error when given an invalid date", () => {
        // @ts-ignore Want to test null/undefined regardless of types.
        expect(() => convertToTimestamp(null)).toThrow();

        // @ts-ignore Want to test null/undefined regardless of types.
        expect(() => convertToTimestamp(undefined)).toThrow();

        expect(() => convertToTimestamp("random string")).toThrow();
    });
});

describe("convertToUTCString", () => {
    it("converts a date string to the date input format", () => {
        expect(convertToUTCString(dateString)).toEqual(expectedDateInputFormat);
    });

    it("converts a date object to the date input format", () => {
        expect(convertToUTCString(dateObject)).toEqual(expectedDateInputFormat);
    });

    it("converts a UTC string to the date input format", () => {
        expect(convertToUTCString(utcString)).toEqual(expectedDateInputFormat);
    });
});

describe("isValidDate", () => {
    it("expects only real date objects to be dates", () => {
        expect(isValidDate(new Date())).toEqual(true);
    });

    it("expects non-date objects to not be dates", () => {
        expect(isValidDate("2019-03-01")).toEqual(false);
        expect(isValidDate(1234567890)).toEqual(false);
    });
});

describe("getTodayDate", () => {
    it("gets today's date (without time)", () => {
        const today = new Date();
        const todayDate = getTodayDate();

        expect(todayDate.getFullYear()).toEqual(today.getFullYear());
        expect(todayDate.getMonth()).toEqual(today.getMonth());
        expect(todayDate.getDate()).toEqual(today.getDate());
        expect(todayDate.getHours()).toEqual(0);
        expect(todayDate.getMinutes()).toEqual(0);
        expect(todayDate.getSeconds()).toEqual(0);
    });
});

describe("getTodayDateTime", () => {
    it("gets today's date and time", () => {
        const today = new Date();
        const todayDateTime = getTodayDateTime();

        expect(todayDateTime.getFullYear()).toEqual(today.getFullYear());
        expect(todayDateTime.getMonth()).toEqual(today.getMonth());
        expect(todayDateTime.getDate()).toEqual(today.getDate());
        expect(todayDateTime.getHours()).toEqual(today.getHours());
        expect(todayDateTime.getMinutes()).toEqual(today.getMinutes());
        expect(todayDateTime.getSeconds()).toEqual(today.getSeconds());
    });
});

describe("getTodayAsUTCString", () => {
    it("gets today's date in the date input format", () => {
        const today = new Date();
        const todayDateFormat = getTodayAsUTCString();

        const [year, month, day] = todayDateFormat.split("-");

        expect(year).toBe(today.getFullYear().toString());

        // We're parseInt'ing the day and month to remove the leading 0
        // (for day/months that have it).
        // Also remember that months are 0 indexed.
        expect(parseInt(month)).toBe(today.getMonth() + 1);

        expect(parseInt(day)).toBe(today.getDate());
    });
});

describe("stripTime", () => {
    it("strips the time (hours, minutes, seconds) from a date string", () => {
        expect(stripTime(dateString).getFullYear()).toEqual(dateObject.getFullYear());
        expect(stripTime(dateString).getMonth()).toEqual(dateObject.getMonth());
        expect(stripTime(dateString).getDate()).toEqual(dateObject.getDate());
        expect(stripTime(dateString).getHours()).toEqual(0);
        expect(stripTime(dateString).getMinutes()).toEqual(0);
        expect(stripTime(dateString).getSeconds()).toEqual(0);
    });

    it("strips the time (hours, minutes, seconds) from a date object", () => {
        expect(stripTime(dateObject).getFullYear()).toEqual(dateObject.getFullYear());
        expect(stripTime(dateObject).getMonth()).toEqual(dateObject.getMonth());
        expect(stripTime(dateObject).getDate()).toEqual(dateObject.getDate());
        expect(stripTime(dateObject).getHours()).toEqual(0);
        expect(stripTime(dateObject).getMinutes()).toEqual(0);
        expect(stripTime(dateObject).getSeconds()).toEqual(0);
    });

    it("throws an error when given an invalid date", () => {
        // @ts-ignore Want to test null/undefined regardless of types.
        expect(() => stripTime(null)).toThrow();

        // @ts-ignore Want to test null/undefined regardless of types.
        expect(() => stripTime(undefined)).toThrow();

        expect(() => stripTime("random string")).toThrow();
    });
});

describe("deconstructDate", () => {
    it("can deconstruct a date", () => {
        expect(deconstructDate("2020-07-30")).toEqual({
            year: 2020,
            month: 6,
            day: 30
        });
    });
});

describe("reconstructDate", () => {
    it("can reconstruct a date", () => {
        const date = reconstructDate({year: 2020, month: 6, day: 30});

        expect(date.getUTCFullYear()).toBe(2020);
        expect(date.getUTCMonth()).toBe(6);
        expect(date.getUTCDate()).toBe(30);
    });
});

describe("reconstructDateToUTCString", () => {
    it("can reconstruct a date to a UTC string", () => {
        const date = reconstructDateToUTCString({year: 2020, month: 6, day: 30});

        expect(date).toBe("2020-07-30");
    });
});

describe("getFirstDayInMonth", () => {
    it("gets the first day of the month of a given date", () => {
        const date = getFirstDayInMonth("2020-07-15");

        expect(date.getUTCFullYear()).toBe(2020);
        expect(date.getUTCMonth()).toBe(6);
        expect(date.getUTCDate()).toBe(1);
    });
});

describe("getLastDayInMonth", () => {
    it("gets the last day of the month of a given date", () => {
        const date = getLastDayInMonth("2020-07-15");

        expect(date.getUTCFullYear()).toBe(2020);
        expect(date.getUTCMonth()).toBe(6);
        expect(date.getUTCDate()).toBe(31);
    });
});

describe("getFirstDayInYear", () => {
    it("gets the last day of the month of a given date", () => {
        const date = getFirstDayInYear("2020-07-15");

        expect(date.getUTCFullYear()).toBe(2020);
        expect(date.getUTCMonth()).toBe(0);
        expect(date.getUTCDate()).toBe(1);
    });
});

describe("getLastDayInYear", () => {
    it("gets the last day of the month of a given date", () => {
        const date = getLastDayInYear("2020-07-15");

        expect(date.getUTCFullYear()).toBe(2020);
        expect(date.getUTCMonth()).toBe(11);
        expect(date.getUTCDate()).toBe(31);
    });
});

describe("getDaysInMonth", () => {
    it("can get the number of days in every month", () => {
        for (const month in monthDaysToYearDay) {
            expect(getDaysInMonth(month)).toBe(Object.keys(monthDaysToYearDay[month]).length);
        }
    });
});

describe("getDayOfYear", () => {
    it("can get the day of the year from a given month/day combination", () => {
        for (const month in monthDaysToYearDay) {
            for (const day in monthDaysToYearDay[month]) {
                expect(getDayOfYear(month, day)).toBe(monthDaysToYearDay[month][day]);
            }
        }
    });
});

describe("getMonthDayFromDayOfYear", () => {
    it("can get the month/day combination from a day of the year", () => {
        for (const yearDay in yearDayToMonthDays) {
            expect(getMonthDayFromDayOfYear(yearDay)).toEqual(yearDayToMonthDays[yearDay]);
        }
    });
});

describe("isTodayInMonth", () => {
    const today = DateService.getTodayDate();

    it("can find that today is in the same month as some other given date", () => {
        const lastDayOfMonth = DateService.getLastDayInMonth(today);
        expect(isTodayInMonth(lastDayOfMonth)).toBe(true);
    });

    it("can find that today is not in the same month as some other given date", () => {
        const nextMonth = DateService.addDays(DateService.getLastDayInMonth(today), 1);
        expect(isTodayInMonth(nextMonth)).toBe(false);
    });

    it("makes sure the date is also in the same year as today", () => {
        const lastDayOfMonth = DateService.getLastDayInMonth(DateService.subtractYear(today));
        expect(isTodayInMonth(lastDayOfMonth)).toBe(false);
    });
});

describe("isLessThan", () => {
    it("can find a date is less than another", () => {
        expect(isLessThan("2020-01-01", "2020-12-31")).toBe(true);
    });

    it(`is actually even more misleading than 'isLessThan' because it _doesn't_
        do less than or equal; it does just strict less than.`, () => {
        expect(isLessThan("2020-01-01", "2020-01-01")).toBe(false);
    });

    it("can find a date is not less than another", () => {
        expect(isLessThan("2020-12-31", "2020-01-01")).toBe(false);
    });
});

describe("isLessThanDeconstructed", () => {
    it("can find a date is less than another", () => {
        expect(
            isLessThanDeconstructed(deconstructDate("2020-01-01"), deconstructDate("2020-12-31"))
        ).toBe(true);
    });

    it(`is actually even more misleading than 'isLessThan' because it _doesn't_
        do less than or equal; it does just strict less than.`, () => {
        expect(
            isLessThanDeconstructed(deconstructDate("2020-01-01"), deconstructDate("2020-01-01"))
        ).toBe(false);
    });

    it("can find a date is not less than another", () => {
        expect(
            isLessThanDeconstructed(deconstructDate("2020-12-31"), deconstructDate("2020-01-01"))
        ).toBe(false);
    });
});

describe("isLessThanOrEqual", () => {
    describe("Regular Dates", () => {
        it("can find that a date is less than another date", () => {
            // Year is less.
            expect(isLessThanOrEqual("2000-01-01", "2020-01-01")).toBe(true);

            // Month is less.
            expect(isLessThanOrEqual("2020-01-01", "2020-02-01")).toBe(true);

            // Day is less.
            expect(isLessThanOrEqual("2020-01-01", "2020-01-02")).toBe(true);
        });

        it("also finds when dates are equal", () => {
            expect(isLessThanOrEqual("2020-01-01", "2020-01-01")).toBe(true);
        });

        it("can find that a date is not less than another date", () => {
            // Year is more.
            expect(isLessThanOrEqual("2020-01-01", "2000-01-01")).toBe(false);

            // Month is more.
            expect(isLessThanOrEqual("2020-02-01", "2020-01-01")).toBe(false);

            // Day is more.
            expect(isLessThanOrEqual("2020-01-02", "2020-01-01")).toBe(false);
        });
    });
});

describe("isLessThanOrEqualDeconstructed", () => {
    it("can find that a date is less than another date", () => {
        // Year is less.
        expect(
            isLessThanOrEqualDeconstructed(
                deconstructDate("2000-01-01"),
                deconstructDate("2020-01-01")
            )
        ).toBe(true);

        // Month is less.
        expect(
            isLessThanOrEqualDeconstructed(
                deconstructDate("2020-01-01"),
                deconstructDate("2020-02-01")
            )
        ).toBe(true);

        // Day is less.
        expect(
            isLessThanOrEqualDeconstructed(
                deconstructDate("2020-01-01"),
                deconstructDate("2020-01-02")
            )
        ).toBe(true);
    });

    it("also finds when dates are equal", () => {
        expect(
            isLessThanOrEqualDeconstructed(
                deconstructDate("2020-01-01"),
                deconstructDate("2020-01-01")
            )
        ).toBe(true);
    });

    it("can find that a date is not less than another date", () => {
        // Year is more.
        expect(
            isLessThanOrEqualDeconstructed(
                deconstructDate("2020-01-01"),
                deconstructDate("2000-01-01")
            )
        ).toBe(false);

        // Month is more.
        expect(
            isLessThanOrEqualDeconstructed(
                deconstructDate("2020-02-01"),
                deconstructDate("2020-01-01")
            )
        ).toBe(false);

        // Day is more.
        expect(
            isLessThanOrEqualDeconstructed(
                deconstructDate("2020-01-02"),
                deconstructDate("2020-01-01")
            )
        ).toBe(false);
    });
});

describe("isSameDay", () => {
    it("returns true when two dates are the same day", () => {
        expect(isSameDay(dateObject, dateObject)).toBe(true);

        const newTime = new Date(dateObject.getTime());
        newTime.setHours(10);
        expect(isSameDay(dateObject, newTime)).toBe(true);
    });

    it("returns false when two dates are not the same day", () => {
        const newDay = new Date(dateObject);
        newDay.setDate(10);
        expect(isSameDay(dateObject, newDay)).toBe(false);
    });

    it("returns false when two dates are not the same month", () => {
        const newMonth = new Date(dateObject);
        newMonth.setMonth(10);
        expect(isSameDay(dateObject, newMonth)).toBe(false);
    });

    it("returns false when two dates are not the same year", () => {
        const newYear = new Date(dateObject);
        newYear.setFullYear(1996);
        expect(isSameDay(dateObject, newYear)).toBe(false);
    });
});

describe("isSameDayDeconstructed", () => {
    const deconstructedDate1 = {year: 2020, month: 6, day: 15};
    const deconstructedDate2 = {year: 2020, month: 6, day: 15};

    it("returns true when two dates are the same day", () => {
        expect(isSameDayDeconstructed(deconstructedDate1, deconstructedDate2)).toBe(true);
    });

    it("returns false when two dates are not the same day", () => {
        expect(isSameDayDeconstructed(deconstructedDate1, {...deconstructedDate1, day: 10})).toBe(
            false
        );
    });

    it("returns false when two dates are not the same month", () => {
        expect(isSameDayDeconstructed(deconstructedDate1, {...deconstructedDate1, month: 1})).toBe(
            false
        );
    });

    it("returns false when two dates are not the same year", () => {
        expect(isSameDayDeconstructed(deconstructedDate1, {...deconstructedDate1, year: 1})).toBe(
            false
        );
    });
});

describe("daysBetween", () => {
    it("gets the number of days between two dates", () => {
        expect(daysBetween("2020-01-01", "2020-01-15")).toBe(14);
        expect(daysBetween("2020-01-01", "2020-02-01")).toBe(31);

        // 366 cause 2020 is a leap year!
        expect(daysBetween("2020-01-01", "2021-01-01")).toBe(366);
    });
});

describe("isOneWeekApart", () => {
    it("can find that two dates are a week apart", () => {
        expect(isOneWeekApart("2020-01-01", "2020-01-07")).toBe(true);
    });

    it("can find that two dates are not a week apart", () => {
        expect(isOneWeekApart("2020-01-01", "2020-01-15")).toBe(false);
    });
});

describe("isOneMonthApart", () => {
    it("can find that two dates are a month apart when they're in separate months", () => {
        expect(isOneMonthApart("2020-01-15", "2020-02-15")).toBe(true);
    });

    it("can find that two dates are a month apart when they're the start/end of a month", () => {
        expect(isOneMonthApart("2020-01-01", "2020-01-31")).toBe(true);
    });

    it("can find that two dates are a month apart when they're in different years", () => {
        expect(isOneMonthApart("2019-12-15", "2020-01-15")).toBe(true);
    });

    it("can find that two dates are a month apart even when they're swapped around", () => {
        expect(isOneMonthApart("2020-01-15", "2019-12-15")).toBe(true);
    });

    it("can find that two dates are not a month apart", () => {
        expect(isOneMonthApart("2020-01-15", "2020-02-14")).toBe(false);
    });
});

describe("isOneYearApart", () => {
    it("can find that two dates are a year apart when they're in separate years", () => {
        expect(isOneYearApart("2020-01-15", "2021-01-15")).toBe(true);
    });

    it("can find that two dates are a year apart when they're the start/end of a year", () => {
        expect(isOneYearApart("2020-01-01", "2020-12-31")).toBe(true);
    });

    it("can find that two dates are not a year apart", () => {
        expect(isOneYearApart("2020-01-15", "2020-02-14")).toBe(false);
    });
});

describe("day arithmetic", () => {
    describe("addDays", () => {
        it("can add a day", () => {
            const date = addDays("2020-01-01", 1);

            expect(date.getUTCFullYear()).toBe(2020);
            expect(date.getUTCMonth()).toBe(0);
            expect(date.getUTCDate()).toBe(2);
        });

        it("can add many days", () => {
            const date = addDays("2020-01-01", 15);

            expect(date.getUTCFullYear()).toBe(2020);
            expect(date.getUTCMonth()).toBe(0);
            expect(date.getUTCDate()).toBe(16);
        });
    });

    describe("addDayDeconstructed", () => {
        it("can add a day", () => {
            const date = addDayDeconstructed({year: 2020, month: 3, day: 2});

            expect(date.year).toBe(2020);
            expect(date.month).toBe(3);
            expect(date.day).toBe(3);
        });

        it("can roll over to a new month", () => {
            const date = addDayDeconstructed({year: 2020, month: 0, day: 31});

            expect(date.year).toBe(2020);
            expect(date.month).toBe(1);
            expect(date.day).toBe(1);
        });

        it("can roll over to a new year", () => {
            const date = addDayDeconstructed({year: 2020, month: 11, day: 31});

            expect(date.year).toBe(2021);
            expect(date.month).toBe(0);
            expect(date.day).toBe(1);
        });

        it("can handle leap years", () => {
            const date = addDayDeconstructed({year: 2020, month: 1, day: 28});

            expect(date.year).toBe(2020);
            expect(date.month).toBe(1);
            expect(date.day).toBe(29);
        });

        it("doesn't infinitely add days to February during leap years", () => {
            const date = addDayDeconstructed({year: 2020, month: 1, day: 29});

            expect(date.year).toBe(2020);
            expect(date.month).toBe(2);
            expect(date.day).toBe(1);
        });
    });

    describe("subtractDays", () => {
        it("can subtract a day", () => {
            const date = subtractDays("2020-01-01", 1);

            expect(date.getUTCFullYear()).toBe(2019);
            expect(date.getUTCMonth()).toBe(11);
            expect(date.getUTCDate()).toBe(31);
        });

        it("can subtract many days", () => {
            const date = subtractDays("2020-01-01", 15);

            expect(date.getUTCFullYear()).toBe(2019);
            expect(date.getUTCMonth()).toBe(11);
            expect(date.getUTCDate()).toBe(17);
        });
    });
});

describe("week arithmetic", () => {
    describe("addWeek", () => {
        it("can add a single week", () => {
            const date = addWeek("2020-01-01");

            expect(date.getUTCFullYear()).toBe(2020);
            expect(date.getUTCMonth()).toBe(0);
            expect(date.getUTCDate()).toBe(8);
        });
    });

    describe("subtractWeek", () => {
        it("can subtract a single week", () => {
            const date = subtractWeek("2020-01-08");

            expect(date.getUTCFullYear()).toBe(2020);
            expect(date.getUTCMonth()).toBe(0);
            expect(date.getUTCDate()).toBe(1);
        });
    });
});

describe("month arithmetic", () => {
    const sameDayMonths = [
        "2020-01-15",
        "2020-02-15",
        "2020-03-15",
        "2020-04-15",
        "2020-05-15",
        "2020-06-15",
        "2020-07-15",
        "2020-08-15",
        "2020-09-15",
        "2020-10-15",
        "2020-11-15",
        "2020-12-15",
        "2021-01-15"
    ];

    const firstDayMonths = [
        "2020-01-01",
        "2020-02-01",
        "2020-03-01",
        "2020-04-01",
        "2020-05-01",
        "2020-06-01",
        "2020-07-01",
        "2020-08-01",
        "2020-09-01",
        "2020-10-01",
        "2020-11-01",
        "2020-12-01",
        "2021-01-01"
    ];

    const missingDayMonths = [
        ["2020-01-30", "2020-02-29"],
        ["2020-04-30", "2020-05-31"],
        ["2020-06-30", "2020-07-31"],
        ["2020-09-30", "2020-10-31"],
        ["2020-11-30", "2020-12-31"]
    ];

    const lastDayMonths = [
        "2020-01-31",
        "2020-02-29",
        "2020-03-31",
        "2020-04-30",
        "2020-05-31",
        "2020-06-30",
        "2020-07-31",
        "2020-08-31",
        "2020-09-30",
        "2020-10-31",
        "2020-11-30",
        "2020-12-31",
        "2021-01-31"
    ];

    describe("addMonth", () => {
        it("can handle a day that every month has", () => {
            for (let i = 0; i < sameDayMonths.length - 1; i++) {
                expect(convertToUTCString(addMonth(sameDayMonths[i]))).toEqual(
                    sameDayMonths[i + 1]
                );
            }
        });

        it("can handle the first day of every month", () => {
            for (let i = 0; i < firstDayMonths.length - 1; i++) {
                expect(convertToUTCString(addMonth(firstDayMonths[i]))).toEqual(
                    firstDayMonths[i + 1]
                );
            }
        });

        it("can handle a day that not every month has", () => {
            for (let i = 0; i < missingDayMonths.length - 1; i++) {
                expect(convertToUTCString(addMonth(missingDayMonths[i][0]))).toEqual(
                    missingDayMonths[i][1]
                );
            }
        });

        it("can handle the last day of every month", () => {
            for (let i = 0; i < lastDayMonths.length - 1; i++) {
                expect(convertToUTCString(addMonth(lastDayMonths[i]))).toEqual(
                    lastDayMonths[i + 1]
                );
            }
        });
    });

    describe("subtractMonth", () => {
        it("can handle a day that every month has", () => {
            for (let i = sameDayMonths.length - 1; i > 0; i--) {
                expect(convertToUTCString(subtractMonth(sameDayMonths[i]))).toEqual(
                    sameDayMonths[i - 1]
                );
            }
        });

        it("can handle the first day of every month", () => {
            for (let i = firstDayMonths.length - 1; i > 0; i--) {
                expect(convertToUTCString(subtractMonth(firstDayMonths[i]))).toEqual(
                    firstDayMonths[i - 1]
                );
            }
        });

        it("can handle a day that not every month has", () => {
            for (let i = missingDayMonths.length - 1; i > 0; i--) {
                expect(convertToUTCString(subtractMonth(missingDayMonths[i][1]))).toEqual(
                    missingDayMonths[i][0]
                );
            }
        });

        it("can handle the last day of every month", () => {
            for (let i = lastDayMonths.length - 1; i > 0; i--) {
                expect(convertToUTCString(subtractMonth(lastDayMonths[i]))).toEqual(
                    lastDayMonths[i - 1]
                );
            }
        });
    });
});

describe("year arithmetic", () => {
    describe("addYear", () => {
        it("can add a single year", () => {
            const date = addYear("2020-01-01");

            expect(date.getUTCFullYear()).toBe(2021);
            expect(date.getUTCMonth()).toBe(0);
            expect(date.getUTCDate()).toBe(1);
        });
    });

    describe("subtractYear", () => {
        it("can subtract a single year", () => {
            const date = subtractYear("2020-01-01");

            expect(date.getUTCFullYear()).toBe(2019);
            expect(date.getUTCMonth()).toBe(0);
            expect(date.getUTCDate()).toBe(1);
        });
    });
});

describe("isLeapYear", () => {
    it("returns true when the year is a normal leap year", () => {
        expect(isLeapYear(2020)).toBe(true);
    });

    it("returns false when the year is a normal centurial year", () => {
        expect(isLeapYear(1900)).toBe(false);
    });

    it("returns true when the year is a 400 centurial year", () => {
        expect(isLeapYear(2000)).toBe(true);
    });

    it("returns false for non-centurial years not divisible by 4", () => {
        expect(isLeapYear(1995)).toBe(false);
    });
});
