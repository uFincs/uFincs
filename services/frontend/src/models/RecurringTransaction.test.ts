import {RRule} from "rrule";
import {vi} from "vitest";
import {Transaction} from "models/";
import {DateService} from "services/";
import RecurringTransaction, {RecurringTransactionData, RRuleFreqMap} from "./RecurringTransaction";

const today = DateService.getTodayDate();

export const recurringTransaction = new RecurringTransaction({
    amount: 12345,
    description: "test",
    notes: "these are notes",
    type: Transaction.EXPENSE,
    creditAccountId: "1",
    debitAccountId: "2",
    interval: 2,
    freq: RecurringTransaction.FREQUENCIES.weekly,
    on: 2,
    startDate: "3001-02-01",
    count: 10
});

// Yes, technically speaking, once the current date becomes the year 3001, these tests will fail
// (since `getFutureDatesBetween` doesn't generate dates in the past), but come on, I think we can afford
// to not care for a 1000 years.
export const startDate = "3001-01-01";
export const endDate = "3001-04-01";

export const expectedDates = [
    DateService.createUTCDate("3001-02-11"),
    DateService.createUTCDate("3001-02-25"),
    DateService.createUTCDate("3001-03-11"),
    DateService.createUTCDate("3001-03-25")
];

describe("convertToRegularTransaction", () => {
    it("can convert a recurring transaction to a 'regular' transaction", () => {
        expect(RecurringTransaction.convertToRegularTransaction(recurringTransaction)).toEqual(
            new Transaction({
                ...recurringTransaction,
                date: recurringTransaction.startDate
            })
        );
    });
});

describe("parseFormFrequency", () => {
    const formData = {
        onWeekday: "3",
        onMonthday: "15",
        onMonth: "2",
        onDay: "22"
    };

    it("just returns 0 for daily, since `on` doesn't matter for daily", () => {
        const data = {...formData, freq: RecurringTransaction.FREQUENCIES.daily};
        expect(RecurringTransaction.parseFormFrequency(data)).toBe(0);
    });

    it("parses out `onWeekday` as `on` with the weekly frequency", () => {
        const data = {...formData, freq: RecurringTransaction.FREQUENCIES.weekly};
        expect(RecurringTransaction.parseFormFrequency(data)).toBe(3);
    });

    it("parses out `onMonthday` as `on` with the monthly frequency", () => {
        const data = {...formData, freq: RecurringTransaction.FREQUENCIES.monthly};
        expect(RecurringTransaction.parseFormFrequency(data)).toBe(15);
    });

    it("parses `onMonth` and `onDay` as a year day for `on` with the yearly frequency", () => {
        const data = {...formData, freq: RecurringTransaction.FREQUENCIES.yearly};
        expect(RecurringTransaction.parseFormFrequency(data)).toBe(81);
    });
});

describe("parseFormEndCondition", () => {
    const formData = {
        count: "2",
        endDate: "2020-01-01"
    };

    it("sets the `count` when the end condition is 'after'", () => {
        const data = {...formData, endCondition: RecurringTransaction.END_CONDITIONS.after};

        expect(RecurringTransaction.parseFormEndCondition(data).count).toBe(2);
        expect(RecurringTransaction.parseFormEndCondition(data).endDate).toBeUndefined();
        expect(RecurringTransaction.parseFormEndCondition(data).neverEnds).toBeUndefined();
    });

    it("sets the `endDate` when the end condition is 'on'", () => {
        const data = {...formData, endCondition: RecurringTransaction.END_CONDITIONS.on};

        expect(RecurringTransaction.parseFormEndCondition(data).count).toBeUndefined();
        expect(RecurringTransaction.parseFormEndCondition(data).endDate).toBe("2020-01-01");
        expect(RecurringTransaction.parseFormEndCondition(data).neverEnds).toBeUndefined();
    });

    it("sets `neverEnds` when the end condition is 'never'", () => {
        const data = {...formData, endCondition: RecurringTransaction.END_CONDITIONS.never};

        expect(RecurringTransaction.parseFormEndCondition(data).count).toBeUndefined();
        expect(RecurringTransaction.parseFormEndCondition(data).endDate).toBeUndefined();
        expect(RecurringTransaction.parseFormEndCondition(data).neverEnds).toBe(true);
    });
});

