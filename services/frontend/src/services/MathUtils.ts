import {Millipercents} from "utils/types";

export default class MathUtils {
    /** Increments a number but not past an upper bound. */
    static incrementWithBound(num: number, upperBound: number): number {
        return Math.min(upperBound, num + 1);
    }

    /** Increments a number up to a maximum.
     *  If it reaches the max, then it wraps back around to 0. */
    static incrementWithWrapping(num: number, max: number): number {
        return (num + 1) % max;
    }

    /** Decrements a number but not past a lower bound. */
    static decrementWithBound(num: number, lowerBound: number = 0): number {
        return Math.max(lowerBound, num - 1);
    }

    /** Decrements a number down to 0.
     *  If it reaches 0, then it wraps back around to the max (minus 1, cause arrays). */
    static decrementWithWrapping(num: number, max: number): number {
        return num - 1 < 0 ? max - 1 : num - 1;
    }

    /** Ensures a number is within an upper and lower bound;
     *  returns the bound if the number is beyond it, or just the number if it's within bound. */
    static boundNumber(num: number, upperBound: number, lowerBound: number = 0): number {
        return Math.max(lowerBound, Math.min(upperBound, num));
    }

    /** Makes a 0-indexed number, 1-indexed. */
    static indexBy1(num: number): number {
        return num + 1;
    }

    /** Get the percentage change between two numbers, in millipercents.
     *  Return millipercents because that's our wire format for percentages, and it's what
     *  `ValueFormatting.formatPercent` expects. */
    static percentageChange(oldNum: number, newNum: number): Millipercents {
        // Multiply by 100 to get percents, then by 1000 to get millipercents.
        const percentage = Math.abs(((newNum - oldNum) / oldNum) * 100 * 1000);
        return percentage * (newNum < oldNum ? -1 : 1);
    }

    /** Round a number down to its nearest order of magnitude.
     *  Taken from https://stackoverflow.com/a/23917134. */
    static nearestOrderOfMagnitude(num: number): number {
        // 0.000000001 because 'math float sucks'.
        const order = Math.floor(Math.log10(Math.abs(num)) + 0.000000001);
        return Math.pow(10, order);
    }

    /** Gets a random int between min and max (>= min, < max).
     *  Taken from:
     *  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random */
    static getRandomInt(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);

        return Math.floor(Math.random() * (max - min) + min);
    }
}
