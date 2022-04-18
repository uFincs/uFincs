import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import React, {useCallback, useContext, useReducer, useMemo} from "react";
import {Id} from "utils/types";

// Hooks + Context state for enabling a 'selectable list' component (i.e. a list where
// each item can be selected/unselected).

/* Types */

export interface SelectableListState {
    /** Just a map of 'IDs' to booleans that are only ever true.
     *
     *  Since selectability is determined by whether or not the 'ID' is in the state,
     *  it doesn't actually matter what they map to. We just want to use a map so that
     *  we get O(1) lookups to check if an item is selected or not. */
    [item: string]: boolean;
}

interface SelectableListDispatch {
    /** Sets the item to the given selected state, which defaults to true if not provided. */
    selectItem: (item: string, selected?: boolean) => void;

    /** Sets the given set of items to selected. */
    selectItems: (items: Array<string>) => void;

    /** Toggles the selected state of the given item. */
    toggleItem: (item: string) => void;

    /** Unselects all items (by removing everything from the state). */
    unselectAllItems: () => void;
}

type SelectableListReactDispatch = React.Dispatch<
    PayloadAction<string | {item: string; selected: boolean} | Array<string> | undefined>
>;

/* Selectable List Slice */

export const initialState: SelectableListState = {} as SelectableListState;

export const selectableListSlice = createSlice({
    name: "selectableList", // Note: name doesn't matter since this slice isn't used in the store.
    initialState,
    reducers: {
        selectItem: (
            state: SelectableListState,
            action: PayloadAction<{item: string; selected: boolean}>
        ) => {
            const {item, selected} = action.payload;

            if (!selected && item in state) {
                delete state[item];
            } else if (selected && !(item in state)) {
                state[item] = true;
            }
        },
        selectItems: (state: SelectableListState, action: PayloadAction<Array<string>>) => {
            const items = action.payload;

            for (const item of items) {
                state[item] = true;
            }
        },
        toggleItem: (state: SelectableListState, action: PayloadAction<string>) => {
            const item = action.payload;

            if (item in state) {
                delete state[item];
            } else {
                state[item] = true;
            }
        },
        // Returns an empty object.
        unselectAllItems: () => ({})
    }
});

/* React Context */

const SelectableListStateContext = React.createContext<SelectableListState | undefined>(undefined);
const SelectableListDispatchContext =
    React.createContext<SelectableListDispatch | undefined>(undefined);

/* Utility Hooks */

const useSelectableListReducer = () => useReducer(selectableListSlice.reducer, initialState);

/** Create a simpler interface for interacting with the selectable list state than using
 *  `dispatch`. */
const useCreateSelectableListDispatch = (
    dispatch: SelectableListReactDispatch
): SelectableListDispatch => {
    const selectItem = useCallback(
        (item: string, selected: boolean = true) => {
            dispatch(selectableListSlice.actions.selectItem({item, selected}));
        },
        [dispatch]
    );

    const selectItems = useCallback(
        (items: Array<string>) => {
            dispatch(selectableListSlice.actions.selectItems(items));
        },
        [dispatch]
    );

    const toggleItem = useCallback(
        (item: string) => {
            dispatch(selectableListSlice.actions.toggleItem(item));
        },
        [dispatch]
    );

    const unselectAllItems = useCallback(() => {
        dispatch(selectableListSlice.actions.unselectAllItems());
    }, [dispatch]);

    return useMemo(
        () => ({
            selectItem,
            selectItems,
            toggleItem,
            unselectAllItems
        }),
        [selectItem, selectItems, toggleItem, unselectAllItems]
    );
};

/* Custom Provider */

interface SelectableListProviderProps {
    /** The children of the provider. */
    children: React.ReactNode;
}

/** A provider for enabling selectable lists. */
export const SelectableListProvider = ({children}: SelectableListProviderProps) => {
    const [selectableListState, dispatch] = useSelectableListReducer();

    const selectableListDispatch = useCreateSelectableListDispatch(dispatch);

    return (
        <SelectableListStateContext.Provider value={selectableListState}>
            <SelectableListDispatchContext.Provider value={selectableListDispatch}>
                {children}
            </SelectableListDispatchContext.Provider>
        </SelectableListStateContext.Provider>
    );
};

/* Hooks */

/** Hook for accessing just the selectable list state. */
export const useSelectableListState = ({disableErrorCheck = false} = {}) => {
    const state = useContext(SelectableListStateContext);

    if (!disableErrorCheck && state === undefined) {
        throw new Error("useSelectableListState must be used within a SelectableListProvider.");
    }

    return state as SelectableListState;
};

/** Hook for accessing just the selectable list dispatch functions. */
export const useSelectableListDispatch = ({disableErrorCheck = false} = {}) => {
    const dispatch = useContext(SelectableListDispatchContext);

    if (!disableErrorCheck && dispatch === undefined) {
        throw new Error("useSelectableListDispatch must be used within a SelectableListProvider.");
    }

    return dispatch as SelectableListDispatch;
};

/** Combined hook that is a single interface for accessing
 *  the selectable list functionality. */
export const useSelectableList = ({disableErrorCheck = false} = {}) => ({
    state: useSelectableListState({disableErrorCheck}),
    dispatch: useSelectableListDispatch({disableErrorCheck})
});

/** Hook for handling the (optional) selectable state of a list item. */
export const useSelectableItem = (id: Id, onClick = () => {}) => {
    const {state: selectableState, dispatch: selectableDispatch} = useSelectableList({
        disableErrorCheck: true
    });

    const selectable = selectableState !== undefined;
    const selected = (selectable && id in selectableState) || undefined;

    // Note: Because of how the DoubleLayerListItem is constructed, any click handlers on any
    // elements of the children of the ListItem _will also_ trigger the click handler
    // of the ListItem itself. As such, we can't put the `onCheck` handler of
    // TransactionTypeIcon to toggle the selected state.
    //
    // Instead, we just swap the click handler of the ListItem to toggle the selected state
    // instead. I think this is fine (at least, for now), since in selectable contexts,
    // it is more likely that the user wants to select the item than open the edit form.
    const onItemClick = selectable ? () => selectableDispatch?.toggleItem(id) : onClick;

    return {
        selectable,
        selected,
        onItemClick
    };
};