describe("convertFrequencyToFormData", () => {
    it("does nothing for the 'daily' frequency", () => {
        expect(
            RecurringTransaction.convertFrequencyToFormData({
                ...recurringTransaction,
                freq: RecurringTransaction.FREQUENCIES.daily
            })
        ).toEqual({});
    });

    it("uses `on` as `onWeekday` when using the 'weekly' frequency", () => {
        expect(
            RecurringTransaction.convertFrequencyToFormData({
                ...recurringTransaction,
                freq: RecurringTransaction.FREQUENCIES.weekly
            })
        ).toEqual({onWeekday: `${recurringTransaction.on}`});
    });

    it("uses `on` as `onMonthday` when using the 'monthly' frequency", () => {
        expect(
            RecurringTransaction.convertFrequencyToFormData({
                ...recurringTransaction,
                freq: RecurringTransaction.FREQUENCIES.monthly
            })
        ).toEqual({onMonthday: `${recurringTransaction.on}`});
    });

    it("uses `on` as `onMonth` and `onDay` when using the 'yearly' frequency", () => {
        expect(
            RecurringTransaction.convertFrequencyToFormData({
                ...recurringTransaction,
                freq: RecurringTransaction.FREQUENCIES.yearly
            })
        ).toEqual({
            onMonth: "0",
            onDay: "2"
        });
    });
});

describe("convertEndConditionToFormData", () => {
    it("uses the 'on' end condition when `endDate` is set", () => {
        expect(
            RecurringTransaction.convertEndConditionToFormData({
                ...recurringTransaction,
                endDate: "2020-01-01",
                count: null,
                neverEnds: false
            })
        ).toEqual({
            endCondition: RecurringTransaction.END_CONDITIONS.on,
            endDate: "2020-01-01"
        });
    });

    it("uses the 'after' end condition when `count` is set", () => {
        expect(
            RecurringTransaction.convertEndConditionToFormData({
                ...recurringTransaction,
                endDate: null,
                count: 2,
                neverEnds: false
            })
        ).toEqual({
            endCondition: RecurringTransaction.END_CONDITIONS.after,
            count: "2"
        });
    });

    it("uses the 'never' end condition when `neverEnds` is set", () => {
        expect(
            RecurringTransaction.convertEndConditionToFormData({
                ...recurringTransaction,
                endDate: null,
                count: null,
                neverEnds: true
            })
        ).toEqual({
            endCondition: RecurringTransaction.END_CONDITIONS.never
        });
    });
});

describe("getDatesBetween", () => {
    it("can get dates between start/end dates for a given recurring transaction", () => {
        const dates = RecurringTransaction.getDatesBetween(
            recurringTransaction,
            startDate,
            endDate
        );

        for (let i = 0; i < expectedDates.length; i++) {
            expect(dates[i]).toEqual(expectedDates[i]);
        }
    });

    it("can get dates when the start/end dates are the same", () => {
        const dates = RecurringTransaction.getDatesBetween(
            recurringTransaction,
            expectedDates[0],
            expectedDates[0]
        );

        expect(dates.length).toBe(1);
        expect(dates[0]).toEqual(expectedDates[0]);
    });

    it("can generate dates that are in the past", () => {
        // By setting the start date far enough back in the past, we can make sure that we only
        // receive so many transactions by the realization process. If we receive too many,
        // that means that we're including the past during realization.
        const startDate = DateService.convertToUTCString(DateService.subtractDays(today, 60));
        const endDate = DateService.convertToUTCString(DateService.addDays(today, 14));

        const presentRecurringTransaction = new RecurringTransaction({
            ...recurringTransaction,
            startDate
        });

        const dates = RecurringTransaction.getDatesBetween(
            presentRecurringTransaction,
            startDate,
            endDate
        );

        expect(dates.length).toBeGreaterThanOrEqual(3);
    });

    it("can adjust dates for yearly recurring transactions", () => {
        const recurringTransaction = new RecurringTransaction({
            amount: 12345,
            description: "test",
            notes: "these are notes",
            type: Transaction.EXPENSE,
            creditAccountId: "1",
            debitAccountId: "2",
            interval: 2,
            freq: RecurringTransaction.FREQUENCIES.yearly,
            on: 100,
            startDate: "2000-01-01",
            count: 10
        });

        const dates = RecurringTransaction.getDatesBetween(
            recurringTransaction,
            "2000-01-01",
            "2100-01-01"
        );

        for (const date of dates) {
            const {month, day} = DateService.deconstructDate(date);
            const dayOfYear = DateService.getDayOfYear(month, day);

            expect(dayOfYear).toBe(recurringTransaction.on);
        }
    });

    it("doesn't adjust dates for yearly recurring transactions before March 1", () => {
        const recurringTransaction = new RecurringTransaction({
            amount: 12345,
            description: "test",
            notes: "these are notes",
            type: Transaction.EXPENSE,
            creditAccountId: "1",
            debitAccountId: "2",
            interval: 2,
            freq: RecurringTransaction.FREQUENCIES.yearly,
            on: 15,
            startDate: "2000-01-01",
            count: 10
        });

        const dates = RecurringTransaction.getDatesBetween(
            recurringTransaction,
            "2000-01-01",
            "2100-01-01"
        );

        for (const date of dates) {
            const {month, day} = DateService.deconstructDate(date);
            const dayOfYear = DateService.getDayOfYear(month, day);

            expect(dayOfYear).toBe(recurringTransaction.on);
        }
    });
});

