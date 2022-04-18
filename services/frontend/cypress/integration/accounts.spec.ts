import {
    seedData,
    sharedSelectors,
    AccountForm,
    AppNavigation,
    DerivedAppModalUrls,
    DerivedAppScreenUrls,
    GlobalAddButton,
    ScreenUrls
} from "../support";
import {Viewport} from "../support/types";

const {firstAccount} = seedData;

const selectors = {
    form: {
        accountForm: "[data-testid=account-form]",
        accountFormCloseButton: "[data-testid=account-form-close-button]",
        inputName: "input[name=name]",
        inputOpeningBalance: "input[name=openingBalance]",
        inputInterest: "input[name=interest]",
        typePicker: "[data-testid=account-type-picker]"
    },
    dialogs: {
        accountDeletion: "[data-testid=account-deletion-dialog]"
    }
};

const newAccount = {
    name: "New Account Name",
    openingBalance: "123.45",
    interest: "2.30",
    type: "Liability"
};

const accountExists = (viewport: Viewport, account: Partial<typeof newAccount>) => {
    const list = sharedSelectors.accounts[viewport].accountsList;

    if (account.name) {
        cy.get(list).contains(account.name).should("exist");
    }

    if (account.openingBalance) {
        cy.get(list).contains(account.openingBalance).should("exist");
    }
};

describe("Account Form - Creation", () => {
    const creationTests = (viewport: Viewport) => {
        const baseBeforeEach = () => {
            cy.loginHeadless();
            cy.visit(ScreenUrls.APP);

            cy.changeViewport(viewport);

            openForm(viewport);
        };

        const openForm = (viewport: Viewport) => {
            GlobalAddButton.addAccount(viewport);
            cy.get(selectors.form.accountForm).as("accountForm");
        };

        describe("Tests with Database", () => {
            beforeEach(() => {
                cy.resetDb();
                baseBeforeEach();
            });

            const createAndMakeAnother = ({withKeyboardShortcut = false} = {}) => {
                // Enter the account's details.
                AccountForm.enterFormData(newAccount);

                // Create the account and make another.
                if (withKeyboardShortcut) {
                    AccountForm.createAndMakeAnotherKeyboardShortcut();
                } else {
                    AccountForm.createAndMakeAnother();
                }

                // Ensure the form wasn't closed.
                cy.url().should("include", DerivedAppModalUrls.ACCOUNT_FORM);

                // Enter the account's details.
                const anotherAccount = {
                    ...newAccount,
                    name: "Another Account",
                    openingBalance: "543.21"
                };

                AccountForm.enterFormData(anotherAccount, false);

                // Create this account normally.
                AccountForm.createAccount();

                // Check that the accounts were created.
                AppNavigation.gotoAccounts(viewport);

                accountExists(viewport, newAccount);
                accountExists(viewport, anotherAccount);
            };

            it("can create a new account", () => {
                // Enter the account's details.
                AccountForm.enterFormData(newAccount);

                // Create the account.
                AccountForm.createAccount();

                // Check that the account was created.
                AppNavigation.gotoAccounts(viewport);
                accountExists(viewport, newAccount);
            });

            it("can create multiple accounts without the form closing", () => {
                createAndMakeAnother();
            });

            it("can create multiple accounts using the Ctrl+Enter shortcut", () => {
                createAndMakeAnother({withKeyboardShortcut: true});
            });
        });

        describe("Tests without Database", () => {
            beforeEach(() => {
                baseBeforeEach();
            });

            // TODO: Uncomment once we bring back Account interest.
            // it("hides the Optional Details when the account type is Income or Expense", () => {
            //     // Change the type to Income.
            //     AccountForm.typePickerInput().contains("Income").click();

            //     // Make sure Optional Details doesn't exist.
            //     AccountForm.form().contains("Optional details").should("not.exist");

            //     // Change the type to Expense.
            //     AccountForm.typePickerInput().contains("Expense").click();

            //     // Make sure Optional Details doesn't exist.
            //     AccountForm.form().contains("Optional details").should("not.exist");
            // });

            it("can close the form without creating an account", () => {
                // Close the form.
                AccountForm.form().find(selectors.form.accountFormCloseButton).click();

                // Ensure the form was closed.
                cy.url().should("eq", Cypress.config().baseUrl + ScreenUrls.APP);
            });

            it("shows error messages when the inputs are empty", () => {
                // Clear the opening balance input, since it has a default value.
                AccountForm.openingBalanceInput().clear();

                // Try creating an account.
                AccountForm.createAccount();

                // Should still be on the form.
                cy.url().should("include", DerivedAppModalUrls.ACCOUNT_FORM);

                // Should find error messages on the Name and Opening Balance inputs.
                AccountForm.form().contains("Name is missing").should("exist");
                AccountForm.form().contains("Opening Balance is missing").should("exist");
            });
        });
    };

    describe("Desktop", () => {
        creationTests("desktop");
    });

    describe("Mobile", () => {
        creationTests("mobile");
    });
});

