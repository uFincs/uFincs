import classNames from "classnames";
import React, {useCallback} from "react";
import {Controller, FormProvider} from "react-hook-form";
import {Thinking} from "assets/graphics";
import {Divider, FormSectionHeader} from "components/atoms";
import {
    AutocompleteInput,
    CollapsibleSection,
    EmptyArea,
    FormContainer,
    LabelledInput,
    TransactionDateOptions,
    TransactionTypePicker,
    TransactionsAutocompleteInput
} from "components/molecules";
import {useCurrencySymbol, useTransactionsSearch} from "hooks/";
import {Transaction} from "models/";
import {DateOption} from "values/transactionForm";
import connect, {ConnectedProps} from "./connect";
import {useTransactionForm} from "./hooks";
import "./TransactionForm.scss";

export interface TransactionFormProps extends ConnectedProps {
    /** The selected transaction from the Transactions Search context state. */
    selectedTransaction: Transaction | null;

    /** Callback to clear the selected transaction in the Transactions Search context state. */
    clearSelectedTransaction: () => void;
}

/** A form for creating or editing a Transaction. */
const TransactionForm = React.memo(
    ({
        className,
        accountsByType,
        dateOptions = [DateOption.oneOff, DateOption.recurring],
        importAccount,
        isEditing,
        selectedTransaction,
        recurringTransactionForEditing,
        targetAccountPlaceholder = "Select an account",
        transactionForEditing,
        onClose,
        onSubmit,
        onSubmitRecurring,
        onNewTransaction,
        clearSelectedTransaction
    }: TransactionFormProps) => {
        const currencySymbol = useCurrencySymbol();

        const {
            descriptionRef,
            control,
            errors,
            inputRules,
            submissionError,
            creditAccountLabel,
            creditAccountOptions,
            creditAccountError,
            debitAccountLabel,
            debitAccountOptions,
            debitAccountError,
            targetAccountSide,
            registerAmountInput,
            registerNotesInput,
            clearAccounts,
            formOnSubmit,
            formOnKeyDown,
            onMakeAnother,
            formMethods
        } = useTransactionForm(
            accountsByType,
            importAccount,
            selectedTransaction,
            recurringTransactionForEditing,
            transactionForEditing,
            onSubmit,
            onClose,
            clearSelectedTransaction,
            onSubmitRecurring
        );

        const formEntityName = recurringTransactionForEditing
            ? "Recurring Transaction"
            : "Transaction";

        return isEditing && !transactionForEditing && !recurringTransactionForEditing ? (
            <FormContainer
                className={classNames("TransactionForm", className)}
                closeButtonTestId="transaction-form-close-button"
                entityName={formEntityName}
                isEditing={isEditing}
                isInvalidForm={true}
                onClose={onClose}
            >
                <InvalidTransactionForEditing onNewTransaction={onNewTransaction} />
            </FormContainer>
        ) : (
            <FormProvider {...formMethods}>
                <FormContainer
                    className={classNames("TransactionForm", className)}
                    closeButtonTestId="transaction-form-close-button"
                    data-testid="transaction-form"
                    entityName={formEntityName}
                    isEditing={isEditing}
                    submissionError={submissionError}
                    onClose={onClose}
                    onMakeAnother={onMakeAnother}
                    onSubmit={formOnSubmit}
                    onKeyDown={formOnKeyDown}
                >
                    <div className="TransactionForm-first-inputs">
                        <Controller
                            control={control}
                            name="description"
                            rules={inputRules.description}
                            render={({value, onChange}) => (
                                <TransactionsAutocompleteInput
                                    // Note: The input doesn't actually need the name property on it
                                    // to work with react-hook-form; it's just here for the Cypress tests.
                                    // Ditto with the Date, Credit and Debit account inputs.
                                    name="description"
                                    label="Description"
                                    placeholder="e.g. Bought some food"
                                    autoFocus={true}
                                    error={errors?.description?.message as string}
                                    value={value}
                                    onInputValueChange={onChange}
                                    ref={descriptionRef}
                                />
                            )}
                        />

                        <LabelledInput
                            name="amount"
                            type="number"
                            min="0.00"
                            step="0.01"
                            label="Amount"
                            placeholder="3.50"
                            prefix={currencySymbol}
                            error={errors?.amount?.message as string}
                            ref={registerAmountInput}
                        />

                        <CollapsibleSection
                            id="TransactionForm-optional-details"
                            label="Optional details"
                            openByDefault={
                                !!transactionForEditing?.notes ||
                                !!recurringTransactionForEditing?.notes
                            }
                        >
                            <LabelledInput
                                name="notes"
                                type="text"
                                label="Notes"
                                placeholder="e.g. Why you splurged for fancy ramen"
                                error={errors?.notes?.message as string}
                                ref={registerNotesInput}
                            />
                        </CollapsibleSection>

                        <div>
                            <TransactionDateOptions
                                className="TransactionForm-date-options"
                                data-testid="transaction-form-date-options"
                                options={dateOptions}
                            />

                            <Divider />
                        </div>
                    </div>

                    <Controller
                        name="type"
                        control={control}
                        render={({value, onChange}) => (
                            <TransactionTypePicker
                                id="TransactionForm-type-picker"
                                LabelComponent={TypePickerLabel}
                                value={value}
                                onChange={(type) => {
                                    clearAccounts();
                                    onChange(type);
                                }}
                            />
                        )}
                    />

                    <div className="TransactionForm-account-inputs">
                        <Controller
                            name="creditAccount"
                            control={control}
                            rules={inputRules.createAccountRules(
                                creditAccountOptions,
                                formMethods.getValues
                            )}
                            render={({value, onChange}) => (
                                <AutocompleteInput
                                    className={classNames({
                                        "TransactionForm-target-account-placeholder":
                                            targetAccountPlaceholder !== "Select an account" &&
                                            targetAccountSide === "credit"
                                    })}
                                    name="creditAccount"
                                    label={`${creditAccountLabel} Account`}
                                    placeholder={
                                        targetAccountSide === "credit"
                                            ? targetAccountPlaceholder
                                            : "Select an account"
                                    }
                                    enableFiltering={true}
                                    showToggleButton={true}
                                    suggestions={creditAccountOptions}
                                    error={creditAccountError}
                                    // The value of label can end up as `undefined`. If it does, then we need
                                    // the default value to be an empty string, otherwise React will think
                                    // that, since the value prop is undefined, the input must be uncontrolled.
                                    // React then yells at us that input switched from uncontrolled to controlled,
                                    // if/when the label becomes un-undefined.
                                    value={value.label || ""}
                                    onInputValueChange={onChange}
                                />
                            )}
                        />

                        <Controller
                            name="debitAccount"
                            control={control}
                            rules={inputRules.createAccountRules(
                                debitAccountOptions,
                                formMethods.getValues
                            )}
                            render={({value, onChange}) => (
                                <AutocompleteInput
                                    className={classNames({
                                        "TransactionForm-target-account-placeholder":
                                            targetAccountPlaceholder !== "Select an account" &&
                                            targetAccountSide === "debit"
                                    })}
                                    name="debitAccount"
                                    label={`${debitAccountLabel} Account`}
                                    placeholder={
                                        targetAccountSide === "debit"
                                            ? targetAccountPlaceholder
                                            : "Select an account"
                                    }
                                    enableFiltering={true}
                                    showToggleButton={true}
                                    suggestions={debitAccountOptions}
                                    error={debitAccountError}
                                    // The value of label can end up as `undefined`. If it does, then we need
                                    // the default value to be an empty string, otherwise React will think
                                    // that, since the value prop is undefined, the input must be uncontrolled.
                                    // React then yells at us that input switched from uncontrolled to controlled,
                                    // if/when the label becomes un-undefined.
                                    value={value.label || ""}
                                    onInputValueChange={onChange}
                                />
                            )}
                        />
                    </div>
                </FormContainer>
            </FormProvider>
        );
    }
);

