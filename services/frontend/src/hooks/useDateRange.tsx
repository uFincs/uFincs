import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import React, {useCallback, useContext, useReducer, useMemo} from "react";
import {DateService} from "services/";
import {AnyDate, UTCDateString} from "utils/types";

// Hooks + Context state for the app-wide date range state.
// It was originally designed using Context state rather than Redux state because we wanted to enable
// having per - page date ranges, but then we realized that a single app - wide date range made more sense.
//
// This design blunder was never fixed. Probably one of the biggest pieces of tech debt in the codebase.

// Remember, the difference between the start/end date of a week is _6_ days.
const DAYS_IN_WEEK = 6;

/** Function for converting all dates stored in the state to a consistent format. */
const formatDate = (date: AnyDate) => DateService.convertToUTCString(date);

/* Types */

export enum DateRangeSize {
    daily = "daily",
    weekly = "weekly",
    monthly = "monthly",
    yearly = "yearly",
    allTime = "allTime",
    custom = "custom"
}

export interface DateState {
    /** The date that denotes the start of the range. */
    startDate: UTCDateString;

    /** The date that denotes the end of the range. */
    endDate: UTCDateString;

    /** The size of the date range (i.e. number of days between startDate and endDate). */
    rangeSize: DateRangeSize;
}

interface DateDispatch {
    /** Set the start date of the range. */
    setStartDate: (date: UTCDateString) => void;

    /** Set the end date of the range. */
    setEndDate: (date: UTCDateString) => void;

    /** Set the size of the date range. */
    setRangeSize: (size: DateRangeSize) => void;

    /** Increase the start/end date by one range size. */
    incrementRange: () => void;

    /** Decrease the start/end date by one range size. */
    decrementRange: () => void;
}

type DateReactDispatch = React.Dispatch<PayloadAction<UTCDateString | DateRangeSize | undefined>>;

/* Date Range Slice */

export const initialState: DateState = {
    startDate: formatDate(DateService.getCurrentMonth()),
    endDate: formatDate(DateService.getCurrentMonthLastDay()),
    rangeSize: DateRangeSize.monthly
};

const updateRangeWhenDateChanges = (state: DateState): void => {
    const {startDate, endDate} = state;

    if (startDate === endDate) {
        state.rangeSize = DateRangeSize.daily;
    } else if (DateService.isOneWeekApart(startDate, endDate)) {
        state.rangeSize = DateRangeSize.weekly;
    } else if (DateService.isOneMonthApart(startDate, endDate)) {
        state.rangeSize = DateRangeSize.monthly;
    } else if (DateService.isOneYearApart(startDate, endDate)) {
        state.rangeSize = DateRangeSize.yearly;
    } else {
        state.rangeSize = DateRangeSize.custom;
    }
};

const updateDatesWhenRangeChanges = (state: DateState): void => {
    const today = DateService.getTodayAsUTCString();

    switch (state.rangeSize) {
        case DateRangeSize.daily:
            if (DateService.isTodayInMonth(state.endDate)) {
                // When 'today' is in the month of the end date, set the date to today.
                state.startDate = today;
                state.endDate = today;
            } else {
                state.startDate = state.endDate;
            }

            break;
        case DateRangeSize.weekly:
            if (DateService.isTodayInMonth(state.endDate)) {
                // When 'today' is in the month of the end date, align the week so that the end date
                // is aligned with 'today' rather than the previous end date.
                state.endDate = today;
                state.startDate = formatDate(DateService.subtractDays(today, DAYS_IN_WEEK));
            } else {
                state.startDate = formatDate(DateService.subtractDays(state.endDate, DAYS_IN_WEEK));
            }

            break;
        case DateRangeSize.monthly:
            if (
                DateService.isTodayInYear(state.endDate) &&
                !DateService.datesShareMonth(state.startDate, state.endDate)
            ) {
                // When 'today' is in the same year as the end date, and when the start/end date _aren't_
                // in the same month, switching to the Monthly range should shift us back to the current
                // month.
                state.startDate = formatDate(DateService.getFirstDayInMonth(today));
                state.endDate = formatDate(DateService.getLastDayInMonth(today));
            } else {
                // However, if the start/end dates _are_ in the same month, then align against the month
                // of the start/end dates.
                //
                // Why this logic? Because if someone is looking at something within the same month,
                // then they likely care about that month. But if they're looking at multiple months,
                // it is quite likely that they selected the "Yearly" range and want to go back to the
                // current month when selecting "Month" again.
                //
                // Outside of that case, getting a range that spans multiple months requires custom
                // ranges, which is (supposedly) less likely. In that case... well, it could really go
                // either way, but evidently I'm deferring to just switching to the current month.
                state.startDate = formatDate(DateService.getFirstDayInMonth(state.endDate));
                state.endDate = formatDate(DateService.getLastDayInMonth(state.endDate));
            }

            break;
        case DateRangeSize.yearly:
            state.startDate = formatDate(DateService.getFirstDayInYear(state.endDate));
            state.endDate = formatDate(DateService.getLastDayInYear(state.endDate));
            break;
        // When manually changing to 'custom' or 'all time', the dates shouldn't be affected
        // (because it doesn't make sense to change them on those).
        default:
            break;
    }
};

