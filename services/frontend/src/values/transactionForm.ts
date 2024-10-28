import {RecurringTransaction, Transaction} from "models/";
import {DateService, SearchService} from "services/";
import {
    DateOption,
    ReactHookFormGetValueFunction,
    SuggestionOption,
    TransactionFormData
} from "utils/types";
import InputValidation from "values/inputValidation";

export {DateOption};
export type {TransactionFormData};

// These are the params that are allowed to be passed via URL hash params. This way, we can control
// the initial state of the form easily from other sources (e.g. buttons).
//
// For example, to select the "Recurring" tab by default, just append `#recurring=true` to the URL
// for the Transaction Form.
export const hashParams = {
    recurring: "recurring"
};

export const defaultValues: TransactionFormData = {
    description: "",
    amount: "",
    notes: "",
    dateOption: DateOption.oneOff,
    date: DateService.getTodayAsUTCString(),
    interval: "1",
    freq: RecurringTransaction.FREQUENCIES.daily,
    onWeekday: `${RecurringTransaction.WEEKDAYS.monday}`,
    onMonthday: `${RecurringTransaction.MONTH_DAYS[0]}`,
    onMonth: `${RecurringTransaction.MONTHS.january}`,
    onDay: "1",
    startDate: DateService.getTodayAsUTCString(),
    endCondition: RecurringTransaction.END_CONDITIONS.after,
    count: "1",
    endDate: DateService.getTodayAsUTCString(),
    type: Transaction.INCOME,
    creditAccount: {label: "", value: ""},
    debitAccount: {label: "", value: ""}
};

export const submissionErrorGrammarMap: Record<string, Record<string, string>> = {
    description: {
        article: "the",
        subject: "description"
    },
    amount: {
        article: "the",
        subject: "amount"
    },
    date: {
        article: "the",
        subject: "date"
    },
    interval: {
        article: "the",
        subject: "interval"
    },
    freq: {
        article: "the",
        subject: "frequency"
    },
    onWeekday: {
        article: "the",
        subject: "weekday"
    },
    onMonthday: {
        article: "the",
        subject: "month day"
    },
    onMonth: {
        article: "the",
        subject: "month"
    },
    onDay: {
        article: "the",
        subject: "day"
    },
    startDate: {
        article: "the",
        subject: "start date"
    },
    endCondition: {
        article: "the",
        subject: "end condition"
    },
    count: {
        article: "the",
        subject: "count"
    },
    endDate: {
        article: "the",
        subject: "end date"
    },
    type: {
        article: "the",
        subject: "type"
    },
    creditAccount: {
        article: "an",
        subject: "account"
    },
    debitAccount: {
        article: "an",
        subject: "account"
    }
};

const integerRules = {
    min: {
        value: 1,
        message: "Too small"
    },
    max: {
        value: 1000,
        message: "Too large"
    },
    pattern: {
        value: /\d*/,
        message: "Must be an integer"
    }
};

const isRecurringDate = (getValues: ReactHookFormGetValueFunction) =>
    getValues<DateOption>("dateOption") === DateOption.recurring;

