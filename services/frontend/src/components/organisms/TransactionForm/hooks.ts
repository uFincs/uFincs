import React, {useCallback, useEffect, useRef} from "react";
import {useForm} from "react-hook-form";
import {useLocation} from "react-router";
import {useAccountOptions, useFormSubmissionErrorMessage} from "hooks/";
import {
    Account,
    AccountData,
    AccountType,
    ImportableTransaction,
    RecurringTransaction,
    RecurringTransactionData,
    RecurringTransactionFrequency,
    Transaction,
    TransactionType
} from "models/";
import {DateService, SearchService, ValueConversion, ValueFormatting} from "services/";
import {
    ReactHookFormHandleSubmitFunction,
    ReactHookFormTriggerFunction,
    ReactHookFormResetFunction,
    ReactHookFormSetValueFunction,
    SuggestionOption
} from "utils/types";
import KeyCodes from "values/keyCodes";
import {
    DateOption,
    defaultValues,
    hashParams,
    inputRules,
    submissionErrorGrammarMap,
    TransactionFormData
} from "values/transactionForm";

/* Hooks */

/** Hook for filling the form whenever the user picks a transaction from the Description's
 *  autocomplete suggestions. */
const useAutofillTransaction = (
    selectedTransaction: Transaction | null,
    setValue: ReactHookFormSetValueFunction
) => {
    useEffect(() => {
        if (selectedTransaction) {
            const newFormData = convertTransactionToFormData(
                selectedTransaction,
                false
            ) as TransactionFormData;

            // See the definition of `setFormData` for why we use `setValue` instead of `reset` here.
            //
            // Also, we need to set `ignoreDate` to true here so that we don't override the date
            // when autofilling a transaction over top of a transaction that is being edited.
            setFormData(newFormData, setValue, true);
        }
    }, [selectedTransaction, setValue]);
};

/** Hook for autofilling the form whenever the editing transaction changes.
 *
 *  This really only happens when the user navigates between separate editing URLs,
 *  since the first 'autofill' happens using the `defaultValues` of `useForm`. */
const useAutofillWithEditingTransaction = (
    transactionForEditing: Transaction | undefined,
    recurringTransactionForEditing: RecurringTransaction | undefined,
    setValue: ReactHookFormSetValueFunction
) => {
    useEffect(() => {
        if (transactionForEditing) {
            setFormData(
                convertTransactionToFormData(transactionForEditing, true) as TransactionFormData,
                setValue
            );
        }

        if (recurringTransactionForEditing) {
            setFormData(
                convertRecurringTransactionToFormData(
                    recurringTransactionForEditing,
                    true
                ) as TransactionFormData,
                setValue
            );
        }
    }, [recurringTransactionForEditing, transactionForEditing, setValue]);
};

