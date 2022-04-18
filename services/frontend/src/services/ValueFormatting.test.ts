import ValueFormatting from "./ValueFormatting";

const {
    formatDate,
    formatDateAsMonthAndDay,
    formatDateAsShortMonthAndYear,
    formatMoney,
    formatPercent
} = ValueFormatting;

const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

describe("formatMoney", () => {
    it("formats cents to dollars with a dollar sign, commas, and decimals", () => {
        expect(formatMoney(123456789)).toBe("$1,234,567.89");

        expect(formatMoney(1)).toBe("$0.01");
        expect(formatMoney(10)).toBe("$0.10");
        expect(formatMoney(100)).toBe("$1.00");
        expect(formatMoney(1000)).toBe("$10.00");
        expect(formatMoney(10000)).toBe("$100.00");
        expect(formatMoney(100000)).toBe("$1,000.00");
    });

    it("adds '.00' even if there aren't any cents leftover", () => {
        expect(formatMoney(12300)).toBe("$123.00");
    });

    it("still works with cent-fractions even if those aren't expected to be used", () => {
        expect(formatMoney(0.1)).toBe("$0.001");
    });

    it("can also format negative amounts", () => {
        expect(formatMoney(-100)).toBe("-$1.00");
        expect(formatMoney(-100000)).toBe("-$1,000.00");
    });

    it("formats 0", () => {
        expect(formatMoney(0)).toBe("$0.00");
    });

    it("can format the money without a dollar sign", () => {
        expect(formatMoney(100000, {withoutDollarSign: true})).toBe("1,000.00");
    });

    it("can format the money without any decimal places", () => {
        expect(formatMoney(100000, {withoutDecimals: true})).toBe("$1,000");
        expect(formatMoney(100012, {withoutDecimals: true})).toBe("$1,000");
    });

    it("can format money with a different currency symbol", () => {
        expect(formatMoney(123456789, {currencySymbol: "€"})).toBe("€1,234,567.89");
        expect(formatMoney(123456789, {currencySymbol: ".د.ب"})).toBe(".د.ب1,234,567.89");
    });
});

describe("formatDate", () => {
    it("formats a date string to a human readable string", () => {
        const thisYear = new Date().getFullYear();
        const dateString = `${thisYear}-03-01T00:00:00.000Z`;

        const weekday = weekdays[new Date(dateString).getDay()];

        expect(formatDate(dateString)).toBe(`${weekday}, Mar 1`);
    });

    it("adds the year and removes the weekday for dates that aren't in the current year", () => {
        const nextYear = new Date().getFullYear() + 1;

        expect(formatDate("2018-03-01T00:00:00.000Z")).toBe("Mar 1, 2018");
        expect(formatDate(`${nextYear}-03-01T00:00:00.000Z`)).toBe(`Mar 1, ${nextYear}`);
    });

    it("can force formatting with the full year", () => {
        const dateString = "2020-03-01T00:00:00.000Z";
        expect(formatDate(dateString, {useFullYear: true})).toBe("Mar 1, 2020");
    });

    it("returns an empty string when given an invalid date", () => {
        expect(formatDate("not a date")).toBe("");

        // @ts-ignore Want to ensure invalid stuff still works.
        expect(formatDate({not: "a date"})).toBe("");
    });
});

describe("formatDateAsMonthAndDay", () => {
    it("formats a date string to a month and day", () => {
        expect(formatDateAsMonthAndDay("2019-01-01T00:00:00.000Z")).toBe("Jan 1");
        expect(formatDateAsMonthAndDay("2019-01-31T00:00:00.000Z")).toBe("Jan 31");
        expect(formatDateAsMonthAndDay("1996-03-23T00:00:00.000Z")).toBe("Mar 23");
        expect(formatDateAsMonthAndDay("2019-12-01T00:00:00.000Z")).toBe("Dec 1");
        expect(formatDateAsMonthAndDay("2019-12-31T00:00:00.000Z")).toBe("Dec 31");
    });
});

describe("formatDateAsShortMonthAndYear", () => {
    it("formats a date to a short month and short year", () => {
        expect(formatDateAsShortMonthAndYear("2020-01-01T00:00:00.000Z")).toBe("Jan '20");
        expect(formatDateAsShortMonthAndYear("2020-02-29")).toBe("Feb '20");
        expect(formatDateAsShortMonthAndYear("1996-03-23T00:00:00.000Z")).toBe("Mar '96");
        expect(formatDateAsShortMonthAndYear("2020-12-01")).toBe("Dec '20");
        expect(formatDateAsShortMonthAndYear("2020-12-31T00:00:00.000Z")).toBe("Dec '20");
    });
});

describe("formatPercent", () => {
    it("formats millipercents to a percentage with a percent sign", () => {
        expect(formatPercent(1)).toBe("0.001%");
        expect(formatPercent(10)).toBe("0.010%");
        expect(formatPercent(100)).toBe("0.100%");
        expect(formatPercent(1000)).toBe("1.000%");
        expect(formatPercent(10000)).toBe("10.000%");
        expect(formatPercent(100000)).toBe("100.000%");

        expect(formatPercent(12)).toBe("0.012%");
        expect(formatPercent(123)).toBe("0.123%");

        expect(formatPercent(1230)).toBe("1.230%");
        expect(formatPercent(1234)).toBe("1.234%");

        expect(formatPercent(12340)).toBe("12.340%");
        expect(formatPercent(12345)).toBe("12.345%");
    });

    it("handles floats (with rounding to 3 places) even if it doesn't have to", () => {
        expect(formatPercent(0.1)).toBe("0.000%");
        expect(formatPercent(1.01)).toBe("0.001%");
        expect(formatPercent(1000.01)).toBe("1.000%");
    });

    it("formats 0", () => {
        expect(formatPercent(0)).toBe("0.000%");
    });

    it("can format to an arbitrary number of decimal places", () => {
        expect(formatPercent(1234, {decimalPlaces: 2})).toBe("1.23%");
    });

    it("can format with sign symbols", () => {
        expect(formatPercent(1234, {withSignSymbols: true})).toBe("+1.234%");
        expect(formatPercent(-1234, {withSignSymbols: true})).toBe("-1.234%");
    });
});
