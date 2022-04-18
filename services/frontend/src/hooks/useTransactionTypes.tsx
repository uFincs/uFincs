import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import React, {useCallback, useContext, useReducer, useMemo} from "react";
import {Transaction, TransactionType} from "models/";

// Hooks + Context state for enabling the TransactionTypeFilters.

/* Types */

export interface TypesState {
    [TransactionType.income]: boolean;
    [TransactionType.expense]: boolean;
    [TransactionType.debt]: boolean;
    [TransactionType.transfer]: boolean;
}

interface TypesDispatch {
    toggleType: (type: TransactionType) => void;
}

type TypesReactDispatch = React.Dispatch<PayloadAction<TransactionType>>;

/* Transaction Types Slice */

export const initialState: TypesState = {
    [Transaction.INCOME]: true,
    [Transaction.EXPENSE]: true,
    [Transaction.DEBT]: true,
    [Transaction.TRANSFER]: true
} as unknown as TypesState;

export const transactionTypesSlice = createSlice({
    name: "transactionTypes", // Note: name doesn't matter since this slice isn't used in the store.
    initialState,
    reducers: {
        toggleType: (state: TypesState, action: PayloadAction<TransactionType>) => {
            state[action.payload] = !state[action.payload];
        }
    }
});

/* React Context */

const TypesStateContext = React.createContext<TypesState | undefined>(undefined);
const TypesDispatchContext = React.createContext<TypesDispatch | undefined>(undefined);

/* Utility Hooks */

const useTypesReducer = () => useReducer(transactionTypesSlice.reducer, initialState);

/** Create a simpler interface for interacting with the transaction types state than using `dispatch`. */
const useCreateTypesDispatch = (dispatch: TypesReactDispatch): TypesDispatch => {
    const toggleType = useCallback(
        (type: TransactionType) => {
            dispatch(transactionTypesSlice.actions.toggleType(type));
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

interface TransactionTypesProviderProps {
    /** The children of the provider. */
    children: React.ReactNode;
}

/** A provider for enabling transaction types filtering. */
export const TransactionTypesProvider = ({children}: TransactionTypesProviderProps) => {
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

/** Hook for accessing just the transaction types state. */
export const useTransactionTypesState = ({disableErrorCheck = false} = {}) => {
    const state = useContext(TypesStateContext);

    if (!disableErrorCheck && state === undefined) {
        throw new Error("useTransactionTypesState must be used within a TransactionTypesProvider.");
    }

    return state as TypesState;
};

/** Hook for accessing just the transaction types dispatch functions. */
export const useTransactionTypesDispatch = ({disableErrorCheck = false} = {}) => {
    const dispatch = useContext(TypesDispatchContext);

    if (!disableErrorCheck && dispatch === undefined) {
        throw new Error(
            "useTransactionTypesDispatch must be used within a TransactionTypesProvider."
        );
    }

    return dispatch as TypesDispatch;
};

/** Combined hook that is a single interface for accessing
 *  the transaction types filtering functionality. */
export const useTransactionTypes = ({disableErrorCheck = false} = {}) => ({
    state: useTransactionTypesState({disableErrorCheck}),
    dispatch: useTransactionTypesDispatch({disableErrorCheck})
});