/** Hook for generating the labels, errors, and options for the Credit/Debit account inputs. */
const useAccountLabelsAndOptions = (
    typeInputValue: TransactionType,
    accountsByType: Record<AccountType, Array<Account>>,
    errors: Record<string, any>,
    importAccount: Account | undefined
) => {
    const {creditAccountTypes, debitAccountTypes} =
        Transaction.determineAccountTypes(typeInputValue);

    const creditAccountLabel = formatAccountLabel(typeInputValue, creditAccountTypes, "From");
    const debitAccountLabel = formatAccountLabel(typeInputValue, debitAccountTypes, "To");

    let creditAccountOptions = useAccountOptions(creditAccountTypes, accountsByType);
    let debitAccountOptions = useAccountOptions(debitAccountTypes, accountsByType);

    // Filter the account options when the form is being used for editing transactions for the import
    // process. We want the `importAccount` (i.e. the account being imported to) to be the only option
    // for non-Transfer type transactions (see the `importAccount` prop definition for more details).
    if (
        (typeInputValue === Transaction.INCOME && importAccount?.type === Account.ASSET) ||
        (typeInputValue === Transaction.EXPENSE && importAccount?.type === Account.ASSET) ||
        (typeInputValue === Transaction.DEBT && importAccount?.type === Account.LIABILITY)
    ) {
        const optionsFilter = ({value}: {value: string}) => value === importAccount.id;

        if (creditAccountTypes.includes(importAccount?.type)) {
            creditAccountOptions = creditAccountOptions.filter(optionsFilter);
        } else if (debitAccountTypes.includes(importAccount?.type)) {
            debitAccountOptions = debitAccountOptions.filter(optionsFilter);
        }
    }

    // I believe react-hook-form's types are wrong. It seems to try
    // and map the value of the input to the errors, such that is expects
    // `errors.creditAccount.label|value.message`, even though that's
    // wrong (accessing message like normal works).
    // @ts-ignore
    const tempCreditError = errors?.creditAccount?.message;

    // @ts-ignore
    const tempDebitError = errors?.debitAccount?.message;

    // We need to add the type label to the account error message _here_, as opposed to in
    // `createAccountRules`, otherwise the type label doesn't update correctly when switching
    // between types after triggering an error. This is a workaround to avoid that.
    const creditAccountError = tempCreditError ? `${creditAccountLabel} ${tempCreditError}` : "";
    const debitAccountError = tempDebitError ? `${debitAccountLabel} ${tempDebitError}` : "";

    return {
        creditAccountLabel,
        debitAccountLabel,
        creditAccountOptions,
        debitAccountOptions,
        creditAccountError,
        debitAccountError
    };
};

/** Hook for generating the handler that clears the account inputs.
 *  Used whenever the type changes so that there aren't any invalid accounts lingering around.
 *
 *  Note: The clearing of the accounts should not be done with a useEffect on typeInputValue.
 *
 *  This is because the accounts will then be cleared when autofilling the form from the
 *  description input.
 *
 *  Therefore, the account clearing should only be done in the `onChange` handler of the
 *  `TransactionTypePicker`. */
const useClearAccounts = (setValue: ReactHookFormSetValueFunction) =>
    useCallback(() => {
        setValue("creditAccount", defaultValues.creditAccount);
        setValue("debitAccount", defaultValues.debitAccount);
    }, [setValue]);

