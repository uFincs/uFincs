import {DateOption, TransactionFormData as FormData} from "../../src/utils/types";
import {sharedSelectors} from "../support";

interface TransactionFormData extends Omit<FormData, "creditAccount" | "debitAccount"> {
    creditAccount: string;
    debitAccount: string;
}

const selectors = {
    form: {
        transactionForm: "[data-testid=transaction-form]",
        transactionFormCloseButton: "[data-testid=transaction-form-close-button]",
        dateOptions: "[data-testid=transaction-form-date-options]",
        inputDescription: "input[name=description]",
        inputAmount: "input[name=amount]",
        inputNotes: "input[name=notes]",
        inputDate: "input[name=date]",
        inputTypePicker: sharedSelectors.transactions.typePicker,
        inputCreditAccount: "input[name='creditAccount']",
        inputDebitAccount: "input[name='debitAccount']",
        recurring: {
            inputInterval: "input[name=interval]",
            inputFreq: "select[name=freq]",
            inputOnWeekday: "select[name=onWeekday]",
            inputOnMonthday: "select[name=onMonthday]",
            inputOnMonth: "select[name=onMonth]",
            inputOnDay: "select[name=onDay]",
            inputStartDate: "input[name=startDate]",
            inputEndCondition: "select[name=endCondition]",
            inputCount: "input[name=count]",
            inputEndDate: "input[name=endDate]"
        }
    }
};