describe("getFutureDatesBetween", () => {
    it("can get dates between start/end dates for a given recurring transaction", () => {
        const dates = RecurringTransaction.getFutureDatesBetween(
            recurringTransaction,
            startDate,
            endDate
        );

        for (let i = 0; i < expectedDates.length; i++) {
            expect(dates[i]).toEqual(expectedDates[i]);
        }
    });

    it("can get dates when the start/end dates are the same", () => {
        const dates = RecurringTransaction.getFutureDatesBetween(
            recurringTransaction,
            expectedDates[0],
            expectedDates[0]
        );

        expect(dates.length).toBe(1);
        expect(dates[0]).toEqual(expectedDates[0]);
    });

    it("doesn't generate dates that are in the past", () => {
        // By setting the start date far enough back in the past, we can make sure that we only
        // receive so many transactions by the realization process. If we receive too many,
        // that means that we're including the past during realization.
        const startDate = DateService.convertToUTCString(DateService.subtractDays(today, 60));
        const endDate = DateService.convertToUTCString(DateService.addDays(today, 14));

        const presentRecurringTransaction = new RecurringTransaction({
            ...recurringTransaction,
            startDate
        });

        const dates = RecurringTransaction.getFutureDatesBetween(
            presentRecurringTransaction,
            startDate,
            endDate
        );

        expect(dates.length).toBeLessThanOrEqual(2);
    });
});

describe("doesOccurToday", () => {
    it("returns true when it occurs today", () => {
        const dailySchedule = new RecurringTransaction({
            amount: 12345,
            description: "test",
            notes: "these are notes",
            type: Transaction.EXPENSE,
            creditAccountId: "1",
            debitAccountId: "2",
            interval: 1,
            freq: RecurringTransaction.FREQUENCIES.daily,
            on: 0,
            startDate: today,
            count: 10
        });

        expect(RecurringTransaction.doesOccurToday(dailySchedule)).toBe(true);
    });

    it("returns false when it doesn't occur today", () => {
        expect(RecurringTransaction.doesOccurToday(recurringTransaction)).toBe(false);
    });
});

describe("realize", () => {
    it("creates a transaction with the given date using the recurring transaction's properties", () => {
        const date = DateService.convertToTimestamp("2020-01-01");
        const transaction = RecurringTransaction.realize(recurringTransaction, date);

        expect(transaction.amount).toBe(recurringTransaction.amount);
        expect(transaction.description).toBe(recurringTransaction.description);
        expect(transaction.notes).toBe(recurringTransaction.notes);
        expect(transaction.type).toBe(recurringTransaction.type);
        expect(transaction.creditAccountId).toBe(recurringTransaction.creditAccountId);
        expect(transaction.debitAccountId).toBe(recurringTransaction.debitAccountId);
        expect(transaction.recurringTransactionId).toBe(recurringTransaction.id);
        expect(transaction.date).toBe(date);
    });
});

