import {CaseReducer, PayloadAction, Selector} from "@reduxjs/toolkit";
import {ImportableTransaction, Transaction} from "models/";
import {Id, NonFunctionProperties} from "utils/types";

export type {RequestError} from "./utils/createRequestSlices";

export type ObjectifiedError = NonFunctionProperties<Error>;

export interface State {
    [key: string]: any;
}

export interface PayloadObject {
    id: Id;
    [key: string]: any;
}

export interface ReducerFactory {
    [key: string]: CaseReducer<State, PayloadAction<any>>;
}

/* Custom Selector Types */

export type TransactionSelector = (id: Id) => Selector<State, Transaction | ImportableTransaction>;
export type TransactionsSelector = Selector<State, Record<Id, Transaction | ImportableTransaction>>;
