import {
    sharedSelectors,
    transactionHelpers,
    DerivedAppScreenUrls,
    DerivedAppModalUrls,
    GlobalAddButton,
    TransactionForm,
    ValueFormatting
} from "../support";
import {Viewport} from "../support/types";

const {
    existingTransaction,
    firstTransaction,
    newTransaction,
    allTimeTransactions,
    transactionExists
} = transactionHelpers;

describe("Transaction Form - Creation", () => {
    const creationTests = (viewport: Viewport) => {
        const baseBeforeEach = () => {
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.TRANSACTIONS);

            cy.changeViewport(viewport);

            allTimeTransactions(viewport);

            GlobalAddButton.addTransaction(viewport);
        };

        describe("Tests with Database", () => {
            before(() => {
                cy.resetDb();
            });

            beforeEach(() => {
                cy.resetDb();
                baseBeforeEach();
            });

            const createAndMakeAnother = ({withKeyboardShortcut = false} = {}) => {
                // Enter the transaction's details.
                TransactionForm.enterFormData(newTransaction);

                // Create the transaction and make another.
                if (withKeyboardShortcut) {
                    TransactionForm.createAndMakeAnotherKeyboardShortcut();
                } else {
                    TransactionForm.createAndMakeAnother();
                }

                // Ensure the form wasn't closed.
                cy.url().should("include", DerivedAppModalUrls.TRANSACTION_FORM);

                // Enter the transaction's details.
                const anotherTransaction = {
                    ...newTransaction,
                    description: "Another Transaction",
                    amount: "543.21"
                };

                TransactionForm.enterFormData(anotherTransaction, false);

                // Create this transaction normally.
                TransactionForm.createTransaction();

                // Check that the transactions were created.
                transactionExists(newTransaction);
                transactionExists(anotherTransaction);
            };

            it("can create a new transaction", () => {
                // Enter the transaction's details.
                TransactionForm.enterFormData(newTransaction);

                // Create the transaction.
                TransactionForm.createTransaction();

                // Check that the transaction was created.
                transactionExists(newTransaction);
            });

            it("can create multiple transactions without the form closing", () => {
                createAndMakeAnother();
            });

            it("can create multiple transactions using the Ctrl+Enter shortcut", () => {
                createAndMakeAnother({withKeyboardShortcut: true});
            });
        });

        describe("Test without Database", () => {
            beforeEach(() => {
                baseBeforeEach();
            });

            it("can close the form without creating a transaction", () => {
                // Close the form.
                TransactionForm.closeForm();

                // Ensure the form was closed.
                cy.url().should("not.include", DerivedAppModalUrls.TRANSACTION_FORM);
            });

            it("shows error messages when the inputs are empty", () => {
                // Try creating transaction.
                TransactionForm.createTransaction();

                // Should still be on the form.
                cy.url().should("include", DerivedAppModalUrls.TRANSACTION_FORM);

                // Should find error messages on the inputs.
                TransactionForm.form().contains("Description is missing").should("exist");
                TransactionForm.form().contains("Amount is missing").should("exist");
                TransactionForm.form().contains("Income Account is missing").should("exist");
                TransactionForm.form().contains("Asset Account is missing").should("exist");
            });

            it("clears the account inputs when changing type", () => {
                // Enter the transaction's details.
                TransactionForm.enterFormData(newTransaction);

                // Change the type.
                TransactionForm.typePickerInput().contains("Income").click();

                // Account inputs should be empty.
                TransactionForm.creditAccountInput().should("have.value", "");
                TransactionForm.debitAccountInput().should("have.value", "");
            });

            it("can autofill the form based on an existing transaction", () => {
                // Type in part of an existing transaction's description.
                TransactionForm.descriptionInput().type("money");

                // Click the autocomplete suggestion.
                TransactionForm.form().contains(existingTransaction.description).click();

                // Check that all of the inputs match.
                TransactionForm.checkFormData(existingTransaction);
            });

            it("can autocomplete the accounts by picking a suggestion", () => {
                // Type the first part of 'Salary', for the Income account.
                TransactionForm.creditAccountInput().type("sal");

                // Pick the account from the suggestions.
                TransactionForm.form().contains("Salary").click();

                // Expect the input to now have the full value.
                TransactionForm.creditAccountInput().should("have.value", "Salary");

                // Repeat for the debit account input (which would be the Asset account).
                TransactionForm.debitAccountInput().type("che");
                TransactionForm.form().contains("Chequing").click();
                TransactionForm.debitAccountInput().should("have.value", "Chequing");
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

describe("Transaction Form - Editing", () => {
    const editingTests = (viewport: Viewport) => {
        const baseBeforeEach = () => {
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.TRANSACTIONS);

            cy.changeViewport(viewport);

            allTimeTransactions(viewport);
            openEditForm(viewport);
        };

        const openEditForm = (viewport: Viewport) => {
            if (viewport === "mobile") {
                // Need to open the actions on mobile.
                cy.get(sharedSelectors.transactions.mobile.actionOverflow).first().click();
            }

            // We're only gonna bother editing the first transaction.
            cy.get(sharedSelectors.transactions[viewport].actionEdit).first().click();

            cy.url().should(
                "include",
                `${DerivedAppModalUrls.TRANSACTION_FORM}/${firstTransaction.id}`
            );
        };

        describe("Tests with Database", () => {
            beforeEach(() => {
                cy.resetDb();
                baseBeforeEach();
            });

            it("can edit all of a transaction's data", () => {
                TransactionForm.enterFormData(newTransaction, true, true);
                TransactionForm.updateTransaction();

                cy.url().should("include", DerivedAppScreenUrls.TRANSACTIONS);
                transactionExists(newTransaction);
            });

            // As identified in UFC-397, if you autofill a transaction while editing,
            // it used to override the date with the current date. Now it shouldn't.
            it("can autofill a transaction while editing without it changing the date", () => {
                // Type in just part of the existing transaction's description.
                const description = firstTransaction.description;
                TransactionForm.descriptionInput()
                    .clear()
                    .type(description.slice(0, description.length - 3));

                // Select the autofill option and update the transaction.
                TransactionForm.form().contains(description).click();
                TransactionForm.updateTransaction();

                // Expect that we find the transaction's original date.
                cy.contains(ValueFormatting.formatDate(firstTransaction.date)).should("exist");
            });

            // UFC-431 Original Bug: When moving a transaction between accounts, the `transactionIds`
            // for the accounts were not updated. As a result, deleting an account after updating a
            // transaction to no longer have said account would incorrectly cause the transaction to
            // be deleted.
            //
            // This normally wasn't a problem since `transactionIds` would get updated correctly once
            // the page was refreshed and all the data re-fetched, but this bug would happen if the
            // user deletes the account after updating the transaction in the same page session.
            it("can move a transaction between accounts", () => {
                const newDescription = "New Test Transaction 123";

                /// 1. Change one of the accounts on the transaction. Old expense account is "Food".
                TransactionForm.debitAccountInput().clear();

                TransactionForm.enterFormData({description: newDescription, debitAccount: "Tech"});
                TransactionForm.updateTransaction();
                cy.contains(newDescription).should("exist");

                /// 2. Delete the old account.
                cy.visit(DerivedAppScreenUrls.ACCOUNTS);

                cy.get(sharedSelectors.accounts[viewport].accountsList).as("list");

                // Make sure that the account exists.
                cy.get("@list").contains("Food").should("exist");

                if (viewport === "mobile") {
                    // Need to open the actions on mobile.
                    cy.get("@list")
                        .find(sharedSelectors.accounts.list.actionOverflow)
                        .eq(6)
                        .click();
                }

                // Open the deletion dialog and delete teh account.
                cy.get("@list").find(sharedSelectors.accounts.list.actionDelete).eq(6).click();
                cy.get("[data-testid=account-deletion-dialog]").as("accountDeletionDialog");
                cy.get("@accountDeletionDialog")
                    .find(sharedSelectors.dialogs.primaryAction)
                    .click();

                // Account shouldn't be in list anymore.
                cy.get("@list").contains("Food").should("not.exist");

                /// 3. The transaction should still exist.
                cy.visit(DerivedAppScreenUrls.TRANSACTIONS);
                allTimeTransactions(viewport);
                cy.contains(newDescription).should("exist");
            });
        });

        describe("Test without Database", () => {
            before(() => {
                cy.resetDb();
            });

            beforeEach(() => {
                baseBeforeEach();
            });

            it("can close the form without editing", () => {
                // Click the close button.
                TransactionForm.closeForm();

                // Make sure we're back to the Transactions page.
                cy.url().should("not.include", DerivedAppModalUrls.TRANSACTION_FORM);
            });

            it("has removed the 'Recurring' date option", () => {
                TransactionForm.form().contains("Recurring").should("not.exist");
            });

            it("has removed the Make Another button", () => {
                TransactionForm.form().contains("Make Another").should("not.exist");
            });

            it("shows a message/button to New Transaction when editing an invalid transaction", () => {
                cy.visit(`${DerivedAppModalUrls.TRANSACTION_FORM}/abc123`);

                // Make sure the title is still for editing a transaction.
                cy.contains("Edit Transaction").should("exist");

                // Make sure there's a helpful message to tell the user what's going on.
                cy.contains("Hmm, doesn't seem like there's a transaction here.").should("exist");

                // Make sure the user can go to the New Transaction form.
                cy.contains("New Transaction").click();

                // Make sure we're not editing anymore.
                cy.url().should(
                    "eq",
                    Cypress.config().baseUrl + DerivedAppModalUrls.TRANSACTION_FORM
                );
            });

            it("does not have the Ctrl+Enter shortcut (for Create and Make Another) enabled", () => {
                TransactionForm.createAndMakeAnotherKeyboardShortcut();
                TransactionForm.updateTransaction();

                cy.get(sharedSelectors.transactions[viewport].view)
                    .findAllByText(firstTransaction.description)
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
