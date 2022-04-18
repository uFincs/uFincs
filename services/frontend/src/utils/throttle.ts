/* A throttle function.
 * Heavily inspired by http://jsfiddle.net/lebbe/eygq4m4b/.
 *
 * @param fn            Function to throttle.
 * @param threshold     Throttle threshold in milliseconds.
 *
 * @return The throttled function.
 */
const throttle = (
    fn: (...args: Array<any>) => void,
    threshold: number = 250
): ((...args: Array<any>) => void) => {
    let last: number | undefined;
    let deferTimer: number | undefined;

    return (...args: Array<any>) => {
        const now = Date.now();

        if (last && now < last + threshold) {
            clearTimeout(deferTimer);

            deferTimer = window.setTimeout(() => {
                last = now;
                fn(...args);
            }, threshold);
        } else {
            last = now;
            fn(...args);
        }
    };
};

export default throttle;
