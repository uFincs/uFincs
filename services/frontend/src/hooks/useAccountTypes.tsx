import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import React, {useCallback, useContext, useReducer, useMemo} from "react";
import {Account, AccountType} from "models/";

// Hooks + Context state for enabling the AccountTypeFilters.

/* Types */

export interface TypesState {
    [AccountType.asset]: boolean;
    [AccountType.liability]: boolean;
    [AccountType.income]: boolean;
    [AccountType.expense]: boolean;
}

interface TypesDispatch {
    toggleType: (type: AccountType) => void;
}

type TypesReactDispatch = React.Dispatch<PayloadAction<AccountType>>;

/* Account Types Slice */

export const initialState: TypesState = {
    [Account.ASSET]: true,
    [Account.LIABILITY]: true,
    [Account.INCOME]: true,
    [Account.EXPENSE]: true
} as unknown as TypesState;

export const accountTypesSlice = createSlice({
    name: "accountTypes", // Note: name doesn't matter since this slice isn't used in the store.
    initialState,
    reducers: {
        toggleType: (state: TypesState, action: PayloadAction<AccountType>) => {
            state[action.payload] = !state[action.payload];
        }
    }
});

/* React Context */

const TypesStateContext = React.createContext<TypesState | undefined>(undefined);
const TypesDispatchContext = React.createContext<TypesDispatch | undefined>(undefined);

/* Utility Hooks */

const useTypesReducer = () => useReducer(accountTypesSlice.reducer, initialState);

/** Create a simpler interface for interacting with the account types state than using `dispatch`. */
const useCreateTypesDispatch = (dispatch: TypesReactDispatch): TypesDispatch => {
    const toggleType = useCallback(
        (type: AccountType) => {
            dispatch(accountTypesSlice.actions.toggleType(type));
        },
        [dispatch]
    );

    return useMemo(
        () => ({
            toggleType
        }),
        [toggleType]
    );
};

/* Custom Provider */

interface AccountTypesProviderProps {
    /** The children of the provider. */
    children: React.ReactNode;
}

/** A provider for enabling account types filtering. */
export const AccountTypesProvider = ({children}: AccountTypesProviderProps) => {
    const [typesState, dispatch] = useTypesReducer();

    const typesDispatch = useCreateTypesDispatch(dispatch);

    return (
        <TypesStateContext.Provider value={typesState}>
            <TypesDispatchContext.Provider value={typesDispatch}>
                {children}
            </TypesDispatchContext.Provider>
        </TypesStateContext.Provider>
    );
};

/* Hooks */

/** Hook for accessing just the account types state. */
export const useAccountTypesState = ({disableErrorCheck = false} = {}) => {
    const state = useContext(TypesStateContext);

    if (!disableErrorCheck && state === undefined) {
        throw new Error("useAccountTypesState must be used within a AccountTypesProvider.");
    }

    return state as TypesState;
};

/** Hook for accessing just the account types dispatch functions. */
export const useAccountTypesDispatch = ({disableErrorCheck = false} = {}) => {
    const dispatch = useContext(TypesDispatchContext);

    if (!disableErrorCheck && dispatch === undefined) {
        throw new Error("useAccountTypesDispatch must be used within a AccountTypesProvider.");
    }

    return dispatch as TypesDispatch;
};

/** Combined hook that is a single interface for accessing
 *  the account types filtering functionality. */
export const useAccountTypes = ({disableErrorCheck = false} = {}) => ({
    state: useAccountTypesState({disableErrorCheck}),
    dispatch: useAccountTypesDispatch({disableErrorCheck})
});
