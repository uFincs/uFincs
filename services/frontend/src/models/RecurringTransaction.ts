import {Options as RRuleOptions, RRule} from "rrule";
import {v4 as uuidv4} from "uuid";
import {Account, AccountData, Transaction, TransactionData, TransactionType} from "models/";
import {DateService, ValueConversion} from "services/";
import {AnyDate, Cents, Id, NonFunctionProperties} from "utils/types";
import InputValidation from "values/inputValidation";
import {TransactionFormData} from "values/transactionForm";

export enum RecurringTransactionFrequency {
    daily = "daily",
    weekly = "weekly",
    monthly = "monthly",
    yearly = "yearly"
}

export enum RecurringTransactionWeekday {
    monday = 0,
    tuesday = 1,
    wednesday = 2,
    thursday = 3,
    friday = 4,
    saturday = 5,
    sunday = 6
}

export enum RecurringTransactionMonth {
    january = 0,
    february = 1,
    march = 2,
    april = 3,
    may = 4,
    june = 5,
    july = 6,
    august = 7,
    september = 8,
    october = 9,
    november = 10,
    december = 11
}

export enum RecurringTransactionEndCondition {
    after = "after",
    on = "on",
    never = "never"
}

export const RRuleFreqMap = {
    [RecurringTransactionFrequency.daily]: RRule.DAILY,
    [RecurringTransactionFrequency.weekly]: RRule.WEEKLY,
    [RecurringTransactionFrequency.monthly]: RRule.MONTHLY,
    [RecurringTransactionFrequency.yearly]: RRule.YEARLY
};

const MONTH_DAYS = [-1, ...[...Array(31).keys()].map((n) => n + 1)];

export interface RecurringTransactionData
    extends Omit<NonFunctionProperties<RecurringTransaction>, "creditAccount" | "debitAccount"> {
    creditAccount?: Partial<Account>;
    debitAccount?: Partial<Account>;
}