describe("Account Form - Editing", () => {
    const editingTests = (viewport: Viewport) => {
        const baseBeforeEach = () => {
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.ACCOUNTS);

            cy.changeViewport(viewport);

            openEditForm(viewport);
        };

        const openEditForm = (viewport: Viewport) => {
            cy.get(sharedSelectors.accounts[viewport].accountsList).as("list");

            if (viewport === "mobile") {
                // Need to open the actions on mobile.
                cy.get("@list").find(sharedSelectors.accounts.list.actionOverflow).first().click();
            }

            // Need a short wait because there seems to be a race condition. Seems like opening the account
            // form before the accounts from the Backend have finished loading causes the form to close.
            // For some reason. /shrug
            cy.wait(1000);

            // We're only gonna bother editing the first account.
            cy.get("@list").find(sharedSelectors.accounts.list.actionEdit).first().click();

            cy.url().should("include", `${DerivedAppModalUrls.ACCOUNT_FORM}/${firstAccount.id}`);

            cy.get(selectors.form.accountForm).as("accountForm");
        };

        describe("Tests with Database", () => {
            beforeEach(() => {
                cy.resetDb();
                baseBeforeEach();
            });

            it("can edit an account's name", () => {
                // Appends '2' to the name of the account, since we're not clearing the input.
                AccountForm.nameInput().type("2");

                AccountForm.updateAccount();

                cy.url().should("include", DerivedAppScreenUrls.ACCOUNTS);
                accountExists(viewport, {name: `${firstAccount.name}2`});
            });

            // TODO: Uncomment once we bring back Account interest.
            // it("can edit an account's interest", () => {
            //     AccountForm.optionalDetails().click();
            //     AccountForm.interestInput().clear().type("1.234");

            //     AccountForm.updateAccount();

            //     cy.url().should("include", DerivedAppScreenUrls.ACCOUNTS);

            //     // Go to the account's details.
            //     cy.get(sharedSelectors.accounts[viewport].accountsList)
            //         .contains(firstAccount.name)
            //         .click();

            //     // Make sure the interest has changed.
            //     cy.get(selectors.chart.accountBalanceChart).contains("1.234%");
            // });
        });

        describe("Tests without Database", () => {
            before(() => {
                cy.resetDb();
            });

            beforeEach(() => {
                baseBeforeEach();
            });

            it("can close the form without editing", () => {
                // Click the close button.
                AccountForm.form().find(selectors.form.accountFormCloseButton).click();

                // Make sure we're back to the Accounts page.
                cy.url().should("include", DerivedAppScreenUrls.ACCOUNTS);
            });

            it("has the type and opening balance inputs disabled", () => {
                AccountForm.typePickerInput().should("have.attr", "aria-disabled", "true");
                AccountForm.openingBalanceInput({clear: false}).should("be.disabled");
            });

            it("has removed the Make Another button", () => {
                AccountForm.form().contains("Make Another").should("not.exist");
            });

            it("shows a message/button to New Account when editing an invalid account", () => {
                cy.visit(`${DerivedAppModalUrls.ACCOUNT_FORM}/abc123`);

                // Make sure the title is still for editing an account.
                cy.contains("Edit Account").should("exist");

                // Make sure there's a helpful message to tell the user what's going on.
                cy.contains("Hmm, doesn't seem like there's an account here.").should("exist");

                // Make sure the user can go to the New Account form.
                cy.contains("New Account").click();

                cy.url().should("eq", Cypress.config().baseUrl + DerivedAppModalUrls.ACCOUNT_FORM);
            });

            it("does not have the Ctrl+Enter shortcut (for Create and Make Another) enabled", () => {
                AccountForm.createAndMakeAnotherKeyboardShortcut();
                AccountForm.updateAccount();

                cy.get(sharedSelectors.accounts[viewport].accountsList)
                    .findAllByText(firstAccount.name)
                    .should("have.length", 1);
            });
        });
    };

    describe("Desktop", () => {
        editingTests("desktop");
    });

    describe("Mobile", () => {
        editingTests("mobile");
    });
});

