/* eslint-disable react-refresh/only-export-components */
import {createSlice, PayloadAction, AnyAction} from "@reduxjs/toolkit";
import {useCallback, useContext, useEffect, useMemo, useReducer} from "react";
import * as React from "react";
import {useHistory, useLocation} from "react-router";
import {MathUtils} from "services/";

// Hooks + Context state for page-specific pagination.

/* Constants */

export const PAGINATION_PAGE_SIZE = 25;

/* Utility Functions */

const validatePage = (page: number, totalPages: number): number => {
    // We need to make sure that, even if users start modifying the page number willy nilly,
    // they can't break the state.
    if (isNaN(page)) {
        return 0;
    } else {
        return MathUtils.boundNumber(page, totalPages, 0);
    }
};

/* Types */

interface PaginationState {
    /** The 0-indexed number of the current page. So page '0' is really page '1' to the user. */
    currentPage: number;

    /** How many items are per page. */
    pageSize: number;

    /** The total number of items. */
    totalItems: number;

    /** The total number of pages derived by `totalItems / pageSize`.
     *
     *  totalPages is _also_ 0-indexed, to be consistent with currentPage so that calculations
     *  don't have to account for one being 0-indexed and the other being 1-indexed.
     *
     *  This, somewhat unintuitively, means that when totalPages = 0, there is still 1 'page',
     *  regardless of how many items are on it. Only once totalItems / pageSize exceeds 2 does
     *  totalPages increase.
     *
     *  Also, yes, since this is a derived value, strictly speaking it should be derived in a
     *  selector instead of being stored in state, but that's just more work; it's easier to just
     *  derive its value in the reducer and pull it out of the state as needed. */
    totalPages: number;
}

interface PaginationDispatch {
    /** Set the current page. */
    setCurrentPage: (page: number) => void;

    /** Increment the current page, but not beyond the total number of pages. */
    incrementPage: () => void;

    /** Decrement the current page, but not below 0. */
    decrementPage: () => void;

    /** Go to the first page. */
    gotoFirstPage: () => void;

    /** Go to the last page. */
    gotoLastPage: () => void;

    /** Set the page size. */
    setPageSize: (pageSize: number) => void;

    /** Set the total number of items; re-computes `totalPages`. */
    setTotalItems: (totalItems: number) => void;
}

type PaginationReactDispatch = React.Dispatch<PayloadAction<number | undefined>>;

/* Pagination Slice */

const calculateTotalPages = (totalItems: number, pageSize: number) =>
    // Subtract 1 so that totalPages is 0-indexed like currentPage.
    // Also, bound it to 0 in case totalItems is 0 (which would make the right half -1).
    Math.max(0, Math.ceil(totalItems / pageSize) - 1);

const initialState: PaginationState = {
    currentPage: 0,
    pageSize: PAGINATION_PAGE_SIZE,
    totalItems: 0,
    totalPages: 0
};

const paginationSlice = createSlice({
    name: "pagination", // Note: name doesn't matter in this context; slice just needs a name.
    initialState,
    reducers: {
        setCurrentPage: (state: PaginationState, action: PayloadAction<number>) => {
            state.currentPage = validatePage(action.payload, state.totalPages);
        },
        incrementPage: (state: PaginationState, _action: AnyAction) => {
            state.currentPage = MathUtils.incrementWithBound(state.currentPage, state.totalPages);
        },
        decrementPage: (state: PaginationState, _action: AnyAction) => {
            state.currentPage = MathUtils.decrementWithBound(state.currentPage, 0);
        },
        setPageSize: (state: PaginationState, action: PayloadAction<number>) => {
            state.pageSize = action.payload;
            state.totalPages = calculateTotalPages(state.totalItems, state.pageSize);
        },
        setTotalItems: (state: PaginationState, action: PayloadAction<number>) => {
            // Bound totalItems to 0 in case, somehow, a malicious actor tries to set it negative.
            state.totalItems = Math.max(0, action.payload);

            state.totalPages = calculateTotalPages(state.totalItems, state.pageSize);

            // Make sure currentPage doesn't exceed the new totalPages, since it could
            // have been larger than the new value.
            state.currentPage = Math.min(state.totalPages, state.currentPage);
        }
    }
});

/* React Contexts */

const PaginationStateContext = React.createContext<PaginationState | undefined>(undefined);
const PaginationDispatchContext = React.createContext<PaginationDispatch | undefined>(undefined);

