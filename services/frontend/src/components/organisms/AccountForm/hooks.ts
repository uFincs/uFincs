import {useCallback, useEffect, useRef} from "react";
import {useForm} from "react-hook-form";
import {useFormSubmissionErrorMessage} from "hooks/";
import {Account, AccountType} from "models/";
import {ValueConversion} from "services/";
import {
    ReactHookFormHandleSubmitFunction,
    ReactHookFormTriggerFunction,
    ReactHookFormRegisterFunction,
    ReactHookFormResetFunction
} from "utils/types";
import InputValidation from "values/inputValidation";
import KeyCodes from "values/keyCodes";

const submissionErrorGrammarMap = {
    name: {
        article: "a",
        subject: "name"
    },
    openingBalance: {
        article: "an",
        subject: "opening balance"
    },
    interest: {
        article: "the",
        subject: "interest"
    },
    type: {
        article: "the",
        subject: "type"
    }
} as const;

export interface AccountFormData {
    name: string;
    openingBalance: string;
    interest: string;
    type: string;
}

const defaultValues: AccountFormData = {
    name: "",
    openingBalance: "0.00",
    interest: "",
    type: Account.ASSET
};

/* Rules for the Inputs */

const inputRules = {
    name: {
        required: "Name is missing",
        maxLength: {
            value: InputValidation.maxNameLength,
            message: "Name is longer than 80 characters"
        }
    },
    openingBalance: {
        required: "Opening Balance is missing",
        max: {
            value: InputValidation.maxNumber,
            message: "Opening Balance is too big"
        }
    },
    interest: {
        max: {
            value: InputValidation.maxNumber,
            message: "Interest is too big"
        }
    }
};

/* Hooks */

/** Registers the Name input with an extra raw ref for handling focusing. */
const useRegisterNameInput =
    (
        nameRef: React.MutableRefObject<HTMLInputElement | null>,
        register: ReactHookFormRegisterFunction
    ) =>
    (e: HTMLInputElement) => {
        nameRef.current = e;
        register(e, inputRules.name);
    };

/** Hook for autofilling the form whenever the editing account changes.
 *
 *  This really only happens when the user navigates between separate editing URLs,
 *  since the first 'autofill' happens using the `defaultValues` of `useForm`. */
const useAutofillWithEditingAccount = (
    accountForEditing: Account | undefined,
    reset: ReactHookFormResetFunction<AccountFormData>
) => {
    useEffect(() => {
        if (accountForEditing) {
            reset(convertAccountToFormData(accountForEditing) as AccountFormData);
        }
    }, [accountForEditing, reset]);
};

/** Hook for generation all of the handlers that deal with form submission. */
const useSubmissionHandlers = ({
    accountForEditing,
    nameRef,
    handleSubmit,
    reset,
    trigger,
    onSubmit,
    onClose
}: {
    accountForEditing: Account | undefined;
    nameRef: React.RefObject<HTMLInputElement | null>;
    handleSubmit: ReactHookFormHandleSubmitFunction<AccountFormData>;
    reset: ReactHookFormResetFunction<AccountFormData>;
    trigger: ReactHookFormTriggerFunction;
    onSubmit: (account: Account) => void;
    onClose: () => void;
}) => {
    // This is what goes on the `onSubmit` of the form itself.
    const formOnSubmit = handleSubmit((formData: AccountFormData) => {
        onSubmit(convertFormDataToAccount(formData, accountForEditing));
        onClose();
    });

    // This is what goes on the 'Make Another' button.
    const onMakeAnother = useCallback(async () => {
        // Need to manually validate because just calling handleSubmit doesn't have any way
        // of bailing us out of not resetting.
        const valid = await trigger();

        if (valid) {
            await handleSubmit((formData: AccountFormData) => {
                onSubmit(convertFormDataToAccount(formData));
            })();

            // Clear the form.
            reset();

            // Refocus onto the name input.
            //
            // NOTE: Technically, we should want to focus onto the Type Picker, since it's the
            // first input in the form, but since it is a controlled component, I'm not aware
            // of any way of passing it a ref through the Controller.
            //
            // As such, we take the easy way out and just focus to the name input.
            nameRef?.current?.focus();
        }
    }, [nameRef, handleSubmit, reset, trigger, onSubmit]);

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

            if (!accountForEditing && e.ctrlKey && e.keyCode === KeyCodes.ENTER) {
                await onMakeAnother();
            }
        },
        [accountForEditing, onMakeAnother]
    );

    return {formOnSubmit, formOnKeyDown, onMakeAnother};
};

/** Everything needed to enable the functionality of the AccountForm. */
export const useAccountForm = (
    accountForEditing: Account | undefined,
    onSubmit: (account: Account) => void,
    onClose: () => void
) => {
    // We need a raw ref to the Name input so that we can focus it when doing 'Make Another'.
    const nameRef = useRef<HTMLInputElement | null>(null);

    // This form needs a lot more out of `react-hook-form` than your standard form.
    const {register, handleSubmit, trigger, reset, control, errors, watch} =
        useForm<AccountFormData>({defaultValues: convertAccountToFormData(accountForEditing)});

    // Need to watch the type so that we can determine whether or not to show the Optional Details.
    // Also so that we can customize the placeholder of the Name input.
    const typeInputValue = watch("type", Account.ASSET);

    // Setup input refs so that we don't have to pass out the `register` function.
    const registerNameInput = useRegisterNameInput(nameRef, register);
    const registerOpeningBalanceInput = register(inputRules.openingBalance);
    const registerInterestInput = register(inputRules.interest);

    const {formOnSubmit, formOnKeyDown, onMakeAnother} = useSubmissionHandlers({
        accountForEditing,
        nameRef,
        handleSubmit,
        reset,
        trigger,
        onSubmit,
        onClose
    });

    const submissionError = useFormSubmissionErrorMessage(errors, submissionErrorGrammarMap);

    useAutofillWithEditingAccount(accountForEditing, reset);

    return {
        control,
        errors,
        typeInputValue,
        submissionError,
        registerNameInput,
        registerOpeningBalanceInput,
        registerInterestInput,
        formOnSubmit,
        formOnKeyDown,
        onMakeAnother
    };
};

/* Helper Functions */

/** Converts the AccountFormData into an actual Account for persistence to the store. */
const convertFormDataToAccount = (
    formData: AccountFormData,
    accountForEditing: Account | undefined = undefined
) => {
    const parsedFormData = {
        name: formData.name,
        interest: parseFloat(formData.interest),
        openingBalance: parseFloat(formData.openingBalance),
        type: formData.type as AccountType
    };

    if (accountForEditing) {
        return new Account({
            id: accountForEditing.id,
            ...parsedFormData,
            // Need the transactionIds and createdAt so that they aren't wiped out
            // when the account is updated in the store.
            transactionIds: accountForEditing.transactionIds,
            createdAt: accountForEditing.createdAt
        });
    } else {
        return new Account(parsedFormData);
    }
};

/** Converts an account to formatted form data, like when transforming the edit account. */
const convertAccountToFormData = (account: Account | undefined): Partial<AccountFormData> => {
    if (!account) {
        // This is for when we're _creating_ an account, as opposed to editing one.
        return defaultValues;
    }

    const interest = ValueConversion.convertMillipercentsToPercent(account.interest).toFixed(3);

    const openingBalance = ValueConversion.convertCentsToDollars(account.openingBalance).toFixed(2);

    return {
        name: account.name,
        interest,
        openingBalance,
        type: account.type
    };
};