interface RecurringTransactionConstructor
    extends Omit<
        RecurringTransaction,
        "amount" | "on" | "startDate" | "endDate" | "neverEnds" | "createdAt" | "updatedAt"
    > {
    amount: Cents | string;
    on: number | string;
    startDate: Date | string;
    endDate?: Date | string | null;
    neverEnds?: boolean | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export default class RecurringTransaction {
    id: Id;
    creditAccountId: Id;
    debitAccountId: Id;

    amount: Cents;
    description: string;
    notes: string;
    type: TransactionType;

    interval: number;
    freq: RecurringTransactionFrequency;
    on: number;
    startDate: string;
    endDate?: string | null;
    count?: number | null;
    neverEnds?: boolean | null;
    lastRealizedDate?: string | null;

    createdAt: string;
    updatedAt: string;

    // Properties derived from store.
    creditAccount: Partial<Account>;
    debitAccount: Partial<Account>;

    static FREQUENCIES = RecurringTransactionFrequency;
    static WEEKDAYS = RecurringTransactionWeekday;
    static MONTH_DAYS = MONTH_DAYS;
    static MONTHS = RecurringTransactionMonth;
    static END_CONDITIONS = RecurringTransactionEndCondition;

    static rruleCache: Record<string, RRule> = {};

    constructor({
        id = uuidv4(),
        creditAccountId = "",
        debitAccountId = "",
        amount = 0,
        description = "",
        notes = "",
        type = Transaction.INCOME,
        interval = 0,
        freq = RecurringTransactionFrequency.daily,
        on = 0,
        startDate = DateService.getTodayDate(),
        endDate = null,
        count = null,
        neverEnds = null,
        lastRealizedDate = null,
        createdAt = DateService.getTodayDateTime(),
        updatedAt = DateService.getTodayDateTime(),
        creditAccount = {},
        debitAccount = {}
    }: Partial<RecurringTransactionConstructor> = {}) {
        this.id = id;
        this.creditAccountId = creditAccountId;
        this.debitAccountId = debitAccountId;

        this.description = description;
        this.notes = notes;
        this.type = type;

        this.interval = interval;
        this.freq = freq;
        this.on = typeof on === "string" ? parseInt(on) : on;

        this.startDate = startDate
            ? DateService.convertToTimestamp(DateService.stripTime(startDate))
            : startDate;

        this.endDate = endDate
            ? DateService.convertToTimestamp(DateService.stripTime(endDate))
            : endDate;

        this.count = count !== null && isNaN(count) ? null : count;
        this.neverEnds = neverEnds === "true" || neverEnds ? true : false;

        this.lastRealizedDate = lastRealizedDate
            ? DateService.convertToTimestamp(DateService.stripTime(lastRealizedDate))
            : null;

        this.createdAt = DateService.convertToTimestamp(createdAt);
        this.updatedAt = DateService.convertToTimestamp(updatedAt);

        // Contingency against the Backend giving us strings instead of numbers.
        // This happened once after the BIGINT switch for numbers.
        // Also, encrypted amounts that are then decrypted always come back as strings.
        // As such, they have to be converted back to numbers.
        if (typeof amount === "string") {
            this.amount = parseInt(amount);
        } else {
            this.amount = amount ? amount : 0;
        }

        // Aggregate properties
        this.creditAccount = creditAccount;
        this.debitAccount = debitAccount;
    }

    convertAmountToCents(): void {
        this.amount = ValueConversion.convertDollarsToCents(this.amount);
    }

    validate(): RecurringTransaction {
        const {
            amount,
            description,
            type,
            creditAccountId,
            debitAccountId,
            interval,
            freq,
            startDate,
            endDate
        } = this;

        if (amount !== 0 && (!amount || isNaN(amount) || amount > InputValidation.maxNumber)) {
            throw new Error("Invalid amount");
        }

        if (!isNaN(amount) && amount < 0) {
            throw new Error("Amount negative");
        }

        if (!description) {
            throw new Error("Missing description");
        }

        if (!Transaction.TRANSACTION_TYPES.includes(type)) {
            throw new Error("Invalid type");
        }

        const {creditAccountTypes, debitAccountTypes} = Transaction.determineAccountTypes(type);
        const creditAccountType = creditAccountTypes.join("/");
        const debitAccountType = debitAccountTypes.join("/");

        if (!creditAccountId) {
            throw new Error(`Missing ${creditAccountType} account`);
        }

        if (!debitAccountId) {
            throw new Error(`Missing ${debitAccountType} account`);
        }

        if (creditAccountId === debitAccountId) {
            throw new Error("Accounts can't be the same");
        }

        if (!isNaN(interval) && interval < 0) {
            throw new Error("Missing interval");
        }

        if (!freq) {
            throw new Error("Missing frequency");
        }

        if (!startDate) {
            throw new Error("Missing start date");
        }

        if (endDate && DateService.isLessThan(endDate, startDate)) {
            throw new Error("End date can't be before start date");
        }

        return this;
    }

    public static extractDataFields(object: any): RecurringTransactionData {
        try {
            const {
                id,
                creditAccountId,
                debitAccountId,
                amount,
                description,
                notes,
                type,
                interval,
                freq,
                on,
                startDate,
                endDate,
                count,
                neverEnds,
                lastRealizedDate,
                createdAt,
                updatedAt
            } = object;

            return {
                id,
                creditAccountId,
                debitAccountId,
                amount,
                description,
                notes,
                type,
                interval,
                freq,
                on,
                startDate,
                endDate,
                count,
                neverEnds,
                lastRealizedDate,
                createdAt,
                updatedAt
            };
        } catch {
            throw new Error("Failed to extract data from recurring transaction");
        }
    }

    public static populateTransaction(
        accountsById: Record<Id, AccountData>
    ): (transactionData: Partial<RecurringTransactionData>) => RecurringTransaction {
        return (transactionData: Partial<RecurringTransactionData>): RecurringTransaction => {
            const transaction = new RecurringTransaction(transactionData);
            const {creditAccountId, debitAccountId} = transaction;

            transaction.creditAccount = creditAccountId
                ? accountsById[transaction.creditAccountId]
                : {};

            transaction.debitAccount = debitAccountId
                ? accountsById[transaction.debitAccountId]
                : {};

            return transaction;
        };
    }

    /** The only reason we currently have to convert a recurring transaction to a 'regular' transaction
     *  is for easy display of the recurring transactions in the `TransactionsList/Table`.
     *
     *  We basically treat the `startDate` as the `date` and just go from there. */
    public static convertToRegularTransaction(
        recurringTransaction: RecurringTransactionData
    ): Transaction {
        return new Transaction({
            ...recurringTransaction,
            date: recurringTransaction.startDate
        });
    }

    /** Using the `freq`, parses out the various `onX` properties to determine a final `on` value. */
    static parseFormFrequency(
        formData: Pick<
            TransactionFormData,
            "freq" | "onWeekday" | "onMonthday" | "onMonth" | "onDay"
        >
    ): number {
        switch (formData.freq) {
            case RecurringTransaction.FREQUENCIES.daily:
                return 0;
            case RecurringTransaction.FREQUENCIES.weekly:
                return parseInt(formData.onWeekday);
            case RecurringTransaction.FREQUENCIES.monthly:
                return parseInt(formData.onMonthday);
            case RecurringTransaction.FREQUENCIES.yearly:
                return DateService.getDayOfYear(formData.onMonth, formData.onDay);
            default:
                return 0;
        }
    }

    static parseFormEndCondition(
        formData: Pick<TransactionFormData, "endCondition" | "count" | "endDate">
    ) {
        const parsedData: Partial<RecurringTransactionData> = {};

        switch (formData.endCondition) {
            case RecurringTransaction.END_CONDITIONS.after:
                parsedData.count = parseInt(formData.count);
                break;
            case RecurringTransaction.END_CONDITIONS.on:
                parsedData.endDate = formData.endDate;
                break;
            case RecurringTransaction.END_CONDITIONS.never:
                parsedData.neverEnds = true;
                break;
        }

        return parsedData;
    }

    static convertFrequencyToFormData(
        recurringTransaction: RecurringTransactionData
    ): Partial<TransactionFormData> {
        const {freq, on} = recurringTransaction;
        const formData: Partial<TransactionFormData> = {};

        switch (freq) {
            case RecurringTransaction.FREQUENCIES.daily:
                break;
            case RecurringTransaction.FREQUENCIES.weekly:
                formData.onWeekday = `${on}`;
                break;
            case RecurringTransaction.FREQUENCIES.monthly:
                formData.onMonthday = `${on}`;
                break;
            case RecurringTransaction.FREQUENCIES.yearly: {
                const {month, day} = DateService.getMonthDayFromDayOfYear(on);

                formData.onMonth = `${month}`;
                formData.onDay = `${day}`;
                break;
            }
        }

        return formData;
    }

    static convertEndConditionToFormData(
        recurringTransaction: RecurringTransactionData
    ): Partial<TransactionFormData> {
        const {endDate, count, neverEnds} = recurringTransaction;
        const formData: Partial<TransactionFormData> = {};

        if (endDate) {
            formData.endCondition = RecurringTransaction.END_CONDITIONS.on;
            formData.endDate = DateService.convertToUTCString(endDate);
        } else if (count) {
            formData.endCondition = RecurringTransaction.END_CONDITIONS.after;
            formData.count = `${count}`;
        } else if (neverEnds) {
            formData.endCondition = RecurringTransaction.END_CONDITIONS.never;
        }

        return formData;
    }

    /** Generates the set of dates using the rules of the given recurring transaction and
     *  the start/endDate. */
    public static getDatesBetween(
        recurringTransaction: RecurringTransactionData,
        startDate: AnyDate,
        endDate: AnyDate
    ): Array<Date> {
        const rule = RecurringTransaction.generateRRule(recurringTransaction);

        const dates = rule.between(
            DateService.createUTCDate(startDate),
            DateService.createUTCDate(endDate),
            true // start/end are inclusive
        );

        RecurringTransaction._adjustYearlyDates(recurringTransaction, dates);

        return dates;
    }

    /** Generates the set of dates using the rules of the given recurring transaction and
     *  the start/endDate, ensuring that all generated dates are only in the future. This is used
     *  for doing things like generating the virtual transactions for the future. */
    public static getFutureDatesBetween(
        recurringTransaction: RecurringTransactionData,
        startDate: AnyDate,
        endDate: AnyDate
    ): Array<Date> {
        const tomorrow = DateService.addDays(DateService.getTodayDate(), 1);
        let startDateObject = DateService.createUTCDate(startDate);

        // Don't want to realize transactions that are now considered in the past/today.
        // Why? Cause that makes no sense; they should have already been concretely realized.
        startDateObject = DateService.isLessThan(startDateObject, tomorrow)
            ? tomorrow
            : startDateObject;

        return RecurringTransaction.getDatesBetween(recurringTransaction, startDateObject, endDate);
    }

    /** Checks whether or not the given recurring transaction should happen today.
     *
     *  Used to decide whether or not the recurring transaction should be realized concretely today. */
    public static doesOccurToday(recurringTransaction: RecurringTransactionData): boolean {
        const rule = RecurringTransaction.generateRRule(recurringTransaction);

        const today = DateService.getTodayDate();
        const dates = rule.between(today, today, true);

        return dates.length > 0;
    }

    /** Handles the act of 'realizing' a recurring transaction into a 'concrete' transactions.
     *
     *  That is, it basically just maps the properties of a recurring transaction onto
     *  a regular transaction, with a specific date (generated by e.g. `getDatesBetween`). */
    public static realize(
        recurringTransaction: RecurringTransactionData,
        date: string
    ): Transaction {
        const {id, creditAccountId, debitAccountId, amount, description, notes, type} =
            recurringTransaction;

        return new Transaction({
            amount,
            date,
            description,
            notes,
            type,
            creditAccountId,
            debitAccountId,
            recurringTransactionId: id
        });
    }

    /** This is the core business logic for realizing all of a user's recurring transactions.
     *
     *  This can happen during, for example, app boot to realize any transactions on a new day.
     *
     *  It can also happen during recurring transaction creation, to create transactions between
     *  the start of the new recurring transaction and today (that is what the `includePast` arg is for). */
    public static realizeMany(
        recurringTransactions: Array<RecurringTransactionData>,
        transactionsByRecurringTransaction: Record<Id, Record<string, TransactionData>>,
        // If includePast = true, then we need to backfill concrete transactions since the start date
        // of each recurring transaction.
        {includePast = false} = {}
    ): Array<Transaction> {
        const today = DateService.getTodayAsUTCString();

        // These will be the newly realized transactions.
        const newTransactions: Array<Transaction> = [];

        for (const recurringTransaction of recurringTransactions) {
            // We want to realize transactions between the last transaction that was realized and today,
            // rather than only realizing on today, to accommodate the many users who don't log in everyday.
            //
            // (This is another way of saying that UFC-398 was a boneheaded mistake.)
            const lastRealizedDate = (() => {
                if (recurringTransaction.lastRealizedDate) {
                    return recurringTransaction.lastRealizedDate;
                } else if (recurringTransaction.id in transactionsByRecurringTransaction) {
                    // Since the `lastRealizedDate` was introduced quite late (UFC-404), we need to
                    // fall back to to using the last realized transaction.
                    const dates = Object.keys(
                        transactionsByRecurringTransaction[recurringTransaction.id]
                    );

                    return dates[dates.length - 1];
                } else {
                    // In the event that a recurring transaction has never been realized before,
                    // we need to use its startDate to catch up on any missed realization dates in case
                    // the user misses even the first realization.
                    //
                    // This comment specifically addresses the bug of UFC-402 where before this returned
                    // `today` here.
                    return recurringTransaction.startDate;
                }
            })();

            // If we're including the past, that means that the recurring transactions were just created.
            // As such, we need to backfill concrete transactions since the start of the recurring transaction.
            //
            // Otherwise, we're just handling realization since the last realized transaction.
            const startDate = includePast ? recurringTransaction.startDate : lastRealizedDate;

            const dates = RecurringTransaction.getDatesBetween(
                recurringTransaction,
                startDate,
                today
            );

            for (const date of dates) {
                const utcDate = DateService.convertToUTCString(date);

                if (
                    // If the transaction doesn't already exist on the given date...
                    !transactionsByRecurringTransaction?.[recurringTransaction.id]?.[utcDate] &&
                    // and the date doesn't match up with the last time the recurring transaction was realized,
                    // then create the transaction.
                    //
                    // The reason we have this second condition is UFC-404. Essentially, if a user deletes a
                    // realized transaction, then we want it to stay deleted. If we only use the date
                    // of the last realized transaction (not the `lastRealizedDate` property), then
                    // it effectively means that we can never delete the last realized transaction (until
                    // we realize another one).
                    //
                    // But if we keep track of when we actually last ran this realization algorithm, then
                    // we can prevent those deleted transactions from being re-created.
                    //
                    // The only way this doesn't work is if the user does time travelling (i.e they go
                    // into the future, realize a transaction, delete it, and then go back to the past).
                    // Which... we don't support.
                    !(
                        recurringTransaction.lastRealizedDate &&
                        DateService.convertToUTCString(recurringTransaction.lastRealizedDate) ===
                            utcDate
                    )
                ) {
                    newTransactions.push(
                        RecurringTransaction.realize(recurringTransaction, utcDate)
                    );
                }
            }
        }

        return newTransactions;
    }

    /** Converts our data model of a 'recurring transaction' into an `rrule`, the object of the library
     *  of the same name that handles determining the concrete dates of a given recurrence series. */
    public static generateRRule(recurringTransaction: RecurringTransactionData): RRule {
        const {id, interval, freq, on, startDate, endDate, count} = recurringTransaction;

        // Use all of the properties as part of the cache key so that we get free cache busting whenever
        // the recurring transaction updates.
        const cacheKey = `${id}-${interval}-${freq}-${on}-${startDate}-${endDate}-${count}`;

        // We _need_ to cache the `RRule` instances, so that we can take advantage of rrule's underlying
        // cache mechanism. This greatly speeds up subsequent `findBetween` operations.
        if (cacheKey in RecurringTransaction.rruleCache) {
            return RecurringTransaction.rruleCache[cacheKey];
        }

        const properties: Partial<RRuleOptions> = {
            freq: RRuleFreqMap[freq],
            interval,
            dtstart: DateService.createUTCDate(startDate)
        };

        if (freq === RecurringTransactionFrequency.weekly) {
            properties.byweekday = on;
        } else if (freq === RecurringTransactionFrequency.monthly) {
            properties.bymonthday = on;
        } else if (freq === RecurringTransactionFrequency.yearly) {
            properties.byyearday = on;
        }

        if (endDate) {
            properties.until = DateService.createUTCDate(endDate);
        } else if (count) {
            properties.count = count;
        }

        const rrule = new RRule(properties);
        RecurringTransaction.rruleCache[cacheKey] = rrule;

        return rrule;
    }

    private static _adjustYearlyDates(
        recurringTransaction: RecurringTransactionData,
        dates: Array<Date>
    ) {
        // Need to manually account for leap years when using yearly frequencies.
        //
        // Otherwise, the dates will be off by one in leap years.
        //
        // Only need to adjust dates on March 1 or after, since dates before aren't affected by the addition
        // of February 29.
        if (
            recurringTransaction.freq === RecurringTransactionFrequency.yearly &&
            recurringTransaction.on > DateService.YEARLY_LEAP_YEAR_CUTOFF
        ) {
            for (let i = 0; i < dates.length; i++) {
                let date = dates[i];

                if (DateService.isLeapYear(date.getUTCFullYear())) {
                    date = DateService.addDays(date, 1);
                    dates[i] = date;
                }
            }
        }
    }
}