/** Hook for generation all of the handlers that deal with form submission. */
const useSubmissionHandlers = ({
    accountsByType,
    recurringTransactionForEditing,
    transactionForEditing,
    descriptionRef,
    handleSubmit,
    reset,
    trigger,
    onSubmit,
    onSubmitRecurring,
    onClose,
    clearSelectedTransaction
}: {
    accountsByType: Record<AccountType, Array<Account>>;
    recurringTransactionForEditing: RecurringTransaction | undefined;
    transactionForEditing: Transaction | undefined;
    descriptionRef: React.RefObject<HTMLInputElement>;
    handleSubmit: ReactHookFormHandleSubmitFunction<TransactionFormData>;
    reset: ReactHookFormResetFunction<TransactionFormData>;
    trigger: ReactHookFormTriggerFunction;
    onSubmit: (transaction: Transaction) => void;
    onSubmitRecurring?: (recurringTransaction: RecurringTransaction) => void;
    onClose: () => void;
    clearSelectedTransaction: () => void;
}) => {
    const finalOnSubmit = useCallback(
        (formData: TransactionFormData) => {
            if (formData.dateOption === DateOption.oneOff) {
                onSubmit(
                    convertFormDataToTransaction(formData, accountsByType, transactionForEditing)
                );
            } else if (formData.dateOption === DateOption.recurring) {
                onSubmitRecurring?.(
                    convertFormDataToRecurringTransaction(
                        formData,
                        accountsByType,
                        recurringTransactionForEditing
                    )
                );
            }
        },
        [
            accountsByType,
            recurringTransactionForEditing,
            transactionForEditing,
            onSubmit,
            onSubmitRecurring
        ]
    );

    // This is what goes on the `onSubmit` of the form itself.
    const formOnSubmit = handleSubmit((formData: TransactionFormData) => {
        finalOnSubmit(formData);
        onClose();
    });

    // This is what goes on the 'Make Another' button.
    const onMakeAnother = useCallback(async () => {
        // Need to manually validate because just calling handleSubmit doesn't have any way
        // of bailing us out of not resetting.
        const valid = await trigger();

        if (valid) {
            await handleSubmit(finalOnSubmit)();

            // Clear any autofilled transaction from the description search.
            clearSelectedTransaction();

            // Clear the form.
            reset(defaultValues);

            // Refocus onto the description input.
            descriptionRef?.current?.focus();
        }
    }, [descriptionRef, clearSelectedTransaction, handleSubmit, reset, trigger, finalOnSubmit]);

    // This enables the form to 'Add & Make Another' when the user uses CTRL+Enter in an input.
    const formOnKeyDown = useCallback(
        async (e: React.KeyboardEvent<HTMLFormElement>) => {
            if (e.ctrlKey && e.keyCode === KeyCodes.ENTER) {
                // Disable the default (submit) event when Ctrl is pressed and Enter is the key.
                //
                // This is a workaround for Cypress seemingly allowing a "Ctrl+Enter" sequence to
                // trigger the default "Enter" handler on the form (that is, Ctrl+Enter submits the
                // form normally under Cypress).
                e.preventDefault();
            }

            if (
                !recurringTransactionForEditing &&
                !transactionForEditing &&
                e.ctrlKey &&
                e.keyCode === KeyCodes.ENTER
            ) {
                await onMakeAnother();
            }
        },
        [recurringTransactionForEditing, transactionForEditing, onMakeAnother]
    );

    return {formOnSubmit, formOnKeyDown, onMakeAnother};
};

/** Handles parsing hash values out of the URL to determine the default values for the form. */
const useDefaultFormValues = (): TransactionFormData => {
    const location = useLocation();
    const parsedHash = new URLSearchParams(location.hash.replace("#", ""));

    const recurring = parsedHash.get(hashParams.recurring);

    return {
        ...defaultValues,
        dateOption: recurring ? DateOption.recurring : DateOption.oneOff
    };
};

