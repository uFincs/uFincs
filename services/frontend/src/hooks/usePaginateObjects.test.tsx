import {act, renderHook} from "@testing-library/react-hooks";
import React from "react";
import {Transaction} from "models/";
import usePaginateObjects from "./usePaginateObjects";
import {usePaginationDispatch, PaginationProvider, PAGINATION_PAGE_SIZE} from "./usePagination";

const mockObjects = [...Array(115)].map(() => new Transaction());

const Wrapper =
    (totalItems = mockObjects.length) =>
    ({children, ...otherProps}: any) =>
        (
            <PaginationProvider totalItems={totalItems} {...otherProps}>
                {children}
            </PaginationProvider>
        );

const renderHooks = (transactions = mockObjects, wrapper = Wrapper) =>
    renderHook(
        () => {
            const paginated = usePaginateObjects(transactions);
            const dispatch = usePaginationDispatch();

            return {paginated, dispatch};
        },
        {wrapper: wrapper()}
    );

describe("usePaginateObjects", () => {
    it("can get the first page of objects", () => {
        const {result} = renderHooks();

        expect(result.current.paginated.length).toBe(PAGINATION_PAGE_SIZE);
        expect(result.current.paginated[0].id).toBe(mockObjects[0].id);
    });

    it("can get the second page of objects", () => {
        const {result} = renderHooks();

        act(() => {
            result.current.dispatch.incrementPage();
        });

        expect(result.current.paginated.length).toBe(PAGINATION_PAGE_SIZE);
        expect(result.current.paginated[0].id).toBe(mockObjects[PAGINATION_PAGE_SIZE].id);
    });

    it("can get the last (not full size) page of objects", () => {
        const {result} = renderHooks();

        act(() => {
            result.current.dispatch.gotoLastPage();
        });

        expect(result.current.paginated.length).toBe(15);
        expect(result.current.paginated[0].id).toBe(mockObjects[mockObjects.length - 15].id);
    });
});
