/* Taken from the `reselect` library: https://github.com/reduxjs/reselect/blob/master/src/index.js
 *
 * The main function was originally called 'defaultMemoize'.
 * It does memoization over just the last arguments that a function received. */

type EqualityCheckCallback = (a: any, b: any) => boolean;

const defaultEqualityCheck = (a: any, b: any): boolean => {
    return a === b;
};

const areArgumentsShallowlyEqual = (
    equalityCheck: EqualityCheckCallback,
    prev: Array<any>,
    next: Array<any>
): boolean => {
    if (prev === null || next === null || prev.length !== next.length) {
        return false;
    }

    // Do this in a for loop (and not a `forEach` or an `every`) so we can determine equality as fast as possible.
    const length = prev.length;

    for (let i = 0; i < length; i++) {
        if (!equalityCheck(prev[i], next[i])) {
            return false;
        }
    }

    return true;
};

// This memoizes only the last result and uses reference equality.
const memoize = (
    fn: Function,
    equalityCheck: EqualityCheckCallback = defaultEqualityCheck
): Function => {
    let lastArgs: Array<any>;
    let lastResult: any;

    // we reference arguments instead of spreading them for performance reasons
    return (...args: Array<any>) => {
        if (!areArgumentsShallowlyEqual(equalityCheck, lastArgs, args)) {
            // apply arguments instead of spreading for performance.
            lastResult = fn.apply(null, args);
        }

        lastArgs = args;
        return lastResult;
    };
};

export default memoize;