export const TransactionForm = {
    form() {
        return cy.get(selectors.form.transactionForm);
    },
    formInput(selector: string) {
        return this.form().find(selector);
    },
    descriptionInput() {
        return this.formInput(selectors.form.inputDescription);
    },
    amountInput() {
        return this.formInput(selectors.form.inputAmount);
    },
    notesInput() {
        return this.formInput(selectors.form.inputNotes);
    },
    dateInput() {
        return this.formInput(selectors.form.inputDate);
    },
    intervalInput() {
        return this.formInput(selectors.form.recurring.inputInterval);
    },
    frequencyInput() {
        return this.formInput(selectors.form.recurring.inputFreq);
    },
    onWeekdayInput() {
        return this.formInput(selectors.form.recurring.inputOnWeekday);
    },
    onMonthdayInput() {
        return this.formInput(selectors.form.recurring.inputOnMonthday);
    },
    onMonthInput() {
        return this.formInput(selectors.form.recurring.inputOnMonth);
    },
    onDayInput() {
        return this.formInput(selectors.form.recurring.inputOnDay);
    },
    startDateInput() {
        return this.formInput(selectors.form.recurring.inputStartDate);
    },
    endConditionInput() {
        return this.formInput(selectors.form.recurring.inputEndCondition);
    },
    countInput() {
        return this.formInput(selectors.form.recurring.inputCount);
    },
    endDateInput() {
        return this.formInput(selectors.form.recurring.inputEndDate);
    },
    typePickerInput() {
        return this.formInput(selectors.form.inputTypePicker);
    },
    creditAccountInput() {
        return this.formInput(selectors.form.inputCreditAccount);
    },
    debitAccountInput() {
        return this.formInput(selectors.form.inputDebitAccount);
    },
    optionalDetails() {
        return this.form().contains("Optional details");
    },
    switchToRecurring() {
        this.formInput(selectors.form.dateOptions).contains("Recurring").click();
    },
    closeForm() {
        this.form().find(selectors.form.transactionFormCloseButton).click();
    },
    enterFormData(
        transaction: Partial<TransactionFormData>,
        openOptionalDetails: boolean = true,
        clearInputs: boolean = false
    ) {
        cy.wait(1000);

        // We only _don't_ want to 'open' the optional details when 'Making Another'
        // transaction, since it will already be open.
        if (openOptionalDetails) {
            this.optionalDetails().click();
        }

        // Need to clear the inputs when editing a transaction, since `.type()` just appends.
        if (clearInputs) {
            // Only need to clear the text inputs.
            //
            // Need to force some inputs to clear (notably, debitAccountInput) because they
            // get obscured by other elements (i.e. the autocomplete suggestions).
            // However, I'm just gonna force them all cause _why not_.
            this.descriptionInput().clear({force: true});
            this.amountInput().clear({force: true});
            this.notesInput().clear({force: true});
            this.creditAccountInput().clear({force: true});
            this.debitAccountInput().clear({force: true});
        }

        if (transaction.description !== undefined) {
            this.descriptionInput().type(transaction.description, {delay: 50});
        }

        if (transaction.amount !== undefined) {
            this.amountInput().type(transaction.amount);
        }

        if (transaction.notes) {
            this.notesInput().type(transaction.notes);
        }

        if (transaction.date) {
            this.dateInput().type(transaction.date);
        } else if (transaction.dateOption === DateOption.recurring) {
            this.switchToRecurring();

            this.intervalInput()
                .clear()
                .type(transaction.interval || "");

            this.frequencyInput().select(transaction.freq || "");

            if (transaction.freq === "weekly" && transaction.onWeekday) {
                this.onWeekdayInput().select(transaction.onWeekday);
            } else if (transaction.freq === "monthly" && transaction.onMonthday) {
                this.onMonthdayInput().select(transaction.onMonthday);
            } else if (transaction.freq === "yearly" && transaction.onMonth && transaction.onDay) {
                this.onMonthInput().select(transaction.onMonth);
                this.onDayInput().select(transaction.onDay);
            }

            this.startDateInput().type(transaction.startDate || "");
            this.endConditionInput().select(transaction.endCondition || "");

            if (transaction.endCondition === "after") {
                this.countInput()
                    .clear()
                    .type(transaction.count || "");
            } else if (transaction.endCondition === "on") {
                this.endDateInput().type(transaction.endDate || "");
            }
        }

        if (transaction.type !== undefined) {
            this.typePickerInput().contains(transaction.type).click();
        }

        // Need to force type because the suggestions from one input can obscure the other.
        if (transaction.creditAccount !== undefined) {
            this.creditAccountInput().type(transaction.creditAccount, {force: true});
        }

        if (transaction.debitAccount !== undefined) {
            this.debitAccountInput().type(transaction.debitAccount, {force: true});
        }
    },
    checkFormData(transaction: Partial<TransactionFormData>, openOptionalDetails: boolean = true) {
        this.descriptionInput().should("have.value", transaction.description);
        this.amountInput().should("have.value", transaction.amount);

        // We only _don't_ want to 'open' the optional details when 'Making Another'
        // transaction, since it will already be open.
        if (openOptionalDetails) {
            this.optionalDetails().click();
        }

        this.notesInput().should("have.value", transaction.notes);

        // Need to check the Type by checking the checked state.
        this.typePickerInput()
            .find(`[aria-label=${transaction.type}]`)
            .should("have.attr", "aria-checked", "true");

        this.dateInput().should("have.value", transaction.date);
        this.creditAccountInput().should("have.value", transaction.creditAccount);
        this.debitAccountInput().should("have.value", transaction.debitAccount);
    },
    createTransaction() {
        // Force the click because the autocomplete suggestions can 'cover' it, which throws Cypress off.
        this.form().contains("Add Transaction").click({force: true});
    },
    createAndMakeAnother() {
        // Force the click because the autocomplete suggestions can 'cover' it, which throws Cypress off.
        this.form().contains("Add & Make Another").click({force: true});
    },
    createAndMakeAnotherKeyboardShortcut() {
        this.descriptionInput().type("{ctrl}{enter}");
    },
    updateTransaction({isRecurring = false} = {}) {
        if (isRecurring) {
            // Force click because of autocomplete suggestions covering the button.
            this.form().contains("Update Recurring Transaction").click({force: true});
        } else {
            // Force click because of autocomplete suggestions covering the button.
            this.form().contains("Update Transaction").click({force: true});
        }
    }
};
