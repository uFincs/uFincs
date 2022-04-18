/** Converts a callback to one that will be triggered when the Enter key is pressed. */
const useOnEnterKey = (callback: Function) => (e: KeyboardEvent) => {
    if (e.key === "Enter") {
        callback();
    }
};

export default useOnEnterKey;
