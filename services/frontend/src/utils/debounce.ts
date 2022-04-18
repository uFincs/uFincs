/* A debounce function.
 * Heavily inspired by http://jsfiddle.net/lebbe/eygq4m4b/.
 *
 * @param fn            Function to throttle + debounce.
 * @param delay         Debounce delay in milliseconds.
 *
 * @return The debounced function. */
const debounce = (
    fn: (...args: Array<any>) => void,
    delay: number = 250
): ((...args: any[]) => void) => {
    let timer: number | undefined;

    return (...args: Array<any>) => {
        clearTimeout(timer);

        // Need to use `window.setTimeout` instead of just `setTimeout`,
        // otherwise TypeScript thinks it's using the Node `setTimeout`,
        // which returns a value of type `Timeout`, not number like `window.setTimeout` does.
        timer = window.setTimeout(() => {
            fn(...args);
        }, delay);
    };
};

export default debounce;