export const shiftByOneInterval = (state: DateState, direction: "forward" | "backward"): void => {
    const {startDate, endDate, rangeSize} = state;

    const operation: "add" | "subtract" = direction === "forward" ? "add" : "subtract";

    // We need all this fixed string casting because DateService doesn't have an index signature;
    // as such, TypeScript complains that it can't index it with a 'string'.
    const daysOp = `${operation}Days` as "addDays" | "subtractDays";
    const weekOp = `${operation}Week` as "addWeek" | "subtractWeek";
    const monthOp = `${operation}Month` as "addMonth" | "subtractMonth";
    const yearOp = `${operation}Year` as "addYear" | "subtractYear";

    switch (rangeSize) {
        case DateRangeSize.daily:
            state.startDate = formatDate(DateService[daysOp](startDate, 1));
            state.endDate = formatDate(DateService[daysOp](endDate, 1));
            break;
        case DateRangeSize.weekly:
            state.startDate = formatDate(DateService[weekOp](startDate));
            state.endDate = formatDate(DateService[weekOp](endDate));
            break;
        case DateRangeSize.monthly:
            state.startDate = formatDate(DateService[monthOp](startDate));
            state.endDate = formatDate(DateService[monthOp](endDate));
            break;
        case DateRangeSize.yearly:
            state.startDate = formatDate(DateService[yearOp](startDate));
            state.endDate = formatDate(DateService[yearOp](endDate));
            break;
        case DateRangeSize.custom:
            // Add 1 because we don't want the next date range to include the existing dates.
            const daysBetween = DateService.daysBetween(startDate, endDate) + 1;

            state.startDate = formatDate(DateService[daysOp](startDate, daysBetween));
            state.endDate = formatDate(DateService[daysOp](endDate, daysBetween));

            break;
        default:
            break;
    }
};

export const dateRangeSlice = createSlice({
    name: "dateRange", // Note: name doesn't matter since this slice isn't used in the store.
    initialState,
    reducers: {
        setStartDate: (state: DateState, action: PayloadAction<UTCDateString>) => {
            state.startDate = formatDate(action.payload);

            if (!DateService.isLessThan(state.startDate, state.endDate)) {
                state.endDate = state.startDate;
            }

            updateRangeWhenDateChanges(state);
        },
        setEndDate: (state: DateState, action: PayloadAction<UTCDateString>) => {
            state.endDate = formatDate(action.payload);

            if (!DateService.isLessThan(state.startDate, state.endDate)) {
                state.startDate = state.endDate;
            }

            updateRangeWhenDateChanges(state);
        },
        setRangeSize: (state: DateState, action: PayloadAction<DateRangeSize>) => {
            if (state.rangeSize !== action.payload) {
                state.rangeSize = action.payload;

                updateDatesWhenRangeChanges(state);
            }
        },
        incrementRange: (state: DateState) => {
            shiftByOneInterval(state, "forward");
        },
        decrementRange: (state: DateState) => {
            shiftByOneInterval(state, "backward");
        }
    }
});

/* React Context */

const DateStateContext = React.createContext<DateState | undefined>(undefined);
const DateDispatchContext = React.createContext<DateDispatch | undefined>(undefined);

/* Utility Hooks */

const useDateRangeReducer = () => useReducer(dateRangeSlice.reducer, initialState);

/** Create a simpler interface for interacting with the date range state than using `dispatch`. */
const useCreateDateDispatch = (dispatch: DateReactDispatch): DateDispatch => {
    const setStartDate = useCallback(
        (date: UTCDateString) => {
            dispatch(dateRangeSlice.actions.setStartDate(date));
        },
        [dispatch]
    );

    const setEndDate = useCallback(
        (date: UTCDateString) => {
            dispatch(dateRangeSlice.actions.setEndDate(date));
        },
        [dispatch]
    );

    const setRangeSize = useCallback(
        (size: DateRangeSize) => {
            dispatch(dateRangeSlice.actions.setRangeSize(size));
        },
        [dispatch]
    );

    const incrementRange = useCallback(
        () => dispatch(dateRangeSlice.actions.incrementRange()),
        [dispatch]
    );

    const decrementRange = useCallback(
        () => dispatch(dateRangeSlice.actions.decrementRange()),
        [dispatch]
    );

    return useMemo(
        () => ({
            setStartDate,
            setEndDate,
            setRangeSize,
            incrementRange,
            decrementRange
        }),
        [setStartDate, setEndDate, setRangeSize, incrementRange, decrementRange]
    );
};

/* Custom Provider */

interface DateRangeProviderProps {
    /** The children of the provider. */
    children: React.ReactNode;
}

/** A provider for enabling date range filtering. */
export const DateRangeProvider = ({children}: DateRangeProviderProps) => {
    const [dateState, dispatch] = useDateRangeReducer();

    const dateDispatch = useCreateDateDispatch(dispatch);

    return (
        <DateStateContext.Provider value={dateState}>
            <DateDispatchContext.Provider value={dateDispatch}>
                {children}
            </DateDispatchContext.Provider>
        </DateStateContext.Provider>
    );
};

/* Hooks */

/** Hook for accessing just the date range state. */
export const useDateRangeState = () => {
    const state = useContext(DateStateContext);

    if (state === undefined) {
        throw new Error("useDateRangeState must be used within a DateRangeProvider.");
    }

    return state as DateState;
};

/** Hook for accessing just the date range dispatch functions. */
export const useDateRangeDispatch = () => {
    const dispatch = useContext(DateDispatchContext);

    if (dispatch === undefined) {
        throw new Error("useDateRangeDispatch must be used within a DateRangeProvider.");
    }

    return dispatch as DateDispatch;
};

/** Combined hook that is a single interface for accessing the date range functionality. */
export const useDateRange = () => ({
    state: useDateRangeState(),
    dispatch: useDateRangeDispatch()
});
