import {act, renderHook} from "@testing-library/react-hooks";
import React from "react";
import {MemoryRouter} from "react-router-dom";
import {
    usePaginationDispatch,
    usePaginationState,
    PaginationProvider,
    PaginationUrlProvider,
    PAGINATION_PAGE_SIZE
} from "./usePagination";

const mockTotalItems = 100;
const mockTotalPages = 3;

const InternalStateWrapper =
    (totalItems = mockTotalItems) =>
    ({children, ...otherProps}: any) =>
        (
            <PaginationProvider totalItems={totalItems} {...otherProps}>
                {children}
            </PaginationProvider>
        );

const UrlWrapper =
    (totalItems = mockTotalItems) =>
    ({children, ...otherProps}: any) =>
        (
            // Use a MemoryRouter so that we don't have to mock anything with ConnectedRouter.
            <MemoryRouter>
                <PaginationUrlProvider totalItems={totalItems} {...otherProps}>
                    {children}
                </PaginationUrlProvider>
            </MemoryRouter>
        );

const renderHooks = (wrapper = InternalStateWrapper) =>
    renderHook(
        () => {
            const state = usePaginationState();
            const dispatch = usePaginationDispatch();

            return {state, dispatch};
        },
        {wrapper: wrapper()}
    );

describe("usePagination hooks", () => {
    const tests = (wrapper = InternalStateWrapper) => {
        it("can get all of the initial pagination state", () => {
            const {result} = renderHooks(wrapper);

            expect(result.current.state?.currentPage).toBe(0);
            expect(result.current.state?.pageSize).toBe(PAGINATION_PAGE_SIZE);
            expect(result.current.state?.totalItems).toBe(mockTotalItems);
            expect(result.current.state?.totalPages).toBe(mockTotalPages);
        });

        it("can set the current page", () => {
            const {result} = renderHooks(wrapper);

            act(() => {
                result.current.dispatch.setCurrentPage(1);
            });

            expect(result.current.state?.currentPage).toBe(1);
        });

        it("can handle the user setting a nonsensical page", () => {
            const {result} = renderHooks(wrapper);

            act(() => {
                // Set the page to something that isn't 0.
                result.current.dispatch.setCurrentPage(2);
            });

            act(() => {
                // @ts-ignore We want to pass a non-number to represent the user changing the URL.
                result.current.dispatch.setCurrentPage("abc");
            });

            // Nonsensical page changes should result in going back to page 0.
            expect(result.current.state?.currentPage).toBe(0);
        });

        it("can handle the user setting a page outside the total pages", () => {
            const {result} = renderHooks(wrapper);

            act(() => {
                result.current.dispatch.setCurrentPage(100000);
            });

            // When setting the page beyond the total, it should be set to the total.
            expect(result.current.state?.currentPage).toBe(mockTotalPages);
        });

        it("can handle the user setting a negative page", () => {
            const {result} = renderHooks(wrapper);

            act(() => {
                // Set the page to something that isn't 0.
                result.current.dispatch.setCurrentPage(2);
            });

            act(() => {
                result.current.dispatch.setCurrentPage(-100);
            });

            // When setting a negative page, it should go back to page 0.
            expect(result.current.state?.currentPage).toBe(0);
        });

        it("can increment the page", () => {
            const {result} = renderHooks(wrapper);

            act(() => {
                result.current.dispatch.incrementPage();
            });

            expect(result.current.state?.currentPage).toBe(1);
        });

        it("can decrement the page", () => {
            const {result} = renderHooks(wrapper);

            // Doing some increments first to prevent the case where calling decrement
            // is actually just a no-op, and it would still have currentPage as 0.
            //
            // Note: The calls have to be done in separate `act` statements so that the
            // dispatch functions get re-generated with the new state after each render.
            act(() => {
                result.current.dispatch.incrementPage();
            });

            expect(result.current.state?.currentPage).toBe(1);

            act(() => {
                result.current.dispatch.incrementPage();
            });

            expect(result.current.state?.currentPage).toBe(2);

            act(() => {
                result.current.dispatch.decrementPage();
            });

            expect(result.current.state?.currentPage).toBe(1);
        });

        it("can goto the first page", () => {
            const {result} = renderHooks(wrapper);

            act(() => {
                result.current.dispatch.setCurrentPage(3);
            });

            expect(result.current.state?.currentPage).toBe(3);

            act(() => {
                result.current.dispatch.gotoFirstPage();
            });

            expect(result.current.state?.currentPage).toBe(0);
        });

        it("can goto the last page", () => {
            const {result} = renderHooks(wrapper);

            act(() => {
                result.current.dispatch.gotoLastPage();
            });

            expect(result.current.state?.currentPage).toBe(3);
        });

        it("can set the page size", () => {
            const {result} = renderHooks(wrapper);

            act(() => {
                result.current.dispatch.setPageSize(200);
            });

            expect(result.current.state?.currentPage).toBe(0);
            expect(result.current.state?.pageSize).toBe(200);
            expect(result.current.state?.totalItems).toBe(mockTotalItems);
            expect(result.current.state?.totalPages).toBe(0);
        });

        it("can set the total number of items", () => {
            const {result} = renderHooks(wrapper);

            act(() => {
                result.current.dispatch.setTotalItems(200);
            });

            expect(result.current.state?.currentPage).toBe(0);
            expect(result.current.state?.pageSize).toBe(PAGINATION_PAGE_SIZE);
            expect(result.current.state?.totalItems).toBe(200);
            expect(result.current.state?.totalPages).toBe(7);
        });

        it("can handle the total items being set negative", () => {
            const {result} = renderHooks(wrapper);

            act(() => {
                result.current.dispatch.setTotalItems(-100);
            });

            expect(result.current.state?.totalItems).toBe(0);
            expect(result.current.state?.totalPages).toBe(0);
        });

        it("can handle the total items being set to 0", () => {
            const {result} = renderHooks(wrapper);

            act(() => {
                result.current.dispatch.setTotalItems(0);
            });

            expect(result.current.state?.totalItems).toBe(0);
            expect(result.current.state?.totalPages).toBe(0);
        });

        it("sets current page to total pages when setting total items below current page", () => {
            const {result} = renderHooks(wrapper);

            act(() => {
                result.current.dispatch.setCurrentPage(3);
            });

            act(() => {
                result.current.dispatch.setTotalItems(50);
            });

            expect(result.current.state?.currentPage).toBe(1);
            expect(result.current.state?.totalItems).toBe(50);
            expect(result.current.state?.totalPages).toBe(1);
        });

        it("0-indexes totalPages, which is made obvious when totalItems < pageSize", () => {
            const {result} = renderHooks(wrapper);

            act(() => {
                result.current.dispatch.setTotalItems(25);
            });

            expect(result.current.state?.totalItems).toBe(25);

            // Look, totalPages is still 0, because the 0th page is really the 1st page!
            expect(result.current.state?.totalPages).toBe(0);
        });
    };

    describe("With PaginationProvider", () => {
        tests(InternalStateWrapper);
    });

    describe("With PaginationUrlProvider", () => {
        tests(UrlWrapper);
    });
});