/** Everything needed to enable the functionality of the TransactionForm. */
export const useTransactionForm = (
    accountsByType: Record<AccountType, Array<Account>>,
    importAccount: Account | undefined,
    selectedTransaction: Transaction | null,
    recurringTransactionForEditing: RecurringTransaction | undefined,
    transactionForEditing: Transaction | undefined,
    onSubmit: (transaction: Transaction) => void,
    onClose: () => void,
    clearSelectedTransaction: () => void,
    onSubmitRecurring?: (recurringTransaction: RecurringTransaction) => void
) => {
    // We need a raw ref to the Description input so we can focus it when doing 'Make Another'.
    const descriptionRef = useRef<HTMLInputElement | null>(null);

    const defaultFormValues = useDefaultFormValues();

    // This form needs a lot more out of `react-hook-form` than your standard form.
    const formMethods = useForm<TransactionFormData>({
        defaultValues: transactionForEditing
            ? convertTransactionToFormData(transactionForEditing, true)
            : recurringTransactionForEditing
            ? convertRecurringTransactionToFormData(recurringTransactionForEditing, true)
            : defaultFormValues,

        // Because we use so many Controller components (which require manual focusing),
        // it's a pain trying to get them to focus correctly on error (i.e. I couldn't get it
        // working just right).
        //
        // As such, I'm opting to just disable the error focusing and let the user figure it out.
        shouldFocusError: false
    });

    const {register, handleSubmit, trigger, reset, control, errors, setValue, watch} = formMethods;

    // Need to watch the type so that we can determine which labels to use for the Account inputs.
    const typeInputValue = watch(
        "type",
        transactionForEditing?.type || recurringTransactionForEditing?.type || Transaction.INCOME
    ) as TransactionType;

    // Setup input refs so that we don't have to pass out the `register` function.
    const registerAmountInput = register(inputRules.amount);
    const registerNotesInput = register(inputRules.notes);

    // Create the handler for clearing the accounts that is used whenever the type changes.
    const clearAccounts = useClearAccounts(setValue);

    // Generate the labels and options for the account inputs.
    const accountLabelsAndOptions = useAccountLabelsAndOptions(
        typeInputValue,
        accountsByType,
        errors,
        importAccount
    );

    // Determine which account should have the `targetAccount` placeholder.
    // Note: Only relevant when editing importable transactions.
    const {targetAccount: targetAccountSide} =
        ImportableTransaction.determineTargetTransactionSides(typeInputValue);

    // Generate the error message for the submission button, if there is any.
    const submissionError = useFormSubmissionErrorMessage(errors, submissionErrorGrammarMap);

    // Generate the handlers for submitting the form.
    const {formOnSubmit, formOnKeyDown, onMakeAnother} = useSubmissionHandlers({
        accountsByType,
        recurringTransactionForEditing,
        transactionForEditing,
        descriptionRef,
        handleSubmit,
        trigger,
        reset,
        onSubmit,
        onSubmitRecurring,
        onClose,
        clearSelectedTransaction
    });

    // Enable the description autofill functionality.
    useAutofillTransaction(selectedTransaction, setValue);

    // Enable the editing transaction autofill functionality.
    useAutofillWithEditingTransaction(
        transactionForEditing,
        recurringTransactionForEditing,
        setValue
    );

    return {
        descriptionRef,
        control,
        errors,
        inputRules,
        submissionError,
        targetAccountSide,
        ...accountLabelsAndOptions,
        registerAmountInput,
        registerNotesInput,
        clearAccounts,
        formOnSubmit,
        formOnKeyDown,
        onMakeAnother,
        formMethods
    };
};

/* Helper Functions */

/** Converts the TransactionFormData into an actual Transaction for persistence to the store. */
const convertFormDataToTransaction = (
    formData: TransactionFormData,
    accountsByType: Record<AccountType, Array<Account>>,
    transactionForEditing: Transaction | undefined = undefined
) => {
    const type = formData.type as TransactionType;
    const {creditAccountTypes, debitAccountTypes} = Transaction.determineAccountTypes(type);

    const creditAccountId = getAccountId(
        formData.creditAccount,
        Account.mapTypesToAccounts(creditAccountTypes, accountsByType)
    );

    const debitAccountId = getAccountId(
        formData.debitAccount,
        Account.mapTypesToAccounts(debitAccountTypes, accountsByType)
    );

    const parsedFormData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        notes: formData.notes,
        date: formData.date,
        type,
        creditAccountId,
        debitAccountId
    };

    if (transactionForEditing) {
        return new Transaction({
            id: transactionForEditing.id,
            ...parsedFormData,
            // Need the createdAt so that it isn't wiped out when updated in the store.
            createdAt: transactionForEditing.createdAt,
            // Also need the recurringTransactionId so that it doesn't re-creations after editing.
            recurringTransactionId: transactionForEditing.recurringTransactionId
        });
    } else {
        return new Transaction(parsedFormData);
    }
};

/** Converts a transaction to formatted form data.
 *
 *  This happens when autofilling from an autocompleted description transaction or
 *  when editing a transaction. */
const convertTransactionToFormData = (
    transaction: Transaction | undefined | null,
    isEditing: boolean
): Partial<TransactionFormData> => {
    if (!transaction) {
        return {};
    }

    const {description, notes, type, creditAccount, debitAccount} = transaction;

    // We only want to take the transaction's date when we're editing.
    // We definitely _do not_ want to take the date when autocompleting a transaction.
    const date = isEditing
        ? DateService.convertToUTCString(transaction.date)
        : DateService.getTodayAsUTCString();

    return {
        description,
        amount: ValueConversion.convertCentsToDollars(transaction.amount).toFixed(2),
        notes,
        date,
        dateOption: DateOption.oneOff,
        type,
        creditAccount: {label: creditAccount.name as string, value: creditAccount.id as string},
        debitAccount: {label: debitAccount.name as string, value: debitAccount.id as string}
    };
};