const WrappedTransactionForm = (
    props: Omit<TransactionFormProps, "selectedTransaction" | "clearSelectedTransaction">
) => {
    // We only access the Transactions Search context above the (memoized) TransactionForm and pass
    // down the props as a performance optimization. If we accessed the context inside the form,
    // then the entire form would re-render anytime the search query (i.e. description) value changed.
    //
    // Since description searching is a hot path, it's a worthy thing to optimize well.
    const {
        state: {selectedTransaction},
        dispatch: {setSelectedTransactionId}
    } = useTransactionsSearch();

    const clearSelectedTransaction = useCallback(
        () => setSelectedTransactionId(null),
        [setSelectedTransactionId]
    );

    return (
        <TransactionForm
            selectedTransaction={selectedTransaction}
            clearSelectedTransaction={clearSelectedTransaction}
            {...props}
        />
    );
};

export const PureComponent = WrappedTransactionForm;
export default connect(WrappedTransactionForm);

/* Other Components */

/** The label for the Type picker, basically just bound with the label text. */
const TypePickerLabel = ({className, ...props}: any) => (
    <FormSectionHeader
        className={classNames("TransactionForm-TypePickerLabel", className)}
        {...props}
    >
        What type of transaction is this?
    </FormSectionHeader>
);

interface InvalidTransactionForEditingProps {
    /** Handler for redirecting the user to the New Account form. */
    onNewTransaction: () => void;
}

/** The view to show when the user is trying to edit an invalid account.
 *  It should prompt the user to instead try creating an account. */
const InvalidTransactionForEditing = ({onNewTransaction}: InvalidTransactionForEditingProps) => (
    <EmptyArea
        className="TransactionForm-EmptyArea"
        Graphic={Thinking}
        title="This isn't a transaction?"
        message="Hmm, doesn't seem like there's a transaction here."
        subMessage="How about creating a new one instead?"
        actionLabel="New Transaction"
        onClick={onNewTransaction}
    />
);
