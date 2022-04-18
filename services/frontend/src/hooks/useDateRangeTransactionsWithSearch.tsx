import {SearchService} from "services/";
import useDateRangeTransactions from "./useDateRangeTransactions";
import useIntersectTransactions from "./useIntersectTransactions";
import {useTransactionsSearch} from "./useTransactionsSearch";

/** Hook that combines the date range filtered transactions with the search filtered transactions. */
const useDateRangeTransactionsWithSearch = ({customStartDate = "", customEndDate = ""} = {}) => {
    const {state} = useTransactionsSearch({disableErrorCheck: true});
    const transactions = useDateRangeTransactions({customStartDate, customEndDate});

    // Since we disabled the error checking, this hook can function even when no TransactionsSearchProvider
    // exists. As such, we need to be careful since `state` can be undefined.
    const query = state?.query || "";
    const results = state?.results || [];

    return useIntersectTransactions(
        results,
        transactions,
        // We only want to ignore the empty results when the query doesn't 'exist'.
        // Otherwise, we want to show nothing if there are no search results.
        query.length < SearchService.MIN_QUERY_LENGTH
    );
};

export default useDateRangeTransactionsWithSearch;
