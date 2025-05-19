interface AccountFormData {
    name?: string;
    openingBalance?: string;
    interest?: string;
    type?: string;
}

const selectors = {
    form: {
        accountForm: "[data-testid=account-form]",
        accountFormCloseButton: "[data-testid=account-form-close-button]",
        inputName: "input[name=name]",
        inputOpeningBalance: "input[name=openingBalance]",
        inputInterest: "input[name=interest]",
        typePicker: "[data-testid=account-type-picker]"
    }
};

export const AccountForm = {
    form() {
        return cy.get(selectors.form.accountForm);
    },
    formInput(selector: string) {
        return this.form().find(selector);
    },
    typePickerInput() {
        return this.formInput(selectors.form.typePicker);
    },
    nameInput() {
        return this.formInput(selectors.form.inputName);
    },
    interestInput() {
        return this.formInput(selectors.form.inputInterest);
    },
    openingBalanceInput({clear = true} = {}) {
        // Because the opening balance has a default value, we need to clear it before
        // typing into it, otherwise typing will just append text to the default value.
        // We want to _not_ clear, however, when we want to just access the input itself,
        // e.g. to check if it's disabled.
        const input = this.formInput(selectors.form.inputOpeningBalance);
        return clear ? input.clear() : input;
    },
    optionalDetails() {
        return this.form().contains("Optional details");
    },
    enterFormData(account: AccountFormData, _openOptionalDetails: boolean = true) {
        if (account.type !== undefined) {
            this.typePickerInput().contains(account.type).click();
        }

        if (account.name !== undefined) {
            this.nameInput().type(account.name);
        }

        if (account.openingBalance !== undefined) {
            this.openingBalanceInput().type(account.openingBalance);
        }

        if (account.type === "Asset" || account.type === "Liability") {
            // TODO: Uncomment once we bring back Account interest.
            // if (openOptionalDetails) {
            //     this.optionalDetails().click();
            // }
            // if (account.interest !== undefined) {
            //     this.interestInput().type(account.interest);
            // }
        }
    },
    createAccount() {
        this.form().contains("Add Account").click();
    },
    createAndMakeAnother() {
        this.form().contains("Add & Make Another").click();
    },
    createAndMakeAnotherKeyboardShortcut() {
        this.nameInput().type("{ctrl}{enter}");
    },
    updateAccount() {
        this.form().contains("Update Account").click();
    }
};