/* Utility Hooks */

const usePaginationReducer = (totalItems: number, pageSize: number = PAGINATION_PAGE_SIZE) =>
    useReducer(paginationSlice.reducer, {
        ...initialState,
        pageSize,
        // Need to set totalItems from props as a default.
        totalItems
    });

/** A hook for keeping the internal (reducer) state synced with the number of total items
 *  passed into the Provider.
 */
const useKeepTotalItemsSynced = (dispatch: PaginationReactDispatch, totalItems: number) => {
    useEffect(() => {
        dispatch(paginationSlice.actions.setTotalItems(totalItems));
    }, [totalItems, dispatch]);
};

/** Instead of exposing `dispatch` as an interface to consuming components, instead we expose a
 *  set number of functions for manipulating the state (`PaginationDispatch`).
 *
 *  Because we have to support both internal state and URL state, this function handles creating
 *  these 'dispatch' functions to work with the right Provider.
 */
const useCreatePaginationDispatch = (
    dispatch: PaginationReactDispatch,
    paginationState: PaginationState,
    historyPush?: (url: string) => void,
    currentPage?: number
): PaginationDispatch => {
    // Make sure to destructure totalPages so that the callbacks aren't re-created every time
    // the entire paginationState changes.
    const {totalPages} = paginationState;

    const setCurrentPage = useCallback(
        (page: number) => {
            if (historyPush) {
                const cleanPage = MathUtils.boundNumber(
                    MathUtils.indexBy1(page),
                    MathUtils.indexBy1(totalPages),
                    1
                );

                historyPush(`#page=${cleanPage}`);
            } else {
                // Don't add 1 since the internal state is 0-indexed.
                dispatch(paginationSlice.actions.setCurrentPage(page));
            }
        },
        [dispatch, historyPush, totalPages]
    );

    const incrementPage = useCallback(() => {
        // Using undefined checks on purpose; we don't want to accidentally blow this
        // condition when e.g. currentPage is 0.
        if (historyPush !== undefined && currentPage !== undefined) {
            const page = MathUtils.indexBy1(MathUtils.incrementWithBound(currentPage, totalPages));

            historyPush(`#page=${page}`);
        } else {
            dispatch(paginationSlice.actions.incrementPage());
        }
    }, [dispatch, historyPush, currentPage, totalPages]);

    const decrementPage = useCallback(() => {
        if (historyPush !== undefined && currentPage !== undefined) {
            const page = MathUtils.indexBy1(MathUtils.decrementWithBound(currentPage, 0));
            historyPush(`#page=${page}`);
        } else {
            dispatch(paginationSlice.actions.decrementPage());
        }
    }, [dispatch, historyPush, currentPage]);

    const gotoFirstPage = useCallback(() => {
        const firstPage = 0;

        if (historyPush !== undefined && currentPage !== undefined) {
            historyPush(`#page=${MathUtils.indexBy1(firstPage)}`);
        } else {
            dispatch(paginationSlice.actions.setCurrentPage(firstPage));
        }
    }, [dispatch, historyPush, currentPage]);

    const gotoLastPage = useCallback(() => {
        const lastPage = totalPages;

        if (historyPush !== undefined && currentPage !== undefined) {
            historyPush(`#page=${MathUtils.indexBy1(lastPage)}`);
        } else {
            dispatch(paginationSlice.actions.setCurrentPage(lastPage));
        }
    }, [dispatch, historyPush, currentPage, totalPages]);

    const setPageSize = useCallback(
        (pageSize: number) => {
            dispatch(paginationSlice.actions.setPageSize(pageSize));
        },
        [dispatch]
    );

    const setTotalItems = useCallback(
        (totalItems: number) => {
            dispatch(paginationSlice.actions.setTotalItems(totalItems));
        },
        [dispatch]
    );

    return useMemo(
        () => ({
            setCurrentPage,
            incrementPage,
            decrementPage,
            gotoFirstPage,
            gotoLastPage,
            setPageSize,
            setTotalItems
        }),
        [
            setCurrentPage,
            incrementPage,
            decrementPage,
            gotoFirstPage,
            gotoLastPage,
            setPageSize,
            setTotalItems
        ]
    );
};

/** Parses the page number out of the hash in the URL.
 *
 *  Note that the number in the URL hash is 1-indexed for UX purposes, whereas the internal
 *  representation is 0-indexed for DX purposes.
 */
