import MathUtils from "./MathUtils";

const {
    incrementWithBound,
    incrementWithWrapping,
    decrementWithBound,
    decrementWithWrapping,
    boundNumber,
    indexBy1,
    percentageChange,
    nearestOrderOfMagnitude
} = MathUtils;

describe("incrementWithBound", () => {
    it("can increment a number", () => {
        expect(incrementWithBound(1, 10)).toBe(2);
    });

    it("can increment a number up to a max number", () => {
        expect(incrementWithBound(11, 10)).toBe(10);
    });
});

describe("incrementWithWrapping", () => {
    it("can increment a number", () => {
        expect(incrementWithWrapping(1, 10)).toBe(2);
    });

    it("wraps back around to 0 when incrementing to a number", () => {
        expect(incrementWithWrapping(9, 10)).toBe(0);
    });
});

describe("decrementWithBound", () => {
    it("can decrement a number", () => {
        expect(decrementWithBound(15, 10)).toBe(14);
    });

    it("can decrement a number down to a min number", () => {
        expect(decrementWithBound(9, 10)).toBe(10);
    });
});

describe("decrementWithWrapping", () => {
    it("can decrement a number", () => {
        expect(decrementWithWrapping(15, 10)).toBe(14);
    });

    it("can decrement a number down to 0 before wrapping back to a max", () => {
        expect(decrementWithWrapping(0, 10)).toBe(9);
    });
});

describe("boundNumber", () => {
    it("ensures a number doesn't exceed an upper or lower bound", () => {
        expect(boundNumber(10, 15, 5)).toBe(10);
        expect(boundNumber(20, 15, 5)).toBe(15);
        expect(boundNumber(0, 15, 5)).toBe(5);
    });
});

describe("indexBy1", () => {
    it("add 1 to a number to make it '1-indexed'", () => {
        expect(indexBy1(0)).toBe(1);
    });
});

describe("percentageChange", () => {
    it("calculates the percentage change between two numbers, in millipercents", () => {
        expect(percentageChange(100, 150)).toBe(50000);
        expect(percentageChange(150, 75)).toBe(-50000);
    });

    it("calculates percentage change between negative numbers", () => {
        expect(percentageChange(-100, -150)).toBe(-50000);
        expect(percentageChange(-150, -75)).toBe(50000);
    });

    it("calculates percentage change between negative and positive numbers", () => {
        expect(percentageChange(100, -150)).toBe(-250000);
        expect(percentageChange(-100, 150)).toBe(250000);

        expect(percentageChange(-150, 75)).toBe(150000);
        expect(percentageChange(150, -75)).toBe(-150000);
    });
});

describe("nearestOrderOfMagnitude", () => {
    it("can get the nearest order of magnitude of a number", () => {
        expect(nearestOrderOfMagnitude(0.02)).toBe(0.01);
        expect(nearestOrderOfMagnitude(0.2)).toBe(0.1);
        expect(nearestOrderOfMagnitude(2)).toBe(1);
        expect(nearestOrderOfMagnitude(23)).toBe(10);
        expect(nearestOrderOfMagnitude(234)).toBe(100);
        expect(nearestOrderOfMagnitude(2345)).toBe(1000);
        expect(nearestOrderOfMagnitude(23456)).toBe(10000);
        expect(nearestOrderOfMagnitude(99999)).toBe(10000);
    });
});
