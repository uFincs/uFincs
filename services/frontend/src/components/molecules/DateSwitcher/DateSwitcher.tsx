import classNames from "classnames";
import {useEffect, useRef, useState} from "react";
import * as React from "react";
import {ArrowNarrowRightIcon} from "assets/icons";
import {IntervalSwitcher} from "components/atoms";
import {CustomFormatDateInput} from "components/molecules";
import {useDateRange, useKeyboardNavigation} from "hooks/";
import {DateRangeSize} from "hooks/useDateRange";
import {DateService} from "services/";
import "./DateSwitcher.scss";
import {UTCDateString} from "utils/types";

interface DateSwitcherProps {
    /** Custom class name. */
    className?: string;
}

/** A switcher for changing between date ranges or specify custom ranges. */
const DateSwitcher = ({className}: DateSwitcherProps) => {
    const {
        state: {startDate, endDate, rangeSize},
        dispatch: {setStartDate, setEndDate, incrementRange, decrementRange}
    } = useDateRange();

    const disabled = rangeSize === DateRangeSize.allTime;

    const {rawStartDate, rawEndDate, onStartChange, onEndChange} = useDateInputs(
        startDate,
        endDate,
        setStartDate,
        setEndDate
    );

    const onKeyDown = useKeyboardNavigation({
        onPrevious: decrementRange,
        onNext: incrementRange,
        disableKeys: {home: true, end: true, up: true, down: true},
        reverseUpDown: true
    });

    const {startDateInputRef} = useFocusStartDateOnCustom(rangeSize);

    return (
        <IntervalSwitcher
            className={classNames("DateSwitcher", className)}
            data-testid="date-switcher"
            aria-label="Date Range Navigation"
            role="navigation"
            disabled={disabled}
            onKeyDown={onKeyDown}
            decrementButtonProps={{
                title: "Decrement Date Range",
                onClick: decrementRange
            }}
            incrementButtonProps={{
                title: "Increment Date Range",
                onClick: incrementRange
            }}
        >
            <div className="DateSwitcher-content">
                <CustomFormatDateInput
                    className="DateSwitcher-input"
                    data-testid="date-switcher-start-date-input"
                    aria-label="Start Date"
                    disabled={disabled}
                    value={rawStartDate}
                    onChange={onStartChange}
                    ref={startDateInputRef}
                />

                <ArrowNarrowRightIcon
                    className={classNames("DateSwitcher-arrow-icon", {
                        "DateSwitcher-arrow-icon--disabled": disabled
                    })}
                />

                <CustomFormatDateInput
                    className="DateSwitcher-input"
                    data-testid="date-switcher-end-date-input"
                    aria-label="End Date"
                    disabled={disabled}
                    value={rawEndDate}
                    onChange={onEndChange}
                />
            </div>
        </IntervalSwitcher>
    );
};

export default DateSwitcher;

/* Hooks */

const useDateInputs = (
    startDate: string,
    endDate: string,
    setStartDate: (date: UTCDateString) => void,
    setEndDate: (date: UTCDateString) => void
) => {
    // We need to store the raw date values internally to handle the case where a user actually types
    // into the input instead of using the date picker. AKA, cause Safari sucks (until very recently,
    // Safari didn't provide a native date picker widget for date inputs).
    const [rawStartDate, setRawStartDate] = useState(startDate);
    const [rawEndDate, setRawEndDate] = useState(endDate);

    const onStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target;

        if (DateService.isUTCString(value)) {
            setStartDate(DateService.validateUTCString(value));
        }

        setRawStartDate(value);
    };

    const onEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target;

        if (DateService.isUTCString(value)) {
            setEndDate(DateService.validateUTCString(e.target.value));
        }

        setRawEndDate(value);
    };

    // When the start/end date are updated from the context state,
    // we need to reflect these changes into our internal state.
    useEffect(() => {
        setRawStartDate(startDate);
    }, [startDate]);

    useEffect(() => {
        setRawEndDate(endDate);
    }, [endDate]);

    return {rawStartDate, rawEndDate, onStartChange, onEndChange};
};

const useFocusStartDateOnCustom = (rangeSize: DateRangeSize) => {
    // Keep a reference to the previous range size so that we can use is a heuristic for whether or not
    // the user manually changed the range size to "Custom". This way, we don't focus onto the
    // start date input unnecessarily (e.g. when changing pages in the app), and only when the user
    // changed the range size themselves or changed the end date manually.
    const previousRangeSize = useRef<DateRangeSize | null>(null);

    // Need a ref to the start date input so that we can manually focus it.
    const startDateInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        // Focus the Start Date input when the user manually changes the range size to Custom.
        // This doesn't actually open the date picker (cause, afaik, you can't programmatically open it),
        // but at least it produces a noticeable change that should at least give the user an indication
        // that they can change the date range manually.
        if (
            rangeSize === DateRangeSize.custom &&
            previousRangeSize.current !== null &&
            previousRangeSize.current !== DateRangeSize.custom
        ) {
            startDateInputRef.current?.focus();
        }

        previousRangeSize.current = rangeSize;
    }, [rangeSize]);

    return {startDateInputRef};
};
