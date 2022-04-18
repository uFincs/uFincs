import {act, renderHook} from "@testing-library/react-hooks";
import React from "react";
import {useSelectableList, SelectableListProvider} from "./useSelectableList";

const Wrapper = ({children}: any) => <SelectableListProvider>{children}</SelectableListProvider>;

const renderHooks = () => renderHook(() => useSelectableList(), {wrapper: Wrapper});

describe("useSelectableList", () => {
    const id1 = "id1";
    const id2 = "id2";

    const ids = [id1, id2];

    it("has nothing selected as the initial state", () => {
        const {result} = renderHooks();

        expect(result.current.state).toEqual({});
    });

    it("can set an item as selected", () => {
        const {result} = renderHooks();

        act(() => {
            result.current.dispatch.selectItem(id1);
        });

        expect(result.current.state[id1]).toBe(true);
    });

    it("can set a selected item as unselected", () => {
        const {result} = renderHooks();

        act(() => {
            result.current.dispatch.selectItem(id1, true);
        });

        act(() => {
            result.current.dispatch.selectItem(id1, false);
        });

        expect(result.current.state[id1]).toBeUndefined();
    });

    it("can select multiple items at once", () => {
        const {result} = renderHooks();

        act(() => {
            result.current.dispatch.selectItems(ids);
        });

        for (const id of ids) {
            expect(result.current.state[id]).toBe(true);
        }
    });

    it("can toggle the selected state of a single item", () => {
        const {result} = renderHooks();

        act(() => {
            result.current.dispatch.toggleItem(id1);
        });

        expect(result.current.state[id1]).toBe(true);

        act(() => {
            result.current.dispatch.toggleItem(id1);
        });

        expect(result.current.state[id1]).toBeUndefined();
    });

    it("can unselect all items", () => {
        const {result} = renderHooks();

        act(() => {
            result.current.dispatch.selectItems(ids);
        });

        act(() => {
            result.current.dispatch.unselectAllItems();
        });

        for (const id of ids) {
            expect(result.current.state[id]).toBeUndefined();
        }
    });
});
