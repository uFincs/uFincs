import {act, renderHook} from "@testing-library/react-hooks";
import React from "react";
import {DateService} from "services/";
import {UTCDateString} from "utils/types";
import {
    dateRangeSlice,
    initialState,
    useDateRange,
    DateRangeProvider,
    DateRangeSize,
    DateState
} from "./useDateRange";

const createNewState = (newState: Partial<DateState>) => ({...initialState, ...newState});

const Wrapper = ({children}: any) => <DateRangeProvider>{children}</DateRangeProvider>;

const renderHooks = () =>
    renderHook(
        () => {
            return useDateRange();
        },
        {wrapper: Wrapper}
    );

describe("useDateRange", () => {
    it("has the current month as the initial state", () => {
        const {result} = renderHooks();

        expect(result.current.state.startDate).toBe(
            DateService.convertToUTCString(DateService.getCurrentMonth())
        );

        expect(result.current.state.endDate).toEqual(
            DateService.convertToUTCString(DateService.getCurrentMonthLastDay())
        );

        expect(result.current.state.rangeSize).toBe(DateRangeSize.monthly);
    });

    it("can set the start date", () => {
        const {result} = renderHooks();

        act(() => {
            result.current.dispatch.setStartDate("2020-01-01" as UTCDateString);
        });

        expect(result.current.state.startDate).toBe("2020-01-01");
    });

    it("can set the end date", () => {
        const {result} = renderHooks();

        act(() => {
            result.current.dispatch.setEndDate("2100-01-01" as UTCDateString);
        });

        expect(result.current.state.endDate).toBe("2100-01-01");
    });

    it("can set the range size", () => {
        const {result} = renderHooks();

        act(() => {
            result.current.dispatch.setRangeSize(DateRangeSize.weekly);
        });

        expect(result.current.state.rangeSize).toBe(DateRangeSize.weekly);
    });

    it("can increment the date range to the next interval", () => {
        const {result} = renderHooks();

        // Set some baseline dates so that the tests are consistent.
        act(() => {
            result.current.dispatch.setStartDate("2020-01-01" as UTCDateString);
        });

        act(() => {
            result.current.dispatch.setEndDate("2020-01-31" as UTCDateString);
        });

        expect(result.current.state.rangeSize).toBe(DateRangeSize.monthly);

        // Increment to the next month.
        act(() => {
            result.current.dispatch.incrementRange();
        });

        expect(result.current.state.startDate).toBe("2020-02-01");
        expect(result.current.state.endDate).toBe("2020-02-29");
    });

    it("can decrement the date range to the previous interval", () => {
        const {result} = renderHooks();

        // Set some baseline dates so that the tests are consistent.
        act(() => {
            result.current.dispatch.setStartDate("2020-02-01" as UTCDateString);
        });

        act(() => {
            result.current.dispatch.setEndDate("2020-02-29" as UTCDateString);
        });

        expect(result.current.state.rangeSize).toBe(DateRangeSize.monthly);

        // Decrement to the previous month.
        act(() => {
            result.current.dispatch.decrementRange();
        });

        expect(result.current.state.startDate).toBe("2020-01-01");
        expect(result.current.state.endDate).toBe("2020-01-31");
    });
});