const convertFormDataToRecurringTransaction = (
    formData: TransactionFormData,
    accountsByType: Record<AccountType, Array<Account>>,
    recurringTransactionForEditing: RecurringTransaction | undefined = undefined
) => {
    const type = formData.type as TransactionType;
    const {creditAccountTypes, debitAccountTypes} = Transaction.determineAccountTypes(type);

    const creditAccountId = getAccountId(
        formData.creditAccount,
        Account.mapTypesToAccounts(creditAccountTypes, accountsByType)
    );

    const debitAccountId = getAccountId(
        formData.debitAccount,
        Account.mapTypesToAccounts(debitAccountTypes, accountsByType)
    );

    const parsedFormData: Partial<RecurringTransactionData> = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        notes: formData.notes,
        type,
        creditAccountId,
        debitAccountId,
        interval: parseInt(formData.interval),
        freq: formData.freq as RecurringTransactionFrequency,
        startDate: formData.startDate,
        on: RecurringTransaction.parseFormFrequency(formData),
        ...RecurringTransaction.parseFormEndCondition(formData)
    };

    if (recurringTransactionForEditing) {
        return new RecurringTransaction({
            id: recurringTransactionForEditing.id,
            ...parsedFormData,
            // Need the `createdAt` so that it isn't wiped out when updated in the store.
            createdAt: recurringTransactionForEditing.createdAt
        });
    } else {
        return new RecurringTransaction(parsedFormData);
    }
};

const convertRecurringTransactionToFormData = (
    recurringTransaction: RecurringTransaction | undefined | null,
    isEditing: boolean
): Partial<TransactionFormData> => {
    if (!recurringTransaction) {
        return {};
    }

    const {description, notes, type, interval, freq, startDate, creditAccount, debitAccount} =
        recurringTransaction;

    const formData: Partial<TransactionFormData> = {
        description,
        amount: ValueConversion.convertCentsToDollars(recurringTransaction.amount).toFixed(2),
        notes,
        type,
        interval: `${interval}`,
        freq,
        dateOption: DateOption.recurring,
        startDate: isEditing
            ? DateService.convertToUTCString(startDate)
            : DateService.getTodayAsUTCString(),
        creditAccount: {label: creditAccount.name as string, value: creditAccount.id as string},
        debitAccount: {label: debitAccount.name as string, value: debitAccount.id as string},
        ...RecurringTransaction.convertFrequencyToFormData(recurringTransaction),
        ...RecurringTransaction.convertEndConditionToFormData(recurringTransaction)
    };

    return formData;
};

