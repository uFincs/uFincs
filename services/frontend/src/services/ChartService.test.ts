import {Account, Transaction} from "models/";
import {ChartDateInterval, DateAmountDataPoint, UTCDateString} from "utils/types";
import ChartService from "./ChartService";
import DateService from "./DateService";

describe("generateDateAmountData", () => {
    describe("Dates interval", () => {
        it("calculates the per-day amount based on account and transaction types", () => {
            const asset = new Account({type: Account.ASSET});
            const income = new Transaction({amount: 1000, type: Transaction.INCOME});
            const expense = new Transaction({amount: 1000, type: Transaction.EXPENSE});

            expect(
                ChartService.generateDateAmountData({
                    amountReducer: Account.balanceReducer(asset),
                    transactionsByDate: {
                        "2020-08-02": [income],
                        "2020-08-04": [income, income, expense],
                        "2020-08-07": [expense, expense]
                    },
                    startingBalance: 10000,
                    startDate: "2020-08-01" as UTCDateString,
                    endDate: "2020-08-08" as UTCDateString
                })
            ).toEqual([
                {amount: 10000, date: DateService.createUTCDate("2020-08-01")},
                {amount: 11000, date: DateService.createUTCDate("2020-08-02")},
                {amount: 11000, date: DateService.createUTCDate("2020-08-03")},
                {amount: 12000, date: DateService.createUTCDate("2020-08-04")},
                {amount: 12000, date: DateService.createUTCDate("2020-08-05")},
                {amount: 12000, date: DateService.createUTCDate("2020-08-06")},
                {amount: 10000, date: DateService.createUTCDate("2020-08-07")},
                {amount: 10000, date: DateService.createUTCDate("2020-08-08")}
            ]);
        });
    });

    describe("Weeks interval", () => {
        it("calculates the per-week amount based on account and transaction types", () => {
            const liability = new Account({type: Account.LIABILITY});

            const debt = new Transaction({amount: 1000, type: Transaction.DEBT});

            const transferIn = new Transaction({
                amount: 1000,
                type: Transaction.TRANSFER,
                creditAccountId: liability.id
            });

            const transferOut = new Transaction({
                amount: 1000,
                type: Transaction.TRANSFER,
                debitAccountId: liability.id
            });

            expect(
                ChartService.generateDateAmountData({
                    amountReducer: Account.balanceReducer(liability),
                    transactionsByDate: {
                        "2020-06-12": [debt],
                        "2020-07-04": [debt, transferIn, transferOut],
                        "2020-08-07": [transferOut, transferOut]
                    },
                    startingBalance: 10000,
                    startDate: "2020-06-01" as UTCDateString,
                    endDate: "2020-08-31" as UTCDateString
                })
            ).toEqual([
                {amount: 10000, date: DateService.createUTCDate("2020-06-07")},
                {amount: 11000, date: DateService.createUTCDate("2020-06-14")},
                {amount: 11000, date: DateService.createUTCDate("2020-06-21")},
                {amount: 11000, date: DateService.createUTCDate("2020-06-28")},
                {amount: 12000, date: DateService.createUTCDate("2020-07-05")},
                {amount: 12000, date: DateService.createUTCDate("2020-07-12")},
                {amount: 12000, date: DateService.createUTCDate("2020-07-19")},
                {amount: 12000, date: DateService.createUTCDate("2020-07-26")},
                {amount: 12000, date: DateService.createUTCDate("2020-08-02")},
                {amount: 10000, date: DateService.createUTCDate("2020-08-09")},
                {amount: 10000, date: DateService.createUTCDate("2020-08-16")},
                {amount: 10000, date: DateService.createUTCDate("2020-08-23")},
                {amount: 10000, date: DateService.createUTCDate("2020-08-30")},
                {amount: 10000, date: DateService.createUTCDate("2020-08-31")}
            ]);
        });
    });

    describe("Months interval", () => {
        it("calculates the per-month amount based on account and transaction types", () => {
            const income = new Account({type: Account.INCOME});
            const transaction = new Transaction({amount: 1000, type: Transaction.INCOME});

            expect(
                ChartService.generateDateAmountData({
                    amountReducer: Account.balanceReducer(income),
                    transactionsByDate: {
                        "2020-06-12": [transaction],
                        "2020-07-04": [transaction, transaction, transaction],
                        "2020-08-07": [transaction, transaction]
                    },
                    startingBalance: 10000,
                    startDate: "2020-01-01" as UTCDateString,
                    endDate: "2020-08-31" as UTCDateString
                })
            ).toEqual([
                {amount: 10000, date: DateService.createUTCDate("2020-01-31")},
                {amount: 10000, date: DateService.createUTCDate("2020-02-29")},
                {amount: 10000, date: DateService.createUTCDate("2020-03-31")},
                {amount: 10000, date: DateService.createUTCDate("2020-04-30")},
                {amount: 10000, date: DateService.createUTCDate("2020-05-31")},
                {amount: 11000, date: DateService.createUTCDate("2020-06-30")},
                {amount: 14000, date: DateService.createUTCDate("2020-07-31")},
                {amount: 16000, date: DateService.createUTCDate("2020-08-31")}
            ]);
        });
    });

    describe("Years interval", () => {
        it("calculates the per-year amount based on account and transaction types", () => {
            const expense = new Account({type: Account.EXPENSE});
            const transaction = new Transaction({amount: 1000, type: Transaction.EXPENSE});

            expect(
                ChartService.generateDateAmountData({
                    amountReducer: Account.balanceReducer(expense),
                    transactionsByDate: {
                        "2021-01-01": [transaction],
                        "2021-02-01": [transaction],
                        "2022-07-04": [transaction, transaction, transaction],
                        "2022-08-04": [transaction, transaction],
                        "2023-08-07": [transaction],
                        "2024-09-09": [transaction],
                        "2025-10-10": [transaction, transaction, transaction],
                        "2025-10-11": [transaction],
                        "2026-11-11": [transaction, transaction],
                        "2027-12-12": [transaction]
                    },
                    startingBalance: 10000,
                    startDate: "2020-01-01" as UTCDateString,
                    endDate: "2027-12-31" as UTCDateString
                })
            ).toEqual([
                {amount: 10000, date: DateService.createUTCDate("2020-12-31")},
                {amount: 12000, date: DateService.createUTCDate("2021-12-31")},
                {amount: 17000, date: DateService.createUTCDate("2022-12-31")},
                {amount: 18000, date: DateService.createUTCDate("2023-12-31")},
                {amount: 19000, date: DateService.createUTCDate("2024-12-31")},
                {amount: 23000, date: DateService.createUTCDate("2025-12-31")},
                {amount: 25000, date: DateService.createUTCDate("2026-12-31")},
                {amount: 26000, date: DateService.createUTCDate("2027-12-31")}
            ]);
        });
    });

    it("can use non-running balances (i.e. each day is independent)", () => {
        const income = new Account({type: Account.INCOME});
        const transaction = new Transaction({amount: 1000, type: Transaction.INCOME});

        expect(
            ChartService.generateDateAmountData({
                amountReducer: Account.balanceReducer(income),
                transactionsByDate: {
                    "2020-08-02": [transaction],
                    "2020-08-04": [transaction, transaction, transaction],
                    "2020-08-07": [transaction, transaction]
                },
                startingBalance: 10000,
                startDate: "2020-08-01" as UTCDateString,
                endDate: "2020-08-08" as UTCDateString,
                usesRunningBalances: false
            })
        ).toEqual([
            {amount: 0, date: DateService.createUTCDate("2020-08-01")},
            {amount: 1000, date: DateService.createUTCDate("2020-08-02")},
            {amount: 0, date: DateService.createUTCDate("2020-08-03")},
            {amount: 3000, date: DateService.createUTCDate("2020-08-04")},
            {amount: 0, date: DateService.createUTCDate("2020-08-05")},
            {amount: 0, date: DateService.createUTCDate("2020-08-06")},
            {amount: 2000, date: DateService.createUTCDate("2020-08-07")},
            {amount: 0, date: DateService.createUTCDate("2020-08-08")}
        ]);
    });

    it("doesn't ignore transactions that bring the amount down to 0", () => {
        // See UFC-392 for the bug this tests for.
        // tl;dr Because of a "|| amount", it was ignoring 0 dollar balances.

        const liability = new Account({type: Account.LIABILITY});
        const increaseTransaction = new Transaction({amount: 1000, type: Transaction.DEBT});

        const decreaseTransaction = new Transaction({
            amount: 3000,
            type: Transaction.TRANSFER,
            debitAccountId: liability.id
        });

        expect(
            ChartService.generateDateAmountData({
                amountReducer: Account.balanceReducer(liability),
                transactionsByDate: {
                    "2020-08-02": [increaseTransaction],
                    "2020-08-04": [increaseTransaction, increaseTransaction],
                    "2020-08-07": [decreaseTransaction]
                },
                startingBalance: 0,
                startDate: "2020-08-01" as UTCDateString,
                endDate: "2020-08-08" as UTCDateString
            })
        ).toEqual([
            {amount: 0, date: DateService.createUTCDate("2020-08-01")},
            {amount: 1000, date: DateService.createUTCDate("2020-08-02")},
            {amount: 1000, date: DateService.createUTCDate("2020-08-03")},
            {amount: 3000, date: DateService.createUTCDate("2020-08-04")},
            {amount: 3000, date: DateService.createUTCDate("2020-08-05")},
            {amount: 3000, date: DateService.createUTCDate("2020-08-06")},
            {amount: 0, date: DateService.createUTCDate("2020-08-07")},
            {amount: 0, date: DateService.createUTCDate("2020-08-08")}
        ]);
    });
});

