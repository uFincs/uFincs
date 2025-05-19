import classNames from "classnames";
import {useEffect, useMemo, useRef, useCallback} from "react";
import * as React from "react";
import {Button, SelectInput} from "components/atoms";
import {ButtonProps} from "components/atoms/Button";
import {useDateRange, useKeyboardNavigation} from "hooks/";
import {DateRangeSize} from "hooks/useDateRange";
import {MathUtils} from "services/";
import "./DateRangeSizePicker.scss";

const ORDERED_DATE_RANGE_SIZES = Object.values(DateRangeSize);

const DATE_RANGE_OPTIONS = [
    {label: "Daily", value: DateRangeSize.daily},
    {label: "Weekly", value: DateRangeSize.weekly},
    {label: "Monthly", value: DateRangeSize.monthly},
    {label: "Yearly", value: DateRangeSize.yearly},
    {label: "All Time", value: DateRangeSize.allTime},
    {label: "Custom", value: DateRangeSize.custom}
];

interface DateRangeSizePickerProps {
    /** Custom class name. */
    className?: string;
}

/** A 'radio' picker for manually setting the size of the date range. */
const DateRangeSizePicker = ({className}: DateRangeSizePickerProps) => (
    <div className={classNames("DateRangeSizePicker", className)}>
        <MobilePicker />
        <DesktopPicker />
    </div>
);

export default DateRangeSizePicker;

/* Other Components */

/** The mobile version of the `DateRangeSizePicker`, which is just a `SelectInput`. */
const MobilePicker = ({className}: DateRangeSizePickerProps) => {
    const {
        state: {rangeSize},
        dispatch: {setRangeSize}
    } = useDateRange();

    const onChange = (e: React.ChangeEvent<HTMLSelectElement>) =>
        setRangeSize(e.target.value as DateRangeSize);

    return (
        <SelectInput
            containerClassName={classNames("DateRangeSizePicker-mobile", className)}
            className="DateRangeSizePicker-mobile-input"
            data-testid="date-range-size-picker-mobile"
            title="Date Range Size Picker"
            value={rangeSize}
            values={DATE_RANGE_OPTIONS}
            onChange={onChange}
        />
    );
};

/** The desktop version of the `DateRangeSizePicker`, which is a series of buttons
 *  that shows the user all of the options at once. */
const DesktopPicker = ({className}: DateRangeSizePickerProps) => {
    const {
        state: {rangeSize},
        dispatch: {setRangeSize}
    } = useDateRange();

    const onFirst = useCallback(() => setRangeSize(DateRangeSize.daily), [setRangeSize]);
    const onLast = useCallback(() => setRangeSize(DateRangeSize.custom), [setRangeSize]);

    const onPrevious = useCallback(() => {
        const current = ORDERED_DATE_RANGE_SIZES.indexOf(rangeSize);

        setRangeSize(
            ORDERED_DATE_RANGE_SIZES[
                MathUtils.decrementWithWrapping(current, ORDERED_DATE_RANGE_SIZES.length)
            ]
        );
    }, [rangeSize, setRangeSize]);

    const onNext = useCallback(() => {
        const current = ORDERED_DATE_RANGE_SIZES.indexOf(rangeSize);

        setRangeSize(
            ORDERED_DATE_RANGE_SIZES[
                MathUtils.incrementWithWrapping(current, ORDERED_DATE_RANGE_SIZES.length)
            ]
        );
    }, [rangeSize, setRangeSize]);

    const onKeyDown = useKeyboardNavigation({
        onFirst,
        onLast,
        onPrevious,
        onNext
    });

    const optionButtons = useMemo(
        () =>
            DATE_RANGE_OPTIONS.map(({label, value}) => (
                <RangeSizeButton
                    key={value}
                    active={rangeSize === value}
                    onClick={() => setRangeSize(value as DateRangeSize)}
                >
                    {label}
                </RangeSizeButton>
            )),
        [rangeSize, setRangeSize]
    );

    return (
        <div
            className={classNames("DateRangeSizePicker-desktop", className)}
            data-testid="date-range-size-picker-desktop"
            aria-label="Date Range Size"
            aria-orientation="horizontal"
            aria-multiselectable={false}
            aria-roledescription="Picker"
            role="listbox"
            onKeyDown={onKeyDown}
        >
            {optionButtons}
        </div>
    );
};

interface RangeSizeButtonProps extends ButtonProps {
    /** Whether or not the button is the currently active one. */
    active?: boolean;
}

/** The custom button used in the `DesktopPicker`. */
const RangeSizeButton = ({active, children, ...otherProps}: RangeSizeButtonProps) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const mountRef = useRef(false);

    useEffect(() => {
        // Want to focus the button when it becomes active.
        // This is really only relevant for the keyboard navigation.
        if (active && mountRef.current === true) {
            buttonRef?.current?.focus();
        }

        mountRef.current = true;
    }, [active]);

    return (
        <Button
            className={classNames("RangeSizeButton", {
                "RangeSizeButton--active": active
            })}
            aria-selected={active}
            role="option"
            // Only allow the active button to receive tab focus, like a radio group.
            tabIndex={active ? 0 : -1}
            ref={buttonRef}
            {...otherProps}
        >
            {children}
        </Button>
    );
};
