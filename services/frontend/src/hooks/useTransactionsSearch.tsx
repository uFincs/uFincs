import React, {useCallback, useContext, useMemo, useState} from "react";
import {useSelector} from "react-redux";
import {Transaction, TransactionData} from "models/";
import {crossSliceSelectors} from "store/";
import {Id} from "utils/types";

// Hooks + Context for page-specific transactions search state.

/* Types */

interface SearchState {
    /** The query to search the transactions with. */
    query: string;

    results: Array<TransactionData>;

    /** The selected transaction.
     *
     *  This is useful for autocomplete suggestions, where the selected transaction can then
     *  be used to for other purposes like auto-filling a form.
     *
     *  If it is null, then no result has been selected.
     *
     *  There is something to note here: internally to the TransactionsSearchProvider,
     *  we store the _ID_ of the selected transaction, but we expose the _full_ transaction
     *  externally as state. */
    selectedTransaction: Transaction | null;
}

interface SearchDispatch {
    /** Initiate a search of the transactions. */
    searchTransactions: (query: string) => void;

    /** Mark a transaction in the results as 'selected'. */
    setSelectedTransactionId: (id: Id | null) => void;
}

/* React Contexts */

const SearchStateContext = React.createContext<SearchState | undefined>(undefined);
const SearchDispatchContext = React.createContext<SearchDispatch | undefined>(undefined);

/* Helper Hooks */

const useSelectResults = (query: string, keepLatestDuplicateTransaction: boolean = true) => {
    const searchTransactionsSelector = useMemo(
        () =>
            crossSliceSelectors.transactions.makeSearchTransactionsSelector(
                keepLatestDuplicateTransaction
            ),
        [keepLatestDuplicateTransaction]
    );

    const selector = useCallback(
        (state) => searchTransactionsSelector(state, query),
        [query, searchTransactionsSelector]
    );

    const results = useSelector(selector);

    // Memoize the results again since we can't trust the selector to do it properly.
    // eslint-disable-next-line
    return useMemo(() => results, [JSON.stringify(results)]);
};

const useGetSelectedTransaction = (id: Id | null) => {
    // Transform the selected ID into an actual transaction.
    // We're using selectTransactionsById for simplicity since the existing version of
    // selectTransaction wouldn't work here due to memoization.
    const transactions = useSelector(crossSliceSelectors.transactions.selectTransactionsById);
    const selectedTransaction = id ? transactions?.[id] : null;

    return selectedTransaction;
};

const useBuildSearchState = ({query, results, selectedTransaction}: SearchState) =>
    useMemo(
        () => ({
            query,
            results,
            selectedTransaction
        }),
        [query, results, selectedTransaction]
    );

const useBuildSearchDispatch = ({searchTransactions, setSelectedTransactionId}: SearchDispatch) =>
    useMemo(
        () => ({
            searchTransactions,
            setSelectedTransactionId
        }),
        [searchTransactions, setSelectedTransactionId]
    );

/* Custom Provider */

interface TransactionsSearchProviderProps {
    /** The children of the provider. */
    children: React.ReactNode;

    /** Whether or not to only keep the latest duplicate transactions (where 'duplicate' = 'same
     *  description'). This is used when the search results are for autocompletion (on by default).
     *
     *  Turn it off when searching for all transactions. */
    keepLatestDuplicateTransaction?: boolean;
}

/** A provider for enabling transactions searching. */
export const TransactionsSearchProvider = ({
    children,
    keepLatestDuplicateTransaction = true
}: TransactionsSearchProviderProps) => {
    const [query, setQuery] = useState("");
    const [selectedId, setSelectedId] = useState<Id | null>(null);

    const results = useSelectResults(query, keepLatestDuplicateTransaction);
    const selectedTransaction = useGetSelectedTransaction(selectedId);

    const searchState = useBuildSearchState({query, results, selectedTransaction});

    const searchDispatch = useBuildSearchDispatch({
        searchTransactions: setQuery,
        setSelectedTransactionId: setSelectedId
    });

    return (
        <SearchStateContext.Provider value={searchState}>
            <SearchDispatchContext.Provider value={searchDispatch}>
                {children}
            </SearchDispatchContext.Provider>
        </SearchStateContext.Provider>
    );
};

/* Hooks */

/** Hook that can be used in any component that is inside a TransactionsSearchProvider
 *  for accessing the current search state. */
export const useTransactionsSearchState = ({disableErrorCheck = false} = {}) => {
    const state = useContext(SearchStateContext);

    if (!disableErrorCheck && state === undefined) {
        throw new Error(
            "useTransactionsSearchState must be used within a TransactionsSearchProvider."
        );
    }

    return state as SearchState;
};

/** Hook that can be used in any component that is inside a TransactionsSearchProvider for
 *  accessing the functions for can modify the search state (i.e. 'dispatch'). */
export const useTransactionsSearchDispatch = ({disableErrorCheck = false} = {}) => {
    const dispatch = useContext(SearchDispatchContext);

    if (!disableErrorCheck && dispatch === undefined) {
        throw new Error(
            "useTransactionsSearchDispatch must be used within a TransactionsSearchProvider."
        );
    }

    return dispatch as SearchDispatch;
};

/** A combined hook for a single interface for accessing the transactions search functionality. */
export const useTransactionsSearch = ({disableErrorCheck = false} = {}) => {
    return {
        state: useTransactionsSearchState({disableErrorCheck}),
        dispatch: useTransactionsSearchDispatch({disableErrorCheck})
    };
};