describe("splitCurrentFutureData", () => {
    const today = DateService.getTodayDate();

    const todayData = {amount: 450, date: today};

    const currentData: Array<DateAmountDataPoint> = [
        {amount: 100, date: DateService.subtractDays(today, 10)},
        {amount: 200, date: DateService.subtractDays(today, 8)},
        {amount: 300, date: DateService.subtractDays(today, 6)},
        {amount: 400, date: DateService.subtractDays(today, 4)}
    ];

    const futureData: Array<DateAmountDataPoint> = [
        {amount: 500, date: DateService.addDays(today, 2)},
        {amount: 600, date: DateService.addDays(today, 4)},
        {amount: 700, date: DateService.addDays(today, 6)},
        {amount: 800, date: DateService.addDays(today, 8)}
    ];

    const data = [...currentData, ...futureData];

    it("can split the data into current and future sets", () => {
        const result = ChartService.splitCurrentFutureData(data, ChartDateInterval.days);

        expect(result.currentData).toEqual(currentData);
        expect(result.futureData).toEqual(futureData);
    });

    it("adds today's data point to current and future when date interval is Days", () => {
        const dataWithToday = [...currentData, todayData, ...futureData];

        const result = ChartService.splitCurrentFutureData(dataWithToday, ChartDateInterval.days);

        expect(result.currentData).toEqual([...currentData, todayData]);
        expect(result.futureData).toEqual([todayData, ...futureData]);
    });

    it("adds the next closest data point after today to both sets when date interval isn't Days", () => {
        const result = ChartService.splitCurrentFutureData(data, ChartDateInterval.weeks);

        expect(result.currentData).toEqual([...currentData, futureData[0]]);
        expect(result.futureData).toEqual(futureData);
    });
});

