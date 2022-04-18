import {useMemo} from "react";
import {usePagination} from "./usePagination";

/** Paginate the given set of objects using the pagination Context state. */
const usePaginateObjects = <T>(objects: Array<T>): Array<T> => {
    // Disable error checking for the Pagination Provider so that we can just pass through
    // the objects unfiltered when pagination isn't used.
    const {state} = usePagination({disableErrorCheck: true});

    return useMemo(() => {
        if (state === undefined) {
            return objects;
        } else {
            const {currentPage, pageSize} = state;

            const sliceStart = currentPage * pageSize;
            const sliceEnd = (currentPage + 1) * pageSize;

            return objects.slice(sliceStart, sliceEnd);
        }
    }, [objects, state]);
};

export default usePaginateObjects;