describe("realizeMany", () => {
    const today = DateService.getTodayAsUTCString();
    const yesterday = DateService.convertToUTCString(DateService.subtractDays(today, 1));

    const baseTransactionProperties = {
        amount: 100,
        description: "test",
        notes: "these are notes",
        type: Transaction.EXPENSE,
        creditAccountId: "1",
        debitAccountId: "2"
    };

    const newRecurringTransaction = new RecurringTransaction({
        ...baseTransactionProperties,
        interval: 1,
        freq: RecurringTransaction.FREQUENCIES.daily,
        startDate: yesterday,
        neverEnds: true
    });

    it("can realize a brand new recurring transaction into the past", () => {
        const realizedTransaction = {
            ...baseTransactionProperties,
            date: DateService.convertToTimestamp(yesterday),
            recurringTransactionId: newRecurringTransaction.id
        };

        const result = RecurringTransaction.realizeMany(
            [newRecurringTransaction],
            {},
            {includePast: true}
        );

        expect(result[0]).toMatchObject(realizedTransaction);
    });

    it("can realize a recurring transaction today if its never been realized before", () => {
        const anotherNewRecurringTransaction = {
            ...newRecurringTransaction,
            startDate: today
        };

        const realizedTransaction = {
            ...baseTransactionProperties,
            date: DateService.convertToTimestamp(today),
            recurringTransactionId: newRecurringTransaction.id
        };

        const result = RecurringTransaction.realizeMany([anotherNewRecurringTransaction], {});

        expect(result[0]).toMatchObject(realizedTransaction);
    });

    it("can realize a recurring transaction in the future if its never been realized before", () => {
        const anotherNewRecurringTransaction = {
            ...newRecurringTransaction,
            interval: 1,
            freq: RecurringTransaction.FREQUENCIES.monthly,
            // Schedule for the 15th of the month.
            on: 15,
            startDate: "2022-01-01",
            neverEnds: true
        };

        // Pretend that it's the 20th of the month and we missed realizing on the 15th.
        const spy = vi
            .spyOn(DateService, "getTodayAsUTCString")
            .mockImplementation(() => DateService.convertToUTCString("2022-01-20"));

        // The transaction should still be realized for the 15th.
        const realizedTransaction = {
            ...baseTransactionProperties,
            date: DateService.convertToTimestamp("2022-01-15"),
            recurringTransactionId: newRecurringTransaction.id
        };

        const result = RecurringTransaction.realizeMany([anotherNewRecurringTransaction], {});

        // Restore mock before the expect, in case the expect fails.
        spy.mockRestore();

        expect(result[0]).toMatchObject(realizedTransaction);
    });

    it("can realize a recurring transaction since the last realization", () => {
        // If we allow the recurring transaction to exist as far back as a week...
        const moreInPast = {
            ...newRecurringTransaction,
            startDate: DateService.convertToUTCString(DateService.subtractWeek(today))
        };

        // ...but we pretend that we've already realized one transaction 3 days ago...
        const existingDate = DateService.convertToUTCString(DateService.subtractDays(today, 3));

        const existingTransaction = {
            ...baseTransactionProperties,
            date: DateService.convertToTimestamp(existingDate),
            recurringTransactionId: newRecurringTransaction.id
        };

        const indexedTransactions = {
            [moreInPast.id]: {
                [existingDate]: new Transaction(existingTransaction)
            }
        };

        const result = RecurringTransaction.realizeMany([moreInPast], indexedTransactions);

        // ...then we'd expect 3 new transactions be created!
        expect(result.length).toBe(3);

        expect(result[0]).toMatchObject({
            ...existingTransaction,
            date: DateService.convertToTimestamp(DateService.subtractDays(today, 2))
        });

        expect(result[1]).toMatchObject({
            ...existingTransaction,
            date: DateService.convertToTimestamp(DateService.subtractDays(today, 1))
        });

        expect(result[2]).toMatchObject({
            ...existingTransaction,
            date: DateService.convertToTimestamp(today)
        });
    });

    it("uses the recurring transaction's lastRealizedDate to form the date range", () => {
        const anotherNewRecurringTransaction = {
            ...newRecurringTransaction,
            interval: 1,
            freq: RecurringTransaction.FREQUENCIES.weekly,
            on: 0,
            startDate: "2022-01-01",
            neverEnds: true,
            // Set the lastRealizedDate to the 15th.
            lastRealizedDate: "2022-01-15"
        };

        // Pretend that it's the 28th of the month.
        const spy = vi
            .spyOn(DateService, "getTodayAsUTCString")
            .mockImplementation(() => DateService.convertToUTCString("2022-01-28"));

        // The transactions should be realized on the 17th and 24th (Mondays)...
        const realizedTransaction1 = {
            ...baseTransactionProperties,
            date: DateService.convertToTimestamp("2022-01-17"),
            recurringTransactionId: newRecurringTransaction.id
        };

        const realizedTransaction2 = {
            ...baseTransactionProperties,
            date: DateService.convertToTimestamp("2022-01-24"),
            recurringTransactionId: newRecurringTransaction.id
        };

        // ...even if the last realized transaction was earlier than the 15th.
        const existingDate = DateService.convertToUTCString("2022-01-03");

        const existingTransaction = {
            ...baseTransactionProperties,
            date: DateService.convertToTimestamp(existingDate),
            recurringTransactionId: newRecurringTransaction.id
        };

        const indexedTransactions = {
            [anotherNewRecurringTransaction.id]: {
                [existingDate]: new Transaction(existingTransaction)
            }
        };

        const result = RecurringTransaction.realizeMany(
            [anotherNewRecurringTransaction],
            indexedTransactions
        );

        // Restore mock before the expect, in case the expect fails.
        spy.mockRestore();

        // We should get back the 2 transactions between the lastRealizedDate (15th) and 'today' (28th).
        expect(result.length).toBe(2);
        expect(result[0]).toMatchObject(realizedTransaction1);
        expect(result[1]).toMatchObject(realizedTransaction2);
    });

    it("doesn't realize a transaction if it would occur on the same day as lastRealizedDate", () => {
        const anotherNewRecurringTransaction = new RecurringTransaction({
            ...newRecurringTransaction,
            lastRealizedDate: today
        });

        const result = RecurringTransaction.realizeMany([anotherNewRecurringTransaction], {});

        expect(result.length).toBe(0);
    });
});

