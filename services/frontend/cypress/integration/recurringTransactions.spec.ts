import {DateOption} from "../../src/utils/types";
import {
    sharedSelectors,
    DateService,
    DerivedAppScreenUrls,
    DerivedAppModalUrls,
    GlobalAddButton,
    TransactionForm,
    ValueFormatting
} from "../support";
import {Viewport} from "../support/types";

const today = DateService.getTodayDate();

export const selectors = {
    summary: {
        tabs: "[data-testid=transactions-with-summary-tabs]"
    },
    desktop: {
        view: sharedSelectors.transactions.desktop.view
    },
    mobile: {
        view: sharedSelectors.transactions.mobile.view
    }
};

const newTransaction = {
    description: "New Transaction Description",
    amount: "123.45",
    notes: "these are some notes",
    date: "2020-07-25",
    type: "Expense",
    creditAccount: "Cash",
    debitAccount: "Food"
};

// Need to use tomorrow so that transactions can't get realized today,
// causing 'future' transactions to be counted wrong.
const tomorrow = DateService.convertToUTCString(
    DateService.addDays(DateService.getTodayAsUTCString(), 1)
);

const newRecurringTransaction = {
    ...newTransaction,
    date: undefined,
    dateOption: DateOption.recurring,
    startDate: tomorrow,
    interval: "2",
    freq: "weekly",
    onWeekday: "1",
    endCondition: "after",
    count: "6"
};

const anotherNewRecurringTransaction = {
    description: "Another new recurring transaction",
    amount: "555.55",
    type: "Expense",
    creditAccount: "Chequing",
    debitAccount: "Food",
    dateOption: DateOption.recurring,
    startDate: tomorrow,
    interval: "3",
    freq: "monthly",
    onMonthday: "15",
    endCondition: "on",
    endDate: DateService.convertToUTCString(DateService.addDays(today, 15))
};

const switchToCurrentTab = () => {
    cy.get(selectors.summary.tabs).contains("Current").click();
    cy.wait(1000);
};

const switchToRecurringTab = () => {
    cy.get(selectors.summary.tabs).contains("Recurring").click();
    cy.wait(1000);
};

const transactionExists = (transaction = newTransaction, {ignoreDate = false} = {}) => {
    cy.contains(transaction.description).should("exist");
    cy.contains(transaction.amount).should("exist");
    cy.contains(transaction.creditAccount).should("exist");
    cy.contains(transaction.debitAccount).should("exist");

    if (!ignoreDate) {
        cy.contains(ValueFormatting.formatDate(transaction.date)).should("exist");
    }
};

const transactionsDontExist = (transactions: Array<{description: string}>) => {
    for (const transaction of transactions) {
        cy.get("@view").contains(transaction.description).should("not.exist");
    }
};

const createTransaction = (viewport: Viewport, transaction = newTransaction) => {
    GlobalAddButton.addTransaction(viewport);
    TransactionForm.enterFormData(transaction);
    TransactionForm.createTransaction();
};

// Because we don't have an recurring transactions in the seed data, we frequently need to
// create one before testing things that have to do with it.
const createRecurringTransaction = (
    viewport: Viewport,
    recurringTransaction = newRecurringTransaction
) => {
    GlobalAddButton.addTransaction(viewport);
    TransactionForm.enterFormData(recurringTransaction);
    TransactionForm.createTransaction();
};

const deleteRecurringTransaction = (
    viewport: Viewport,
    recurringTransaction = newRecurringTransaction
) => {
    // Make sure that the transaction exists.
    cy.contains(recurringTransaction.description).should("exist");

    if (viewport === "mobile") {
        // Need to open the actions on mobile.
        cy.get(sharedSelectors.transactions.mobile.actionOverflow).first().click();
    }

    // Delete the recurring transaction.
    cy.get(sharedSelectors.transactions[viewport].actionDelete).first().click();
};

const recurringTransactionExists = (
    recurringTransaction: Partial<
        typeof newRecurringTransaction & typeof anotherNewRecurringTransaction
    >
) => {
    const {description, amount, startDate, creditAccount, debitAccount} = recurringTransaction;

    if (description) {
        cy.contains(description).should("exist");
    }

    if (amount) {
        cy.contains(amount).should("exist");
    }

    if (startDate) {
        cy.contains(ValueFormatting.formatDate(startDate)).should("exist");
    }

    if (creditAccount) {
        cy.contains(creditAccount).should("exist");
    }

    if (debitAccount) {
        cy.contains(debitAccount).should("exist");
    }
};