describe("calculateDateInterval", () => {
    it("uses the 'days' interval when the date range is less than (or equal to) 60 days", () => {
        expect(
            ChartService.calculateDateInterval(
                "2020-08-01" as UTCDateString,
                "2020-08-31" as UTCDateString
            )
        ).toBe(ChartDateInterval.days);

        expect(
            ChartService.calculateDateInterval(
                "2020-07-02" as UTCDateString,
                "2020-08-31" as UTCDateString
            )
        ).toBe(ChartDateInterval.days);
    });

    it(`uses the 'weeks' interval when the date range is greater than 60 days
        but less than (or equal to) 180 days`, () => {
        expect(
            ChartService.calculateDateInterval(
                "2020-06-01" as UTCDateString,
                "2020-08-31" as UTCDateString
            )
        ).toBe(ChartDateInterval.weeks);

        expect(
            ChartService.calculateDateInterval(
                "2020-03-04" as UTCDateString,
                "2020-08-31" as UTCDateString
            )
        ).toBe(ChartDateInterval.weeks);
    });

    it("uses the 'months' interval when the date range is greater than 180 days", () => {
        expect(
            ChartService.calculateDateInterval(
                "2020-01-01" as UTCDateString,
                "2020-08-31" as UTCDateString
            )
        ).toBe(ChartDateInterval.months);
    });

    it("uses the 'years' interval when the date range is greater than 1800 days (~5 years)", () => {
        expect(
            ChartService.calculateDateInterval(
                "2020-01-01" as UTCDateString,
                "2030-12-31" as UTCDateString
            )
        ).toBe(ChartDateInterval.years);
    });
});

