import {useMemo} from "react";
import {useTransactionsSearch} from "hooks/";
import throttle from "utils/throttle";
import {SuggestionOption} from "utils/types";

/** Hook for the primary logic of the input. Derives the suggestions from the TransactionsSearch
 *  context as well as the onChange handler. */
export const useTransactionsAutocompleteInput = (onInputValueChange: (value: string) => void) => {
    const {
        state: {results},
        dispatch: {searchTransactions, setSelectedTransactionId}
    } = useTransactionsSearch();

    // Need to convert the transactions into the format expected by the AutocompleteInput.
    const suggestions = useMemo(
        () => results.map(({id, description}) => ({label: description, value: id})),
        [results]
    );

    // Need to throttle the search so that it doesn't fire on _every_ keystroke.
    // This way we optimize for the typing performance of the input (we don't want any lag).
    const onSearch = useMemo(() => throttle(searchTransactions, 150), [searchTransactions]);

    const onChange = (option: SuggestionOption) => {
        onInputValueChange(option.label);
        onSearch(option.label);

        // Whenever a regular input change occurs (i.e. the user is typing), the label
        // and the value will be the same.
        // But when the user selects an option, then they'll be different, because
        // the value will be the actual ID, and not just the input value.
        if (option.label !== option.value) {
            setSelectedTransactionId(option.value);
        }
    };

    return {suggestions, onChange};
};