describe("generateRRule", () => {
    const expectRRule = (rrule: RRule, recurringTransaction: RecurringTransactionData) => {
        const {freq, interval, dtstart, until, count} = rrule.options;

        expect(freq).toBe(RRuleFreqMap[recurringTransaction.freq]);
        expect(interval).toBe(recurringTransaction.interval);
        expect(dtstart).toEqual(DateService.createUTCDate(recurringTransaction.startDate));

        if (recurringTransaction.endDate) {
            expect(until).toEqual(recurringTransaction.endDate);
        } else if (recurringTransaction.count) {
            expect(count).toEqual(recurringTransaction.count);
        }
    };

    it("can generate a daily rrule", () => {
        const thing = {
            ...recurringTransaction,
            freq: RecurringTransaction.FREQUENCIES.daily
        };

        const rrule = RecurringTransaction.generateRRule(thing);
        expectRRule(rrule, thing);
    });

    it("can generate a weekly rrule", () => {
        const thing = {
            ...recurringTransaction,
            freq: RecurringTransaction.FREQUENCIES.weekly
        };

        const rrule = RecurringTransaction.generateRRule(thing);
        expectRRule(rrule, thing);

        // Turns into an array internally, what can I say.
        expect(rrule.options.byweekday).toEqual([thing.on]);
    });

    it("can generate a monthly rrule", () => {
        const thing = {
            ...recurringTransaction,
            freq: RecurringTransaction.FREQUENCIES.monthly
        };

        const rrule = RecurringTransaction.generateRRule(thing);
        expectRRule(rrule, thing);

        // Turns into an array internally, what can I say.
        expect(rrule.options.bymonthday).toEqual([thing.on]);
    });

    it("can generate a yearly rrule", () => {
        const thing = {
            ...recurringTransaction,
            freq: RecurringTransaction.FREQUENCIES.yearly
        };

        const rrule = RecurringTransaction.generateRRule(thing);
        expectRRule(rrule, thing);

        // Turns into an array internally, what can I say.
        expect(rrule.options.byyearday).toEqual([thing.on]);
    });

    it("can generate a yearly rrule", () => {
        const thing = {
            ...recurringTransaction,
            freq: RecurringTransaction.FREQUENCIES.yearly
        };

        const rrule = RecurringTransaction.generateRRule(thing);
        expectRRule(rrule, thing);

        // Turns into an array internally, what can I say.
        expect(rrule.options.byyearday).toEqual([thing.on]);
    });

    it("caches rrule instances between calls", () => {
        const rrule1 = RecurringTransaction.generateRRule(recurringTransaction);
        const rrule2 = RecurringTransaction.generateRRule(recurringTransaction);

        expect(rrule1 === rrule2).toBe(true);
    });

    it("busts the cache when a property changes", () => {
        const rrule1 = RecurringTransaction.generateRRule(recurringTransaction);
        const rrule2 = RecurringTransaction.generateRRule({...recurringTransaction, on: 1});

        expect(rrule1 === rrule2).toBe(false);
    });
});
