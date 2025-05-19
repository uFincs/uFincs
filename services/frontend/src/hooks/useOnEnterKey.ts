/** Converts a callback to one that will be triggered when the Enter key is pressed. */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const useOnEnterKey = (callback: Function) => (e: KeyboardEvent) => {
    if (e.key === "Enter") {
        callback();
    }
};

export default useOnEnterKey;
