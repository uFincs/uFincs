import React, {useEffect} from "react";

/** Performs a state reset when a certain prop changes. */
const useResetStateFromProps = (
    prop: any,
    setState: React.Dispatch<React.SetStateAction<any>>
): void => {
    // Limitation:
    //
    // If the prop value doesn't actually change, then no reset can happen.
    // This is relevant in the following scenario involving something like the TransactionForm:
    //
    // If the user goes 'New -> Income' (from NewButton), changes the type in the form to something else,
    // and then clicks 'New -> Income' again, the type won't be changed to 'income'.
    //
    // Not bothering to fix right now.

    useEffect(() => {
        setState(prop);
    }, [prop, setState]);
};

export default useResetStateFromProps;
