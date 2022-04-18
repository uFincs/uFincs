import {useEffect} from "react";
import {useDateRange, usePagination} from "hooks/";

/** Resets the pagination page to the start whenever the date changes, so that users
 *  don't randomly see the second page when they're changing between date ranges.
 *
 *  It just don't make sense. */
export const useResetPaginationWhenDateChanges = () => {
    const {
        state: {startDate, endDate}
    } = useDateRange();

    const {
        dispatch: {setCurrentPage}
    } = usePagination();

    useEffect(() => {
        setCurrentPage(0);
    }, [startDate, endDate, setCurrentPage]);
};