export const inputRules = {
    description: {
        required: "Description is missing",
        maxLength: {
            value: InputValidation.maxDescriptionLength,
            message: `Description is longer than ${InputValidation.maxDescriptionLength} characters`
        }
    },
    amount: {
        required: "Amount is missing",
        min: {
            value: 0.0,
            message: "Amount can't be negative"
        },
        max: {
            value: InputValidation.maxNumber,
            message: "Amount is too big"
        }
    },
    notes: {
        maxLength: {
            value: InputValidation.maxNotesLength,
            message: `Notes is longer than ${InputValidation.maxNotesLength} characters`
        }
    },
    date: (getValues: ReactHookFormGetValueFunction) => ({
        validate: {
            required: (date: string) =>
                (getValues<DateOption>("dateOption") === DateOption.oneOff && !!date) ||
                // Note: We use "Date" instead of "Start date" because "Start date" causes wrapping
                // in the UI.
                "Date is missing",
            valid: (date: string) =>
                DateService.isValidDate(new Date(date)) || "Date is not a valid date"
        }
    }),
    recurringDate: {
        interval: (getValues: ReactHookFormGetValueFunction) => ({
            ...integerRules,
            validate: {
                required: (value: number) =>
                    (isRecurringDate(getValues) && !!value) || "Interval is missing"
            }
        }),
        frequency: (getValues: ReactHookFormGetValueFunction) => ({
            validate: {
                required: (value: string) =>
                    (isRecurringDate(getValues) && !!value) || "Frequency is missing"
            }
        }),
        onWeekday: (getValues: ReactHookFormGetValueFunction) => ({
            validate: {
                required: (value: string) =>
                    (isRecurringDate(getValues) &&
                        !!value &&
                        getValues("freq") === RecurringTransaction.FREQUENCIES.weekly) ||
                    "Weekday is missing"
            }
        }),
        onMonthday: (getValues: ReactHookFormGetValueFunction) => ({
            validate: {
                required: (value: string) =>
                    (isRecurringDate(getValues) &&
                        !!value &&
                        getValues("freq") === RecurringTransaction.FREQUENCIES.monthly) ||
                    "Day is missing"
            }
        }),
        onYearMonth: (getValues: ReactHookFormGetValueFunction) => ({
            validate: {
                required: (value: string) =>
                    (isRecurringDate(getValues) &&
                        !!value &&
                        getValues("freq") === RecurringTransaction.FREQUENCIES.yearly) ||
                    "Month is missing"
            }
        }),
        onYearDay: (getValues: ReactHookFormGetValueFunction) => ({
            validate: {
                required: (value: string) =>
                    (isRecurringDate(getValues) &&
                        !!value &&
                        getValues("freq") === RecurringTransaction.FREQUENCIES.yearly) ||
                    "Day is missing"
            }
        }),
        startDate: (getValues: ReactHookFormGetValueFunction) => ({
            validate: {
                required: (value: string) =>
                    (isRecurringDate(getValues) && !!value) || "Date is missing",
                valid: (date: string) =>
                    DateService.isValidDate(new Date(date)) || "Date is not valid"
            }
        }),
        endCondition: (getValues: ReactHookFormGetValueFunction) => ({
            validate: {
                required: (value: string) =>
                    (isRecurringDate(getValues) && !!value) || "End condition is missing"
            }
        }),
        endDate: (getValues: ReactHookFormGetValueFunction) => ({
            validate: {
                required: (date: string) =>
                    (isRecurringDate(getValues) &&
                        !!date &&
                        getValues("endCondition") === RecurringTransaction.END_CONDITIONS.on) ||
                    "End date is missing",
                isAfterStartDate: (date: string) =>
                    !DateService.isLessThan(date, getValues("startDate")) ||
                    "End date is before start date"
            }
        }),
        count: (getValues: ReactHookFormGetValueFunction) => ({
            ...integerRules,
            validate: {
                required: (value: number) =>
                    (isRecurringDate(getValues) &&
                        !!value &&
                        getValues("endCondition") === RecurringTransaction.END_CONDITIONS.after) ||
                    "Count is missing"
            }
        })
    },
    createAccountRules: (
        accountOptions: Array<SuggestionOption>,
        getValues: ReactHookFormGetValueFunction
    ) => ({
        // Note: One thing this doesn't validate for is whether or not the two account inputs
        // have different values. This is only really relevant for Transfer transactions.
        //
        // However, this validation does happen as part of the transaction creation sagas,
        // so if the user _does_ use specify the same account for both inputs, it'll be
        // caught there.
        //
        // I think it's fine that that's handled separately, since it should be a relatively
        // rare occurrence, and trying to hack these input validation rules to support
        // working with other form fields is... not the greatest.
        validate: {
            // Note: We can't use the regular 'required' validation, because the account
            // 'value' is always an object, which would thus always evaluate to 'true',
            // thus always being 'present'.
            // We need to manually check that the input value exists.
            required: (value: SuggestionOption) => !!value.label || "Account is missing",
            valid: (value: SuggestionOption) =>
                validateAccount(value, accountOptions) || "Account is not a valid account",
            notDuplicate: () =>
                (getValues("creditAccount") as SuggestionOption)?.value !==
                    (getValues("debitAccount") as SuggestionOption)?.value ||
                "Account can't be the same"
        }
    })
};

/* Helper Functions */

/** Validates that the value of an account input is a real account. */
const validateAccount = (option: SuggestionOption, accountOptions: Array<SuggestionOption>) => {
    // When the label and value aren't the same, that means the user picked an option.
    if (option.label !== option.value) {
        // Make sure the system somehow hasn't been cheesed by ensuring the option exists.
        return accountOptions.filter(({value}) => option.value === value).length > 0;
    } else {
        // This accounts for the case where the user types the whole account name in,
        // without picking it from the options. If they type the whole label in,
        // then it should be valid as long as it matches an account.
        const matchingAccount = accountOptions.filter(
            ({label}) =>
                SearchService.cleanString(option.label) === SearchService.cleanString(label)
        );

        return matchingAccount.length > 0;
    }
};
