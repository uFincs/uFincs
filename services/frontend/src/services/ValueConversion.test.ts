import ValueConversion from "./ValueConversion";

const {
    convertDollarsToCents,
    convertCentsToDollars,
    convertPercentToMillipercents,
    convertMillipercentsToPercent
} = ValueConversion;

describe("convertDollarsToCents", () => {
    it("converts a dollar value to cents", () => {
        expect(convertDollarsToCents(0.01)).toEqual(1);
        expect(convertDollarsToCents(0.1)).toEqual(10);
        expect(convertDollarsToCents(1)).toEqual(100);
        expect(convertDollarsToCents(1.0)).toEqual(100);
        expect(convertDollarsToCents(1.0)).toEqual(100);
        expect(convertDollarsToCents(1.2)).toEqual(120);
        expect(convertDollarsToCents(1.23)).toEqual(123);
        expect(convertDollarsToCents(12.34)).toEqual(1234);
        expect(convertDollarsToCents(123.45)).toEqual(12345);
        expect(convertDollarsToCents(1234.56)).toEqual(123456);
    });

    it("rounds values", () => {
        expect(convertDollarsToCents(0.001)).toEqual(0);
        expect(convertDollarsToCents(1.001)).toEqual(100);
        expect(convertDollarsToCents(1234.567)).toEqual(123457);
    });
});

describe("convertCentsToDollars", () => {
    it("converts cents to dollars", () => {
        expect(convertCentsToDollars(1)).toEqual(0.01);
        expect(convertCentsToDollars(10)).toEqual(0.1);
        expect(convertCentsToDollars(100)).toEqual(1);
        expect(convertCentsToDollars(1000)).toEqual(10);
        expect(convertCentsToDollars(1001)).toEqual(10.01);
        expect(convertCentsToDollars(1011)).toEqual(10.11);
        expect(convertCentsToDollars(1111)).toEqual(11.11);
    });
});

describe("convertPercentToMillipercents", () => {
    it("converts a percent value to millipercents", () => {
        expect(convertPercentToMillipercents(0.001)).toEqual(1);
        expect(convertPercentToMillipercents(0.01)).toEqual(10);
        expect(convertPercentToMillipercents(0.1)).toEqual(100);
        expect(convertPercentToMillipercents(1)).toEqual(1000);
        expect(convertPercentToMillipercents(1.0)).toEqual(1000);
        expect(convertPercentToMillipercents(1.0)).toEqual(1000);
        expect(convertPercentToMillipercents(1.2)).toEqual(1200);
        expect(convertPercentToMillipercents(1.23)).toEqual(1230);
        expect(convertPercentToMillipercents(12.34)).toEqual(12340);
        expect(convertPercentToMillipercents(123.45)).toEqual(123450);
        expect(convertPercentToMillipercents(1234.56)).toEqual(1234560);
        expect(convertPercentToMillipercents(1234.567)).toEqual(1234567);
    });

    it("rounds values", () => {
        expect(convertPercentToMillipercents(0.0001)).toEqual(0);
        expect(convertPercentToMillipercents(1.0001)).toEqual(1000);
        expect(convertPercentToMillipercents(1234.5678)).toEqual(1234568);
    });
});

describe("convertMillipercentsToPercent", () => {
    it("converts a millipercent value to percents", () => {
        expect(convertMillipercentsToPercent(1)).toEqual(0.001);
        expect(convertMillipercentsToPercent(10)).toEqual(0.01);
        expect(convertMillipercentsToPercent(100)).toEqual(0.1);
        expect(convertMillipercentsToPercent(1000)).toEqual(1);
        expect(convertMillipercentsToPercent(1001)).toEqual(1.001);
        expect(convertMillipercentsToPercent(1011)).toEqual(1.011);
        expect(convertMillipercentsToPercent(1111)).toEqual(1.111);
    });

    it("supports converting values than a millipercent anyways", () => {
        expect(convertMillipercentsToPercent(0.1)).toEqual(0.0001);
        expect(convertMillipercentsToPercent(0.01)).toEqual(0.00001);
    });
});
