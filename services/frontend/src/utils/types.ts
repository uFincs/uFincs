import {ValidationRules} from "react-hook-form";
import {
    ImportRuleActionProperty,
    ImportRuleConditionCondition,
    ImportRuleConditionProperty
} from "models/";

export type Id = string;

export interface GenericObject {
    [key: string]: any;
}

export interface ObjectWithId extends GenericObject {
    id: Id;
}

export type AnyDate = Date | number | string;
export type UTCDate = Date & {__TYPE__: "UTCDate"};
export type UTCDateString = string & {__TYPE__: "UTCStringDate"};

export type Cents = number;

// Note: 1000 Millipercents = 1 percent.
// Just like 100 cents = 1 dollar.
export type Millipercents = number;

export type SuggestionOptionLabel = string;
export type SuggestionOptionValue = string;

export interface SuggestionOption {
    label: SuggestionOptionLabel;
    value: SuggestionOptionValue;
}

export type CsvFileContents = Array<Array<string>>;

export type TableSortDirection = "asc" | "desc";

/* Chart Types */

/** The date interval is how big a chart data point is.
 *  For example, if the date interval is 'days', then each data point is a day, but if the interval
 *  is 'weeks', then each data point is a single week. */
export enum ChartDateInterval {
    days = "days",
    weeks = "weeks",
    months = "months",
    years = "years"
}

/** All data point types shall be named in the following manner:
 *
 *  [X-axis value][Y-axis value]DataPoint
 *
 *  For example, `DateAmountDataPoint` means the data point has dates for the x-axis and
 *  amounts for the y-axis. */
export interface DateAmountDataPoint {
    /** The amount at this data point's point-in-time. */
    amount: number;

    /** The date that represents the end date of the data point.
     *  For example, this means that a data point that represents a week has a 'date' that
     *  is the last day in the week. */
    date: UTCDate;
}

/* Form Types */

// Need these here so we can import them easily from the Cypress tests.
export enum DateOption {
    oneOff = 0,
    recurring = 1
}

export interface TransactionFormData {
    description: string;
    amount: string;
    notes: string;
    dateOption: number;
    date: string;
    // For interval and count (which are numbers), must treat them as strings because that's just how
    // text inputs work. Have to cast later accordingly.
    // Note: react-hook-form has a `valueAsNumber` option but it doesn't seem to do anything...
    interval: string;
    freq: string;
    onWeekday: string;
    onMonthday: string;
    onMonth: string;
    onDay: string;
    startDate: string;
    endCondition: string;
    count: string;
    endDate: string;
    type: string;
    creditAccount: {label: string; value: Id};
    debitAccount: {label: string; value: Id};
}

export interface ImportRuleFormData {
    conditions: Array<{
        condition: ImportRuleConditionCondition;
        property: ImportRuleConditionProperty;
        value: string;
    }>;
    actions: Array<{property: ImportRuleActionProperty; value: string}>;
}

/* Utility Types */

// These two types allow creating a new type from a class
// that excludes all instance methods (i.e. functions).
// This is useful for the Redux store, since only the
// data from an object is stored (not the functions).
//
// Found from https://stackoverflow.com/a/55479659,
// which references https://www.typescriptlang.org/v2/docs/handbook/advanced-types.html#example-1.
export type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

export type PromiseValue<T> = T extends Promise<infer U> ? U : T;
export type PromiseReturnValue<T extends (...args: any[]) => any> = PromiseValue<ReturnType<T>>;

/* react-hook-form types, since they do a piss poor job of exporting their own */

export type ReactHookFormHandleSubmitFunction<FormData> = (
    callback: (formData: FormData) => void
) => () => Promise<void>;

export type ReactHookFormRegisterFunction = (
    e: HTMLInputElement,
    validateOptions: ValidationRules
) => void;

export type ReactHookFormResetFunction<FormData> = (values?: FormData) => void;

export type ReactHookFormClearErrorFunction = (name?: string | string[]) => void;

export type ReactHookFormSetErrorFunction = (
    name: string,
    error: {type: "manual"; message: string}
) => void;

export type ReactHookFormSetValueFunction = (name: string, value: any, options?: any) => void;
export type ReactHookFormGetValueFunction = <T>(name?: string) => T;
export type ReactHookFormTriggerFunction = () => Promise<boolean>;