/** Sets the form data using `setValue`.
 *
 *  Why `setValue`? Why not `reset`, which has a much nicer interface where the entire form data
 *  can be passed in as a single argument?
 *
 *  Well, it's complicated. Basically, when using `reset` for `useAutofillTransaction`, there
 *  `reset` would cause the autofill to act slightly strangely. Sometimes, when autofilling,
 *  the form would be all filled out, but trying to submit the form would result in the Account
 *  inputs erroring out as having 'invalid' accounts.
 *
 *  It turns out that the inputs were 'invalid' because the options being passed to them were
 *  wrong: they still had 'Income' options even if the autofilled transaction was something else.
 *  As a result, the validator would correctly mark them as invalid.
 *
 *  However, the mystery was _why_ the Account options were wrong. They should be re-computed
 *  every time the type changes. Well, that's where it gets murky.
 *
 *  See, `reset` would cause the form data to all change and everything, but for _some reason_,
 *  sometimes the `typeInputValue` that was taken from `watch` _wouldn't update_ to the correct
 *  new form data; it would still return the old one. Yet _somehow_, inexplicably, the Controller
 *  wrapping the `TransactionTypePicker` _would_ return the new type value for the picker.
 *
 *  So the form would be in this ungodly state where it _visually_ looks like fine, but the
 *  underlying state is wrong.
 *
 *  Now, after some debugging, I figured out that the 'sometimes' that would cause this all to
 *  happen was when manually picking a transaction from AutocompleteInput's suggestions. That is,
 *  using the keyboard to arrow down and Enter on a suggestion or just clicking on a suggestion.
 *
 *  What _wouldn't_ cause this bug is just hitting Enter to select the first suggestion.
 *
 *  At this point, I couldn't figure out _why_ this was happening. I am currently lead to believe
 *  that there's some underlying functionality (either from react-hook-form or just for inputs
 *  in general) that's causing something to happen where the form gets an extra render to
 *  fix itself and calculate the right Account input options when hitting Enter on the input,
 *  but not when hitting Enter/clicking on an option. I have no idea.
 *
 *  So what did I do? See if there were any other ways to set the form data. Tried `setValue`.
 *  Found that using `setValue` worked.
 *
 *  So that's why we're using `setValue` instead of `reset` when autofilling the form. */
const setFormData = (
    newFormData: TransactionFormData,
    setValue: ReactHookFormSetValueFunction,
    ignoreDate = false
) => {
    const {
        description,
        amount,
        notes,
        date,
        type,
        creditAccount,
        debitAccount,
        dateOption,
        interval,
        freq,
        onWeekday,
        onMonthday,
        onMonth,
        onDay,
        startDate,
        endCondition,
        count,
        endDate
    } = newFormData;

    setValue("description", description);
    setValue("amount", amount);
    setValue("notes", notes);
    setValue("type", type);
    setValue("creditAccount", creditAccount);
    setValue("debitAccount", debitAccount);

    if (date !== undefined && !ignoreDate) {
        setValue("date", date);
    }

    if (dateOption !== undefined) {
        setValue("dateOption", dateOption);
    }

    if (interval !== undefined) {
        setValue("interval", interval);
    }

    if (freq !== undefined) {
        setValue("freq", freq);
    }

    if (onWeekday !== undefined) {
        setValue("onWeekday", onWeekday);
    }

    if (onMonthday !== undefined) {
        setValue("onMonthday", onMonthday);
    }

    if (onMonth !== undefined) {
        setValue("onMonth", onMonth);
    }

    if (onDay !== undefined) {
        setValue("onDay", onDay);
    }

    if (startDate !== undefined) {
        setValue("startDate", startDate);
    }

    if (endCondition !== undefined) {
        setValue("endCondition", endCondition);
    }

    if (count !== undefined) {
        setValue("count", count);
    }

    if (endDate !== undefined) {
        setValue("endDate", endDate);
    }
};

/** Converts the form data for the accounts into a proper account ID.
 *
 *  Really, it just handles the case where the user types out the full account name without
 *  picking the account from the autocomplete by looking up the account name in the list
 *  of accounts.
 *
 *  Note that we shouldn't (theoretically) have to worry about the account not existing
 *  because the rule validation should ensure the account exists before this function can run. */
const getAccountId = (option: SuggestionOption, accounts: Array<AccountData>) => {
    if (option.label === option.value) {
        return accounts.filter(
            ({name}) => SearchService.cleanString(option.label) === SearchService.cleanString(name)
        )[0].id;
    } else {
        return option.value;
    }
};

/** Creates the label for the Credit and Debit account inputs.  */
const formatAccountLabel = (
    transactionType: TransactionType,
    accountTypes: Array<AccountType>,
    prefix = ""
): string => {
    const typeLabel = accountTypes.map(ValueFormatting.capitalizeString).join("/");
    return transactionType === "transfer" ? `${prefix} (${typeLabel})` : typeLabel;
};