describe("calculateMoneyDomain", () => {
    it(`adds an offset to the min/max money values equal to 1/4 the difference 
        between the max/min values  so that the chart line never hits the top/bottom 
        of the chart`, () => {
        expect(ChartService.calculateMoneyDomain([5000, 10000, 5123, 8000])).toEqual([3750, 11250]);
    });

    it("makes sure the min doesn't dip below 0 when there aren't any negative values", () => {
        expect(ChartService.calculateMoneyDomain([100, 10000, 5123, 8000])).toEqual([0, 12475]);
    });

    it("does allow the min to dip below 0 if there are negative amounts", () => {
        expect(ChartService.calculateMoneyDomain([-5000, 10000, 5123, 8000])).toEqual([
            -8750, 13750
        ]);
    });

    it("can handle the min and max being the same (non zero) values", () => {
        expect(ChartService.calculateMoneyDomain([100, 100])).toEqual([90, 110]);
    });

    it("makes sure the min and max are never the same, primarily when the amounts are 0", () => {
        expect(ChartService.calculateMoneyDomain([0, 0])).toEqual([0, 100]);
    });
});

describe("formatDateLabels", () => {
    it("for days/weeks date intervals, it formats the label as 'Month Day'", () => {
        expect(ChartService.formatDateLabels(ChartDateInterval.days)(new Date("2020-08-18"))).toBe(
            "Aug 18"
        );

        expect(ChartService.formatDateLabels(ChartDateInterval.weeks)(new Date("2020-08-18"))).toBe(
            "Aug 18"
        );
    });

    it("for the months date interval, it formats the label as 'Month Year'", () => {
        expect(
            ChartService.formatDateLabels(ChartDateInterval.months)(new Date("2020-08-18"))
        ).toBe("Aug '20");
    });

    it("for the years date interval, it formats the label as 'Year'", () => {
        expect(ChartService.formatDateLabels(ChartDateInterval.years)(new Date("2020-08-18"))).toBe(
            "2020"
        );
    });

    it(`cheats because Victory seems to send months that are off by a month 
        by subtracting a date to get the right month`, () => {
        expect(
            ChartService.formatDateLabels(ChartDateInterval.months)(new Date("2020-08-01"))
        ).toBe("Jul '20");
    });
});

describe("formatMoneyLabels", () => {
    it("formats the money without any decimal places when the domain is large enough", () => {
        expect(ChartService.formatMoneyLabels([0, 1000])(123456)).toBe("$1,234");
    });

    it("formats the money with decimal places when the domain is small enough", () => {
        expect(ChartService.formatMoneyLabels([0, 100])(123456)).toBe("$1,234.56");
    });

    it("formats the money with a custom currency symbol", () => {
        expect(ChartService.formatMoneyLabels([0, 100], {currencySymbol: "€"})(123456)).toBe(
            "€1,234.56"
        );
    });
});