describe("Account Deletion", () => {
    const deletionTests = (viewport: Viewport) => {
        const openDeletionDialog = (viewport: Viewport) => {
            cy.get(sharedSelectors.accounts[viewport].accountsList).as("list");

            // Make sure that the account exists.
            cy.get("@list").contains(firstAccount.name).should("exist");

            if (viewport === "mobile") {
                // Need to open the actions on mobile.
                cy.get("@list").find(sharedSelectors.accounts.list.actionOverflow).first().click();
            }

            // Open the deletion dialog.
            cy.get("@list").find(sharedSelectors.accounts.list.actionDelete).first().click();
            cy.get(selectors.dialogs.accountDeletion).as("accountDeletionDialog");
        };

        beforeEach(() => {
            cy.resetDb();
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.ACCOUNTS);

            cy.changeViewport(viewport);

            openDeletionDialog(viewport);
        });

        it("can delete the account", () => {
            cy.get("@accountDeletionDialog").find(sharedSelectors.dialogs.primaryAction).click();

            // Account shouldn't be in list anymore.
            cy.get("@list").contains(firstAccount.name).should("not.exist");

            // Transactions shouldn't exist anymore. Deleting the 'Cash' account
            // (the first account) should result in the "Bought some dinner" transaction being
            // deleted.
            cy.visit(DerivedAppScreenUrls.TRANSACTIONS);
            cy.selectDateRange(viewport, "All Time");
            cy.contains("Bought some dinner").should("not.exist");
        });

        it("can undo deletion of the account", () => {
            cy.get("@accountDeletionDialog").find(sharedSelectors.dialogs.primaryAction).click();

            // Undo deletion.
            cy.wait(1000); // Wait out the toast animation.
            cy.get(sharedSelectors.toastMessages).contains("Undo").click();

            // Account should now be in list.
            cy.get("@list").contains(firstAccount.name).should("exist");

            // Should get a success toast.
            cy.wait(1000); // Wait out the toast animation.
            cy.contains("Undo successful").should("exist");

            // Transactions should exist again.
            cy.visit(DerivedAppScreenUrls.TRANSACTIONS);
            cy.selectDateRange(viewport, "All Time");
            cy.contains("Bought some dinner").should("exist");
        });

        it("can cancel deleting the account", () => {
            cy.get("@accountDeletionDialog").find(sharedSelectors.dialogs.secondaryAction).click();

            // Account should still be in list.
            cy.get("@list").contains(firstAccount.name).should("exist");
        });
    };

    describe("Desktop", () => {
        deletionTests("desktop");
    });

    describe("Mobile", () => {
        deletionTests("mobile");
    });
});