describe("Recurring Transaction Form - Creation", () => {
    const creationTests = (viewport: Viewport) => {
        const baseBeforeEach = () => {
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.TRANSACTIONS);

            cy.changeViewport(viewport);

            // Change the Recurring tab so that we can check after creation.
            switchToRecurringTab();
        };

        describe("Tests with Database", () => {
            beforeEach(() => {
                cy.resetDb();
                baseBeforeEach();

                GlobalAddButton.addTransaction(viewport);
            });

            const createAndMakeAnother = ({withKeyboardShortcut = false} = {}) => {
                // Enter the transaction's details.
                TransactionForm.enterFormData(newRecurringTransaction);

                // Create the transaction and make another.
                if (withKeyboardShortcut) {
                    TransactionForm.createAndMakeAnotherKeyboardShortcut();
                } else {
                    TransactionForm.createAndMakeAnother();
                }

                // Ensure the form wasn't closed.
                cy.url().should("include", DerivedAppModalUrls.TRANSACTION_FORM);

                // Enter the transaction's details.
                const anotherRecurringTransaction = {
                    ...newRecurringTransaction,
                    description: "Another Transaction",
                    amount: "543.21"
                };

                TransactionForm.enterFormData(anotherRecurringTransaction, false);

                // Create this transaction normally.
                TransactionForm.createTransaction();

                // Check that the transactions were created.
                recurringTransactionExists(newRecurringTransaction);
                recurringTransactionExists(anotherRecurringTransaction);
            };

            it("can create a new recurring transaction", () => {
                // Enter the transaction's details.
                TransactionForm.enterFormData(newRecurringTransaction);

                // Create the transaction.
                TransactionForm.createTransaction();

                // Check that the transaction was created.
                recurringTransactionExists(newRecurringTransaction);
            });

            it("can create multiple recurring transactions without the form closing", () => {
                createAndMakeAnother();
            });

            it("can create multiple recurring transactions using the Ctrl+Enter shortcut", () => {
                createAndMakeAnother({withKeyboardShortcut: true});
            });
        });

        describe("Test without Database", () => {
            before(() => {
                cy.resetDb();
            });

            beforeEach(() => {
                baseBeforeEach();
            });

            it("shows error messages when the inputs are invalid", () => {
                GlobalAddButton.addTransaction(viewport);

                // Make sure we're creating a recurring transaction.
                TransactionForm.switchToRecurring();

                // Recurring transactions don't have any extra errors my default;
                // as such, set the inputs into an error state.
                // Let's start by clearing all the number inputs.
                TransactionForm.intervalInput().clear({force: true});
                TransactionForm.countInput().clear({force: true});

                // Try creating.
                TransactionForm.createTransaction();

                // Should still be on the form.
                cy.url().should("include", DerivedAppModalUrls.TRANSACTION_FORM);

                // Should find error messages on the inputs.
                TransactionForm.form().contains("Interval is missing").should("exist");
                TransactionForm.form().contains("Count is missing").should("exist");

                // Now let's trigger the 'end date before start date' error.
                TransactionForm.endConditionInput().select("on");

                TransactionForm.endDateInput().type(
                    DateService.convertToUTCString(DateService.subtractDays(today, 3))
                );

                // Try creating again.
                TransactionForm.createTransaction();

                // Should find the end date error.
                TransactionForm.form().contains("End date is before start date").should("exist");
            });

            it("can be opened with the Recurring option already picked", () => {
                // The Empty Area should be present and we should be able to open the form from it.
                // Opening the form from here should open the form with the Recurring option already selected.
                cy.contains("Add Recurring Transaction").click();

                // The form should now be open and the `recurring` flag should be set in the URL.
                cy.url().should(
                    "include",
                    `${DerivedAppModalUrls.TRANSACTION_FORM}#recurring=true`
                );

                // The form for the recurring date should be visible.
                cy.contains("This transaction happens").should("exist");
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

describe("Recurring Transaction Form - Editing", () => {
    const editingTests = (viewport: Viewport) => {
        const baseBeforeEach = () => {
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.TRANSACTIONS);

            cy.changeViewport(viewport);

            // Change the Recurring tab so that we can check after creation.
            switchToRecurringTab();

            // Need to create the recurring transaction that we'll be editing.
            createRecurringTransaction(viewport);

            openEditForm(viewport);
        };

        const openEditForm = (viewport: Viewport) => {
            if (viewport === "mobile") {
                // Need to open the actions on mobile.
                cy.get(sharedSelectors.transactions.mobile.actionOverflow).first().click();
            }

            // We're only gonna bother editing the first transaction.
            cy.get(sharedSelectors.transactions[viewport].actionEdit).first().click();

            cy.url().should("include", DerivedAppModalUrls.RECURRING_TRANSACTION_FORM);
        };

        describe("Tests with Database", () => {
            beforeEach(() => {
                cy.resetDb();
                baseBeforeEach();
            });

            it("can edit all of a recurring transaction's data", () => {
                TransactionForm.enterFormData(anotherNewRecurringTransaction, true, true);
                TransactionForm.updateTransaction({isRecurring: true});

                cy.url().should("include", DerivedAppScreenUrls.TRANSACTIONS);
                recurringTransactionExists(anotherNewRecurringTransaction);
            });

            it("shows 'Recurring' in the header", () => {
                cy.contains("Edit Recurring Transaction").should("exist");
            });

            it("has removed the 'One-Off' date option", () => {
                cy.contains("One-Off").should("not.exist");
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

describe("Recurring Transaction Deletion", () => {
    const deletionTests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.resetDb();
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.TRANSACTIONS);

            cy.changeViewport(viewport);

            // Change the Recurring tab.
            switchToRecurringTab();

            cy.get(selectors[viewport].view).as("view");
        });

        it("can delete the recurring transaction", () => {
            // Create the recurring transaction that we'll be deleting.
            createRecurringTransaction(viewport);

            deleteRecurringTransaction(viewport);

            // Recurring transaction shouldn't be in the view anymore.
            cy.get("@view").contains(newRecurringTransaction.description).should("not.exist");
        });

        it("can undo deletion of the recurring transaction", () => {
            // Create the recurring transaction that we'll be deleting.
            createRecurringTransaction(viewport);

            deleteRecurringTransaction(viewport);

            // Undo deletion.
            cy.get(sharedSelectors.toastMessages).contains("Undo").click();

            // Recurring transaction should now be in list.
            cy.get("@view").contains(newRecurringTransaction.description).should("exist");

            // Should get a success toast.
            cy.contains("Undo successful").should("exist");
        });

        it("doesn't cause past realized transactions to be deleted", () => {
            const startDate = DateService.convertToUTCString(DateService.subtractDays(today, 21));

            createRecurringTransaction(viewport, {...newRecurringTransaction, startDate});

            cy.setDateRangeStart(DateService.convertToUTCString(startDate));
            cy.setDateRangeEnd(DateService.convertToUTCString(today));

            // Since the start date is in the past, a transaction should have been concrete realized.
            // Make sure of it.
            switchToCurrentTab();
            transactionExists({...newRecurringTransaction, date: ""}, {ignoreDate: true});

            // Now delete the recurring transaction.
            switchToRecurringTab();
            deleteRecurringTransaction(viewport);

            // The realized transaction should still exist.
            switchToCurrentTab();
            transactionExists({...newRecurringTransaction, date: ""}, {ignoreDate: true});
        });
    };

    describe("Desktop", () => {
        deletionTests("desktop");
    });

    describe("Mobile", () => {
        deletionTests("mobile");
    });
});

describe("Virtual Transactions", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.resetDb();
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.TRANSACTIONS);

            cy.changeViewport(viewport);

            createRecurringTransaction(viewport);

            // `newRecurringTransaction` has a schedule of biweekly for 6 instances, so a year should
            // be enough to cover it all.
            cy.setDateRangeEnd(DateService.convertToUTCString(DateService.addDays(today, 365)));
        });

        const expectVirtualTransactions = (count = parseInt(newRecurringTransaction.count)) => {
            const {amount, description} = newRecurringTransaction;

            cy.findAllByText(`$${amount}`).should("have.length", count);
            cy.findAllByText(description).should("have.length", count);
        };

        it("can view virtual transactions", () => {
            expectVirtualTransactions();
        });

        it("can hide virtual transactions", () => {
            cy.toggleShowFuture();

            expectVirtualTransactions(0);
        });

        it("removes virtual transactions after deleting the recurring transaction", () => {
            // Delete the recurring transaction.
            switchToRecurringTab();
            deleteRecurringTransaction(viewport);

            // Ensure no more virtual transactions exist.
            switchToCurrentTab();
            expectVirtualTransactions(0);
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Future Transactions", () => {
    const futureTransaction = {
        ...newTransaction,
        date: DateService.convertToUTCString(DateService.addDays(today, 3))
    };

    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.resetDb();
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.TRANSACTIONS);

            cy.changeViewport(viewport);
            cy.get(selectors[viewport].view).as("view");

            createTransaction(viewport, futureTransaction);
            cy.setDateRangeEnd(DateService.convertToUTCString(DateService.addDays(today, 30)));
        });

        it("can view future transactions", () => {
            transactionExists(futureTransaction);
        });

        it("can hide future transactions", () => {
            cy.toggleShowFuture();

            transactionsDontExist([futureTransaction]);
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});
