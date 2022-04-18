import {RecurringTransaction} from "models/";

// Found from: https://stackoverflow.com/a/31615643
const getNumberWithOrdinal = (number: number): string => {
    const suffix = ["th", "st", "nd", "rd"];
    const v = number % 100;
    return number + (suffix[(v - 20) % 10] || suffix[v] || suffix[0]);
};

export const FREQ_OPTIONS = [
    {
        label: "Days",
        value: RecurringTransaction.FREQUENCIES.daily
    },
    {
        label: "Weeks",
        value: RecurringTransaction.FREQUENCIES.weekly
    },
    {
        label: "Months",
        value: RecurringTransaction.FREQUENCIES.monthly
    },
    {
        label: "Years",
        value: RecurringTransaction.FREQUENCIES.yearly
    }
];

export const WEEKDAYS = [
    {
        label: "Monday",
        value: `${RecurringTransaction.WEEKDAYS.monday}`
    },
    {
        label: "Tuesday",
        value: `${RecurringTransaction.WEEKDAYS.tuesday}`
    },
    {
        label: "Wednesday",
        value: `${RecurringTransaction.WEEKDAYS.wednesday}`
    },
    {
        label: "Thursday",
        value: `${RecurringTransaction.WEEKDAYS.thursday}`
    },
    {
        label: "Friday",
        value: `${RecurringTransaction.WEEKDAYS.friday}`
    },
    {
        label: "Saturday",
        value: `${RecurringTransaction.WEEKDAYS.saturday}`
    },
    {
        label: "Sunday",
        value: `${RecurringTransaction.WEEKDAYS.sunday}`
    }
];

export const MONTH_DAYS = RecurringTransaction.MONTH_DAYS.map((n) => {
    if (n === -1) {
        return {
            label: "last day",
            value: "-1"
        };
    } else {
        return {
            label: getNumberWithOrdinal(n),
            value: `${n}`
        };
    }
});

export const MONTHS = [
    {
        label: "January",
        value: `${RecurringTransaction.MONTHS.january}`
    },
    {
        label: "February",
        value: `${RecurringTransaction.MONTHS.february}`
    },
    {
        label: "March",
        value: `${RecurringTransaction.MONTHS.march}`
    },
    {
        label: "April",
        value: `${RecurringTransaction.MONTHS.april}`
    },
    {
        label: "May",
        value: `${RecurringTransaction.MONTHS.may}`
    },
    {
        label: "June",
        value: `${RecurringTransaction.MONTHS.june}`
    },
    {
        label: "July",
        value: `${RecurringTransaction.MONTHS.july}`
    },
    {
        label: "August",
        value: `${RecurringTransaction.MONTHS.august}`
    },
    {
        label: "September",
        value: `${RecurringTransaction.MONTHS.september}`
    },
    {
        label: "October",
        value: `${RecurringTransaction.MONTHS.october}`
    },
    {
        label: "November",
        value: `${RecurringTransaction.MONTHS.november}`
    },
    {
        label: "December",
        value: `${RecurringTransaction.MONTHS.december}`
    }
];

export const END_CONDITIONS = [
    {
        label: "After",
        value: RecurringTransaction.END_CONDITIONS.after
    },
    {
        label: "On",
        value: RecurringTransaction.END_CONDITIONS.on
    },
    {
        label: "Never",
        value: RecurringTransaction.END_CONDITIONS.never
    }
];