describe("formatMoneyTooltips", () => {
    const datum = {
        active: true,
        data: [
            {amount: 123456, date: DateService.createUTCDate("2020-08-08")},
            {amount: 123456, date: DateService.createUTCDate("2020-08-15")},
            {amount: 123456, date: DateService.createUTCDate("2020-08-17")}
        ],
        index: "1"
    };

    it("can format with a custom currency symbol", () => {
        expect(
            ChartService.formatMoneyTooltips(ChartDateInterval.days, "", {currencySymbol: "€"})(
                datum
            )
        ).toBe("Aug 15\n€1,234.56");
    });

    describe("Days interval", () => {
        it("formats as date on one line and amount on another", () => {
            expect(ChartService.formatMoneyTooltips(ChartDateInterval.days)(datum)).toBe(
                "Aug 15\n$1,234.56"
            );
        });

        it("can have a prefix before the date", () => {
            expect(
                ChartService.formatMoneyTooltips(ChartDateInterval.days, "Income: ")(datum)
            ).toBe("Income: Aug 15\n$1,234.56");
        });
    });

    describe("Weeks interval", () => {
        it("formats as start/end date of week on one line and amount on another", () => {
            expect(ChartService.formatMoneyTooltips(ChartDateInterval.weeks)(datum)).toBe(
                "Aug 9 - Aug 15\n$1,234.56"
            );
        });

        it(`can handle the last data point being less than a week after the 
            second-to-last data point`, () => {
            const datum2 = {...datum, index: "2"};

            expect(ChartService.formatMoneyTooltips(ChartDateInterval.weeks)(datum2)).toBe(
                "Aug 16 - Aug 17\n$1,234.56"
            );
        });

        it(`can handle the last data point being only a day after the second-to-last data point
            by showing only the last date instead of a week range`, () => {
            const datum2 = {...datum, index: "2"};
            datum2.data[2].date = DateService.createUTCDate("2020-08-16");

            expect(ChartService.formatMoneyTooltips(ChartDateInterval.weeks)(datum2)).toBe(
                "Aug 16\n$1,234.56"
            );
        });

        it("can handle there being only 1 data point", () => {
            const datum2 = {
                active: true,
                data: [{amount: 123456, date: DateService.createUTCDate("2020-08-15")}],
                index: "0"
            };

            expect(ChartService.formatMoneyTooltips(ChartDateInterval.weeks)(datum2)).toBe(
                "Aug 9 - Aug 15\n$1,234.56"
            );
        });

        it("can have a prefix before the date", () => {
            expect(
                ChartService.formatMoneyTooltips(ChartDateInterval.weeks, "Income: ")(datum)
            ).toBe("Income: Aug 9 - Aug 15\n$1,234.56");
        });
    });

    describe("Months interval", () => {
        it("formats as month/year on one line and amount on another", () => {
            expect(ChartService.formatMoneyTooltips(ChartDateInterval.months)(datum)).toBe(
                "Aug '20\n$1,234.56"
            );
        });

        it("can have a prefix before the date", () => {
            expect(
                ChartService.formatMoneyTooltips(ChartDateInterval.months, "Income: ")(datum)
            ).toBe("Income: Aug '20\n$1,234.56");
        });
    });

    describe("Years interval", () => {
        it("formats as year on one line and amount on another", () => {
            expect(ChartService.formatMoneyTooltips(ChartDateInterval.years)(datum)).toBe(
                "2020\n$1,234.56"
            );
        });

        it("can have a prefix before the date", () => {
            expect(
                ChartService.formatMoneyTooltips(ChartDateInterval.years, "Income: ")(datum)
            ).toBe("Income: 2020\n$1,234.56");
        });
    });

    it("can handle the data point being inactive by returning an empty string", () => {
        const datum2 = {...datum, active: false};
        expect(ChartService.formatMoneyTooltips(ChartDateInterval.days)(datum2)).toBe("");
    });

    it("can handle the date not being presented on the data point (can happen with sparse data)", () => {
        const datum2 = {...datum, data: [{date: undefined, amount: 0}], index: "0"};

        // @ts-ignore Allow the date to be undefined.
        expect(ChartService.formatMoneyTooltips(ChartDateInterval.days)(datum2)).toBe("");
    });
});