const useParseUrlCurrentPage = (hash: string, paginationState: PaginationState) => {
    const parsedHash = new URLSearchParams(hash.replace("#", ""));

    if (parsedHash.get("page") === null) {
        return 0;
    } else {
        const currentPage = parseInt(parsedHash.get("page") as string);

        // Subtract 1 to get currentPage back to 0-index.
        return validatePage(currentPage - 1, paginationState.totalPages);
    }
};

/* Providers */

interface PaginationProviderProps {
    /** The (optional) number of items per page. */
    pageSize?: number;

    /** The total number of items that is being paginated over. */
    totalItems: number;

    /** The children of the provider. */
    children: React.ReactNode;
}

/** A provider for enabling pagination using internal state.
 *
 *  This is, currently, only really useful for testing pagination in isolation of the browser.
 *
 *  Otherwise, if the pagination use case doesn't need to provide navigation using browser
 *  history, then this Provider can be used.
 */
export const PaginationProvider = ({
    children,
    pageSize = PAGINATION_PAGE_SIZE,
    totalItems
}: PaginationProviderProps) => {
    const [paginationState, dispatch] = usePaginationReducer(totalItems, pageSize);
    useKeepTotalItemsSynced(dispatch, totalItems);

    const paginationDispatch = useCreatePaginationDispatch(dispatch, paginationState);

    return (
        <PaginationStateContext.Provider value={paginationState}>
            <PaginationDispatchContext.Provider value={paginationDispatch}>
                {children}
            </PaginationDispatchContext.Provider>
        </PaginationStateContext.Provider>
    );
};

/** A provider for enabling pagination using URL based hash state.
 *
 *  This way users can navigate between pages using browser history.
 */
export const PaginationUrlProvider = ({
    children,
    totalItems,
    pageSize = PAGINATION_PAGE_SIZE
}: PaginationProviderProps) => {
    const history = useHistory();
    const location = useLocation();

    // We're reusing the reducer state for everything but `currentPage`.
    // With the URL provider, `currentPage` is derived from the URL hash.
    const [paginationState, dispatch] = usePaginationReducer(totalItems, pageSize);

    useKeepTotalItemsSynced(dispatch, totalItems);
    const currentPage = useParseUrlCurrentPage(location.hash, paginationState);

    const paginationDispatch = useCreatePaginationDispatch(
        dispatch,
        paginationState,
        history.push,
        currentPage
    );

    // Need to swap out the reducer's currentPage for the URL's currentPage.
    const finalPaginationState: PaginationState = useMemo(
        () => ({
            ...paginationState,
            currentPage
        }),
        [paginationState, currentPage]
    );

    return (
        <PaginationStateContext.Provider value={finalPaginationState}>
            <PaginationDispatchContext.Provider value={paginationDispatch}>
                {children}
            </PaginationDispatchContext.Provider>
        </PaginationStateContext.Provider>
    );
};

/* Hooks */

/** Hook that can be used in any component that is inside a PaginationProvider for accessing
 *  the current pagination state. */
export const usePaginationState = ({disableErrorCheck = false} = {}) => {
    // Note that we expose the internal state representation to consuming components.
    // Most notably, this means that `currentPage` is 0-indexed; components must account for this
    // accordingly, by e.g. incrementing by 1 for display purposes.
    const state = useContext(PaginationStateContext);

    // Can disable error checking so that pagination can be 'disabled' and lists can be
    // conditionally not be paginated.
    if (!disableErrorCheck && state === undefined) {
        throw new Error("usePaginationState must be used within a PaginationProvider.");
    }

    return state as PaginationState;
};

/** Hook that can be used in any component that is inside a PaginationProvider for accessing
 *  the functions for can modify the pagination state (i.e. 'dispatch'). */
export const usePaginationDispatch = ({disableErrorCheck = false} = {}) => {
    const dispatch = useContext(PaginationDispatchContext);

    if (!disableErrorCheck && dispatch === undefined) {
        throw new Error("usePaginationDispatch must be used within a PaginationProvider.");
    }

    return dispatch as PaginationDispatch;
};

/** A combined hook for a single interface for accessing the pagination functionality. */
export const usePagination = ({disableErrorCheck = false} = {}) => {
    return {
        state: usePaginationState({disableErrorCheck}),
        dispatch: usePaginationDispatch({disableErrorCheck})
    };
};