describe("state reducer", () => {
    const {actions, reducer} = dateRangeSlice;

    describe("setStartDate", () => {
        it("changes the start date", () => {
            const state = reducer(
                // Note: We're specifying the end date manually so that we don't have to deal with
                // the fact that the initial state is dynamic.
                createNewState({endDate: "2020-01-31" as UTCDateString}),
                actions.setStartDate("2020-01-01" as UTCDateString)
            );

            expect(state.startDate).toBe("2020-01-01");
        });

        it("updates the end date to the start date if the start date goes after the end date", () => {
            const state = reducer(
                createNewState({endDate: "2020-01-01" as UTCDateString}),
                actions.setStartDate("2020-01-31" as UTCDateString)
            );

            expect(state.startDate).toBe("2020-01-31");
            expect(state.endDate).toBe("2020-01-31");
            expect(state.rangeSize).toBe(DateRangeSize.daily);
        });
    });

    describe("setEndDate", () => {
        it("changes the end date", () => {
            const state = reducer(
                createNewState({startDate: "2020-01-01" as UTCDateString}),
                actions.setEndDate("2020-01-31" as UTCDateString)
            );

            expect(state.endDate).toBe("2020-01-31");
        });

        it("updates the start date to the end date if the end date comes before the start date", () => {
            const state = reducer(
                createNewState({startDate: "2020-01-31" as UTCDateString}),
                actions.setEndDate("2020-01-01" as UTCDateString)
            );

            expect(state.startDate).toBe("2020-01-01");
            expect(state.endDate).toBe("2020-01-01");
            expect(state.rangeSize).toBe(DateRangeSize.daily);
        });
    });

    describe("range changes during setStartDate/setEndDate", () => {
        it("updates the range size to 'daily' when the start/end dates are the same", () => {
            let state = reducer(
                createNewState({endDate: "2020-01-01" as UTCDateString}),
                actions.setStartDate("2020-01-01" as UTCDateString)
            );

            expect(state.rangeSize).toBe(DateRangeSize.daily);

            state = reducer(
                createNewState({startDate: "2020-01-01" as UTCDateString}),
                actions.setEndDate("2020-01-01" as UTCDateString)
            );

            expect(state.rangeSize).toBe(DateRangeSize.daily);
        });

        it("updates the range size to 'weekly' when the start/end dates are 6 days apart", () => {
            // Note: A 'week' is '7 days', which means that the start/end days 6 days _apart_.
            let state = reducer(
                createNewState({endDate: "2020-01-07" as UTCDateString}),
                actions.setStartDate("2020-01-01" as UTCDateString)
            );

            expect(state.rangeSize).toBe(DateRangeSize.weekly);

            state = reducer(
                createNewState({startDate: "2020-01-01" as UTCDateString}),
                actions.setEndDate("2020-01-07" as UTCDateString)
            );

            expect(state.rangeSize).toBe(DateRangeSize.weekly);
        });

        it(`updates the range size to 'monthly' when the start/end dates are the
            first/last of a month`, () => {
            let state = reducer(
                createNewState({endDate: "2020-01-31" as UTCDateString}),
                actions.setStartDate("2020-01-01" as UTCDateString)
            );

            expect(state.rangeSize).toBe(DateRangeSize.monthly);

            state = reducer(
                createNewState({startDate: "2020-01-01" as UTCDateString}),
                actions.setEndDate("2020-01-31" as UTCDateString)
            );

            expect(state.rangeSize).toBe(DateRangeSize.monthly);
        });

        it(`updates the range size to 'monthly' when the start/end dates share
            the same day but are a month apart`, () => {
            let state = reducer(
                createNewState({endDate: "2020-02-01" as UTCDateString}),
                actions.setStartDate("2020-01-01" as UTCDateString)
            );

            expect(state.rangeSize).toBe(DateRangeSize.monthly);

            state = reducer(
                createNewState({startDate: "2020-01-01" as UTCDateString}),
                actions.setEndDate("2020-02-01" as UTCDateString)
            );

            expect(state.rangeSize).toBe(DateRangeSize.monthly);
        });

        it(`updates the range size to 'yearly' when the start/end dates are the
            first/last of a year`, () => {
            let state = reducer(
                createNewState({endDate: "2020-12-31" as UTCDateString}),
                actions.setStartDate("2020-01-01" as UTCDateString)
            );

            expect(state.rangeSize).toBe(DateRangeSize.yearly);

            state = reducer(
                createNewState({startDate: "2020-01-01" as UTCDateString}),
                actions.setEndDate("2020-12-31" as UTCDateString)
            );

            expect(state.rangeSize).toBe(DateRangeSize.yearly);
        });

        it(`updates the range size to 'yearly' when the start/end dates share
            the same day/month but are a year apart`, () => {
            let state = reducer(
                createNewState({endDate: "2020-01-01" as UTCDateString}),
                actions.setStartDate("2019-01-01" as UTCDateString)
            );

            expect(state.rangeSize).toBe(DateRangeSize.yearly);

            state = reducer(
                createNewState({startDate: "2019-01-01" as UTCDateString}),
                actions.setEndDate("2020-01-01" as UTCDateString)
            );

            expect(state.rangeSize).toBe(DateRangeSize.yearly);
        });

        it("updates the range size to 'custom' when the range no longer fits a preset", () => {
            let state = reducer(
                createNewState({endDate: "2020-01-03" as UTCDateString}),
                actions.setStartDate("2020-01-01" as UTCDateString)
            );

            expect(state.rangeSize).toBe(DateRangeSize.custom);

            state = reducer(
                createNewState({startDate: "2020-01-01" as UTCDateString}),
                actions.setEndDate("2020-01-03" as UTCDateString)
            );

            expect(state.rangeSize).toBe(DateRangeSize.custom);
        });
    });

    describe("setRangeSize", () => {
        const mockState = createNewState({
            startDate: "2020-01-01" as UTCDateString,
            endDate: "2020-01-31" as UTCDateString
        });

        const today = DateService.getTodayDate();
        const todayString = DateService.convertToUTCString(today);

        const firstDayInMonth = DateService.getFirstDayInMonth(today);
        const lastDayInMonth = DateService.getLastDayInMonth(today);

        const firstDayInYear = DateService.getFirstDayInYear(today);
        const lastDayInYear = DateService.getLastDayInYear(today);

        const todayState = createNewState({
            startDate: DateService.convertToUTCString(firstDayInMonth),
            endDate: DateService.convertToUTCString(lastDayInMonth)
        });

        const thisYearState = createNewState({
            startDate: DateService.convertToUTCString(firstDayInYear),
            endDate: DateService.convertToUTCString(lastDayInYear),
            rangeSize: DateRangeSize.yearly
        });

        const datesDidNotChange = (state: DateState) => {
            expect(state.startDate).toBe(mockState.startDate);
            expect(state.endDate).toBe(mockState.endDate);
        };

        it("changes the range size", () => {
            const state = reducer(mockState, actions.setRangeSize(DateRangeSize.yearly));

            expect(state.rangeSize).toBe(DateRangeSize.yearly);
        });

        it("doesn't do anything when setting the range size to the same size", () => {
            for (const size of Object.values(DateRangeSize)) {
                const state = reducer({...mockState, rangeSize: size}, actions.setRangeSize(size));

                datesDidNotChange(state);
                expect(state.rangeSize).toBe(size);
            }
        });

        describe("change to 'daily'", () => {
            it("sets the dates to the endDate", () => {
                const state = reducer(mockState, actions.setRangeSize(DateRangeSize.daily));

                expect(state.startDate).toBe(mockState.endDate);
                expect(state.endDate).toBe(mockState.endDate);
                expect(state.rangeSize).toBe(DateRangeSize.daily);
            });

            it("sets the dates to today when the end date is in the current month", () => {
                const state = reducer(todayState, actions.setRangeSize(DateRangeSize.daily));

                expect(state.startDate).toBe(todayString);
                expect(state.endDate).toBe(todayString);
                expect(state.rangeSize).toBe(DateRangeSize.daily);
            });
        });

        describe("change to 'weekly'", () => {
            it("aligns the end of the date range with the endDate", () => {
                const state = reducer(mockState, actions.setRangeSize(DateRangeSize.weekly));

                expect(state.startDate).toBe("2020-01-25");
                expect(state.endDate).toBe(mockState.endDate);
                expect(state.rangeSize).toBe(DateRangeSize.weekly);
            });

            it("aligns the end of the date range with today if today is in the current month", () => {
                const state = reducer(todayState, actions.setRangeSize(DateRangeSize.weekly));

                const weekStart = DateService.convertToUTCString(
                    DateService.subtractDays(todayString, 6)
                );

                expect(state.startDate).toBe(weekStart);
                expect(state.endDate).toBe(todayString);
                expect(state.rangeSize).toBe(DateRangeSize.weekly);
            });
        });

        describe("change to 'monthly'", () => {
            it("aligns the date range with the month of the endDate", () => {
                // This is the simple case where both the start/end dates are in the same month.
                let state = reducer(
                    // Need to use a different initial state, since mockState is already monthly.
                    createNewState({
                        startDate: "2020-02-15" as UTCDateString,
                        endDate: "2020-02-15" as UTCDateString,
                        rangeSize: DateRangeSize.daily
                    }),
                    actions.setRangeSize(DateRangeSize.monthly)
                );

                expect(state.startDate).toBe("2020-02-01");
                expect(state.endDate).toBe("2020-02-29"); // Note: 2020 is a leap year!
                expect(state.rangeSize).toBe(DateRangeSize.monthly);

                // This is the case where both the start and end dates are in different months.
                state = reducer(
                    createNewState({
                        startDate: "2020-01-29" as UTCDateString,
                        endDate: "2020-02-05" as UTCDateString,
                        rangeSize: DateRangeSize.weekly
                    }),
                    actions.setRangeSize(DateRangeSize.monthly)
                );

                expect(state.startDate).toBe("2020-02-01");
                expect(state.endDate).toBe("2020-02-29");
                expect(state.rangeSize).toBe(DateRangeSize.monthly);
            });

            it("aligns the range with the current month if today is in the current year", () => {
                const state = reducer(thisYearState, actions.setRangeSize(DateRangeSize.monthly));

                expect(state.startDate).toBe(DateService.convertToUTCString(firstDayInMonth));
                expect(state.endDate).toBe(DateService.convertToUTCString(lastDayInMonth));
                expect(state.rangeSize).toBe(DateRangeSize.monthly);
            });

            it("aligns the range the range's month if the range is within a single month", () => {
                const firstDayInNextMonth = DateService.addMonth(firstDayInMonth);
                const lastDayInNextMonth = DateService.addMonth(lastDayInMonth);

                const secondDayInNextMonth = DateService.addDays(firstDayInNextMonth, 1);
                const secondLastDayInNextMonth = DateService.subtractDays(lastDayInNextMonth, 1);

                const initialState = createNewState({
                    startDate: DateService.convertToUTCString(secondDayInNextMonth),
                    endDate: DateService.convertToUTCString(secondLastDayInNextMonth),
                    rangeSize: DateRangeSize.custom
                });

                const state = reducer(initialState, actions.setRangeSize(DateRangeSize.monthly));

                expect(state.startDate).toBe(DateService.convertToUTCString(firstDayInNextMonth));
                expect(state.endDate).toBe(DateService.convertToUTCString(lastDayInNextMonth));
                expect(state.rangeSize).toBe(DateRangeSize.monthly);
            });
        });

        describe("change to 'yearly'", () => {
            it("aligns the date range with the year of the endDate", () => {
                // Simple case where both dates are in the same year.
                let state = reducer(mockState, actions.setRangeSize(DateRangeSize.yearly));

                expect(state.startDate).toBe("2020-01-01");
                expect(state.endDate).toBe("2020-12-31");
                expect(state.rangeSize).toBe(DateRangeSize.yearly);

                // Case where both dates are in different years.
                state = reducer(
                    createNewState({
                        startDate: "2019-12-15" as UTCDateString,
                        endDate: "2020-01-15" as UTCDateString
                    }),
                    actions.setRangeSize(DateRangeSize.yearly)
                );

                expect(state.startDate).toBe("2020-01-01");
                expect(state.endDate).toBe("2020-12-31");
                expect(state.rangeSize).toBe(DateRangeSize.yearly);
            });
        });

        describe("change to 'all time'", () => {
            it("doesn't change the dates when changing to 'all time'", () => {
                // 'All Time' is mostly handled a level up (UI or another hook) from this hook.
                // As such, 'All Time' doesn't really interact with the start/end dates or
                // incrementing/decrementing.
                const state = reducer(mockState, actions.setRangeSize(DateRangeSize.allTime));

                datesDidNotChange(state);
                expect(state.rangeSize).toBe(DateRangeSize.allTime);
            });
        });

        describe("change to 'custom'", () => {
            it("doesn't change the dates when manually changing to 'custom'", () => {
                const state = reducer(mockState, actions.setRangeSize(DateRangeSize.custom));

                datesDidNotChange(state);
                expect(state.rangeSize).toBe(DateRangeSize.custom);
            });
        });
    });

    describe("incrementRange", () => {
        describe("'day' range size", () => {
            it("increases the start/end dates by 1", () => {
                const state = reducer(
                    createNewState({
                        startDate: "2020-01-01" as UTCDateString,
                        endDate: "2020-01-01" as UTCDateString,
                        rangeSize: DateRangeSize.daily
                    }),
                    actions.incrementRange()
                );

                expect(state.startDate).toBe("2020-01-02");
                expect(state.endDate).toBe("2020-01-02");
            });

            it("can handle changes in months", () => {
                const state = reducer(
                    createNewState({
                        startDate: "2020-01-31" as UTCDateString,
                        endDate: "2020-01-31" as UTCDateString,
                        rangeSize: DateRangeSize.daily
                    }),
                    actions.incrementRange()
                );

                expect(state.startDate).toBe("2020-02-01");
                expect(state.endDate).toBe("2020-02-01");
            });

            it("can handle changes in years", () => {
                const state = reducer(
                    createNewState({
                        startDate: "2019-12-31" as UTCDateString,
                        endDate: "2019-12-31" as UTCDateString,
                        rangeSize: DateRangeSize.daily
                    }),
                    actions.incrementRange()
                );

                expect(state.startDate).toBe("2020-01-01");
                expect(state.endDate).toBe("2020-01-01");
            });
        });

        describe("'weekly' range size", () => {
            it("increases the start/end dates by 7", () => {
                const state = reducer(
                    createNewState({
                        startDate: "2020-01-01" as UTCDateString,
                        endDate: "2020-01-07" as UTCDateString,
                        rangeSize: DateRangeSize.weekly
                    }),
                    actions.incrementRange()
                );

                expect(state.startDate).toBe("2020-01-08");
                expect(state.endDate).toBe("2020-01-14");
            });

            it("can handle changes in months", () => {
                const state = reducer(
                    createNewState({
                        startDate: "2020-01-19" as UTCDateString,
                        endDate: "2020-01-25" as UTCDateString,
                        rangeSize: DateRangeSize.weekly
                    }),
                    actions.incrementRange()
                );

                expect(state.startDate).toBe("2020-01-26");
                expect(state.endDate).toBe("2020-02-01");
            });

            it("can handle changes in years", () => {
                const state = reducer(
                    createNewState({
                        startDate: "2019-12-22" as UTCDateString,
                        endDate: "2019-12-28" as UTCDateString,
                        rangeSize: DateRangeSize.weekly
                    }),
                    actions.incrementRange()
                );

                expect(state.startDate).toBe("2019-12-29");
                expect(state.endDate).toBe("2020-01-04");
            });
        });

        describe("'monthly' range size", () => {
            it("increases the start/end dates by 1 month", () => {
                const state = reducer(
                    createNewState({
                        startDate: "2020-01-15" as UTCDateString,
                        endDate: "2020-02-15" as UTCDateString,
                        rangeSize: DateRangeSize.monthly
                    }),
                    actions.incrementRange()
                );

                expect(state.startDate).toBe("2020-02-15");
                expect(state.endDate).toBe("2020-03-15");
            });

            it(`increases both the start/end date to the next month
                when the start/end date are the start/end of a month,`, () => {
                // From month with more days to month with less days.
                let state = reducer(
                    createNewState({
                        startDate: "2020-01-01" as UTCDateString,
                        endDate: "2020-01-31" as UTCDateString,
                        rangeSize: DateRangeSize.monthly
                    }),
                    actions.incrementRange()
                );

                expect(state.startDate).toBe("2020-02-01");
                expect(state.endDate).toBe("2020-02-29");

                // From month with less days to month with more days.
                state = reducer(
                    createNewState({
                        startDate: "2020-02-01" as UTCDateString,
                        endDate: "2020-02-29" as UTCDateString,
                        rangeSize: DateRangeSize.monthly
                    }),
                    actions.incrementRange()
                );

                expect(state.startDate).toBe("2020-03-01");
                expect(state.endDate).toBe("2020-03-31");
            });

            it("takes the last day of the month when if it would otherwise increment past it", () => {
                const state = reducer(
                    createNewState({
                        startDate: "2019-12-30" as UTCDateString,
                        endDate: "2020-01-30" as UTCDateString,
                        rangeSize: DateRangeSize.monthly
                    }),
                    actions.incrementRange()
                );

                expect(state.startDate).toBe("2020-01-30");
                expect(state.endDate).toBe("2020-02-29");
            });

            it("can handle changes in years", () => {
                let state = reducer(
                    createNewState({
                        startDate: "2019-12-01" as UTCDateString,
                        endDate: "2019-12-31" as UTCDateString,
                        rangeSize: DateRangeSize.monthly
                    }),
                    actions.incrementRange()
                );

                expect(state.startDate).toBe("2020-01-01");
                expect(state.endDate).toBe("2020-01-31");

                state = reducer(
                    createNewState({
                        startDate: "2019-12-15" as UTCDateString,
                        endDate: "2020-01-15" as UTCDateString,
                        rangeSize: DateRangeSize.monthly
                    }),
                    actions.incrementRange()
                );

                expect(state.startDate).toBe("2020-01-15");
                expect(state.endDate).toBe("2020-02-15");
            });
        });

        describe("'yearly' range size", () => {
            it("increases the start/end dates by 1 year", () => {
                const state = reducer(
                    createNewState({
                        startDate: "2019-01-01" as UTCDateString,
                        endDate: "2020-01-01" as UTCDateString,
                        rangeSize: DateRangeSize.yearly
                    }),
                    actions.incrementRange()
                );

                expect(state.startDate).toBe("2020-01-01");
                expect(state.endDate).toBe("2021-01-01");
            });

            it("can handle the start/end of a year", () => {
                const state = reducer(
                    createNewState({
                        startDate: "2020-01-01" as UTCDateString,
                        endDate: "2020-12-31" as UTCDateString,
                        rangeSize: DateRangeSize.yearly
                    }),
                    actions.incrementRange()
                );

                expect(state.startDate).toBe("2021-01-01");
                expect(state.endDate).toBe("2021-12-31");
            });
        });

        describe("'custom' range size", () => {
            it("increases the start/end dates by the number of days between the start/end", () => {
                const state = reducer(
                    createNewState({
                        startDate: "2020-01-01" as UTCDateString,
                        endDate: "2020-01-05" as UTCDateString,
                        rangeSize: DateRangeSize.custom
                    }),
                    actions.incrementRange()
                );

                expect(state.startDate).toBe("2020-01-06");
                expect(state.endDate).toBe("2020-01-10");
            });
        });

        describe("'all time' range size", () => {
            it("doesn't do anything, because incrementing by 'all time' means nothing", () => {
                const state = reducer(
                    createNewState({
                        startDate: "2020-01-01" as UTCDateString,
                        endDate: "2020-01-05" as UTCDateString,
                        rangeSize: DateRangeSize.allTime
                    }),
                    actions.incrementRange()
                );

                expect(state.startDate).toBe("2020-01-01");
                expect(state.endDate).toBe("2020-01-05");
            });
        });
    });

    describe("decrementRange", () => {
        describe("'day' range size", () => {
            it("decreases the start/end dates by 1", () => {
                const state = reducer(
                    createNewState({
                        startDate: "2020-01-02" as UTCDateString,
                        endDate: "2020-01-02" as UTCDateString,
                        rangeSize: DateRangeSize.daily
                    }),
                    actions.decrementRange()
                );

                expect(state.startDate).toBe("2020-01-01");
                expect(state.endDate).toBe("2020-01-01");
            });
        });

        describe("'weekly' range size", () => {
            it("decreases the start/end dates by 7", () => {
                const state = reducer(
                    createNewState({
                        startDate: "2020-01-08" as UTCDateString,
                        endDate: "2020-01-14" as UTCDateString,
                        rangeSize: DateRangeSize.weekly
                    }),
                    actions.decrementRange()
                );

                expect(state.startDate).toBe("2020-01-01");
                expect(state.endDate).toBe("2020-01-07");
            });
        });

        describe("'monthly' range size", () => {
            it("decreases the start/end dates by 1 month", () => {
                const state = reducer(
                    createNewState({
                        startDate: "2020-02-15" as UTCDateString,
                        endDate: "2020-03-15" as UTCDateString,
                        rangeSize: DateRangeSize.monthly
                    }),
                    actions.decrementRange()
                );

                expect(state.startDate).toBe("2020-01-15");
                expect(state.endDate).toBe("2020-02-15");
            });

            it(`when the start/end date are the start/end of a month,
                it decreases both to the start/end of the previous month`, () => {
                const state = reducer(
                    createNewState({
                        startDate: "2020-02-01" as UTCDateString,
                        endDate: "2020-02-29" as UTCDateString,
                        rangeSize: DateRangeSize.monthly
                    }),
                    actions.decrementRange()
                );

                expect(state.startDate).toBe("2020-01-01");
                expect(state.endDate).toBe("2020-01-31");
            });
        });

        describe("'yearly' range size", () => {
            it("decreases the start/end dates by 1 year", () => {
                const state = reducer(
                    createNewState({
                        startDate: "2020-01-01" as UTCDateString,
                        endDate: "2021-01-01" as UTCDateString,
                        rangeSize: DateRangeSize.yearly
                    }),
                    actions.decrementRange()
                );

                expect(state.startDate).toBe("2019-01-01");
                expect(state.endDate).toBe("2020-01-01");
            });
        });

        describe("'custom' range size", () => {
            it("decreases the start/end dates by the number of days between the start/end", () => {
                const state = reducer(
                    createNewState({
                        startDate: "2020-01-06" as UTCDateString,
                        endDate: "2020-01-10" as UTCDateString,
                        rangeSize: DateRangeSize.custom
                    }),
                    actions.decrementRange()
                );

                expect(state.startDate).toBe("2020-01-01");
                expect(state.endDate).toBe("2020-01-05");
            });
        });

        describe("'all time' range size", () => {
            it("doesn't do anything, because decrementing by 'all time' means nothing", () => {
                const state = reducer(
                    createNewState({
                        startDate: "2020-01-01" as UTCDateString,
                        endDate: "2020-01-05" as UTCDateString,
                        rangeSize: DateRangeSize.allTime
                    }),
                    actions.decrementRange()
                );

                expect(state.startDate).toBe("2020-01-01");
                expect(state.endDate).toBe("2020-01-05");
            });
        });
    });
});
