import {
    helpers,
    seedData,
    sharedSelectors,
    testData,
    transactionsImport,
    AccountForm,
    AppNavigation,
    GlobalAddButton,
    ImportRuleForm,
    TransactionForm
} from "../support";
import {Viewport} from "../support/types";

const {createNewRule, ruleExists} = helpers;
const {firstAccount, firstLiability} = seedData;
const {ACCOUNTS} = seedData;

const {
    AdjustTransactionsStep,
    ChooseAccountStep,
    ChooseFileStep,
    MapCsvStep,
    Navigation,
    SummaryStep,
    baseBeforeEach,
    firstSteps,
    finalSteps,
    gotoCSVImport,
    numberOfFileTransactions,
    verifyBulkTransactionsProperty,
    verifyTransactionsImported
} = transactionsImport;

// These things are for the import rules.

const salaryAccount = ACCOUNTS.find(({name}) => name === "Salary")!;
const techAccount = ACCOUNTS.find(({name}) => name === "Tech")!;

const payrollRule = {
    actions: [
        {property: "account", value: salaryAccount.id},
        {property: "description", value: "Got paid salary"},
        {property: "type", value: "income"}
    ],
    // Use "payr" so that we can check for "Payroll" when rules are disabled.
    // But can't use "pay" because of "Bill Payment".
    conditions: [{condition: "contains", property: "description", value: "payr"}]
};

const billRule = {
    actions: [
        {property: "account", value: techAccount.id},
        {property: "description", value: "Phone bill"},
        {property: "type", value: "expense"}
    ],
    conditions: [{condition: "contains", property: "account", value: "bell"}]
};

const ruleForInvalidTransaction = {
    actions: [
        {property: "account", value: techAccount.id},
        {property: "description", value: "Got paid salary"},
        {property: "type", value: "expense"}
    ],
    conditions: [{condition: "contains", property: "description", value: "payroll"}]
};

describe("Full Import Process", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            baseBeforeEach(viewport);
        });

        it("can import transactions from a CSV file to an asset account", () => {
            // First step: choose an account.
            ChooseAccountStep.fillOut();
            Navigation.goNextStep(viewport);

            // Second step: upload file.
            ChooseFileStep.fillOut();
            Navigation.goNextStep(viewport);

            // Third step: choose an existing import profile.
            MapCsvStep.existingProfile.useExistingProfile();
            Navigation.goNextStep(viewport);

            // Fourth step: adjust the transactions.
            AdjustTransactionsStep.fillOutForAsset(viewport);
            Navigation.goNextStep(viewport);

            // Fifth step: confirm the summary and import the transactions.
            SummaryStep.checkStats(viewport);
            Navigation.goNextStep(viewport);

            // Make sure the transactions exist.
            verifyTransactionsImported(viewport);
        });

        it("can import transactions from a CSV file to a liability account", () => {
            // First step: choose an account.
            ChooseAccountStep.fillOut(firstLiability);
            Navigation.goNextStep(viewport);

            // Second step: upload file.
            ChooseFileStep.fillOut();
            Navigation.goNextStep(viewport);

            // Third step: choose an existing import profile.
            MapCsvStep.existingProfile.useExistingProfile();
            Navigation.goNextStep(viewport);

            // Fourth step: adjust the transactions.
            AdjustTransactionsStep.fillOutForLiability(viewport);
            Navigation.goNextStep(viewport);

            // Fifth step: confirm the summary and import the transactions.
            SummaryStep.checkStats(viewport, {
                accountName: firstLiability.name,
                balanceChange: "$3,650.50"
            });

            Navigation.goNextStep(viewport);

            // Make sure the transactions exist.
            verifyTransactionsImported(viewport);
        });

        it("can create a new import profile", () => {
            // First step: choose an account.
            ChooseAccountStep.fillOut(firstAccount);
            Navigation.goNextStep(viewport);

            // Second step: upload file.
            ChooseFileStep.fillOut();
            Navigation.goNextStep(viewport);

            // Third step: create a new import profile.
            MapCsvStep.switchToNewTab();
            MapCsvStep.newProfile.fillOutNewProfile("test 123", viewport);

            Navigation.goNextStep(viewport);
            MapCsvStep.newProfile.successToastExists("test 123");

            // Fourth step: adjust the transactions.
            AdjustTransactionsStep.fillOutForAsset(viewport);
            Navigation.goNextStep(viewport);

            // Fifth step: confirm the summary and import the transactions.
            SummaryStep.checkStats(viewport, {profileName: "test 123"});

            Navigation.goNextStep(viewport);

            // Make sure the transactions exist.
            verifyTransactionsImported(viewport);
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Back Button", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            baseBeforeEach(viewport);
        });

        it("can go back to previous steps", () => {
            // Go through the first steps.
            firstSteps(viewport);

            // Go back through all of the steps.
            // Being able to complete the import process after going back through all the steps
            // should prove that the back button works.
            Navigation.goBackStep(viewport);
            Navigation.goBackStep(viewport);
            Navigation.goBackStep(viewport);

            // Do it all again.
            firstSteps(viewport);

            // Should be able to finish the import process.
            Navigation.goNextStep(viewport);
            finalSteps(viewport);
            verifyTransactionsImported(viewport);
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Import Rules", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            baseBeforeEach(viewport);

            // Create the one rule that we'll be testing with.
            createNewRule(payrollRule);

            gotoCSVImport(viewport);
            firstSteps(viewport);

            AdjustTransactionsStep.openActiveRules();
        });

        it("can view the active import rules", () => {
            ruleExists(viewport, payrollRule);
        });

        it("can add a rule", () => {
            AdjustTransactionsStep.openImportForm();

            ImportRuleForm.enterFormData(billRule);
            ImportRuleForm.createRule();

            ruleExists(viewport, billRule);
        });

        it("shows a toast when a rule is added that isn't active", () => {
            AdjustTransactionsStep.openImportForm();

            ImportRuleForm.enterFormData(testData.newRule);
            ImportRuleForm.createRule();

            cy.get(sharedSelectors.toastMessages).contains("Rule not Active").should("exist");
        });

        it("can't delete a rule", () => {
            if (viewport === "mobile") {
                // Need to open the actions on mobile.
                cy.get(sharedSelectors.importRules.mobile.actionOverflow).first().click();
            }

            cy.get(sharedSelectors.importRules[viewport].actionDelete).should("not.exist");
        });

        it("can apply the import rules", () => {
            // If the payrollRule was applied correctly, then the description should be changed.
            cy.contains("Payroll").should("not.exist");
        });

        it("can disable rules", () => {
            AdjustTransactionsStep.toggleRuleEnablement();

            cy.contains("Payroll").should("exist");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Validation", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            baseBeforeEach(viewport);

            gotoCSVImport(viewport);
            firstSteps(viewport, {fillOut: false});
        });

        it("doesn't let you create a transaction with an invalid mix of accounts", () => {
            // By toggling the rules and taking advantage of the two saved states for a given
            // transaction, we can manipulate it so that it ends up with an invalid mix of accounts.

            // Create a rule that changes type.
            AdjustTransactionsStep.openActiveRules();
            AdjustTransactionsStep.openImportForm();

            ImportRuleForm.enterFormData(ruleForInvalidTransaction);
            ImportRuleForm.createRule();

            // Manually change the account so that the change is synced between the two states.
            AdjustTransactionsStep.selectTransaction(0, viewport);
            AdjustTransactionsStep.changeAccount("Food", viewport);

            // Disable the rules. We should now have an Income transaction with an Expense account.
            AdjustTransactionsStep.toggleRuleEnablement();

            // Set an Income account on the transaction.
            AdjustTransactionsStep.selectTransaction(0, viewport);
            AdjustTransactionsStep.changeAccount("Salary", viewport);

            // The user should now be shown an error message that the transaction is invalid
            // because is has an invalid mix of accounts.
            Navigation.goNextStep(viewport);
            cy.contains("has an invalid mix of accounts");
        });

        it("shows an error message when clicking on the disabled Next button", () => {
            // Because of the loading spinner on the 3rd step, need to wait a bit longer here before
            // trying to click the Next button, else it'll think that the previous step's footer
            // is still in the DOM.
            cy.wait(2000);

            Navigation.goNextStep(viewport);

            // Make sure we're still on the Adjust Transactions step.
            cy.contains("Do these transactions look right?");

            // Make sure we can see the error message.
            cy.contains("is missing an account");
        });

        it("highlights the transaction that is invalid", () => {
            // See above for wait explanation.
            cy.wait(2000);

            Navigation.goNextStep(viewport);

            cy.get(sharedSelectors.transactions[viewport].item).should(
                "have.attr",
                "aria-invalid",
                "true"
            );
        });

        it("can't delete a transaction that is being imported", () => {
            if (viewport === "mobile") {
                // Need to open the actions on mobile.
                cy.get(sharedSelectors.transactions.mobile.actionOverflow).first().click();
            }

            cy.get(sharedSelectors.transactions[viewport].actionDelete).should("not.exist");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("New Import Profile after Sign Up", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.resetDb();
            cy.changeViewport(viewport);

            cy.signUp({skipOnboarding: false});

            // Gotta go through onboarding so that we have an account we can import to.
            cy.contains("Let's go!").click();
            Navigation.goNextStep(viewport);
            Navigation.goNextStep(viewport);
            Navigation.goNextStep(viewport);
            Navigation.goNextStep(viewport);
            Navigation.goNextStep(viewport);

            gotoCSVImport(viewport);
        });

        it("can create a new import profile and complete import", () => {
            // First step: choose an account.
            ChooseAccountStep.fillOut(firstAccount);
            Navigation.goNextStep(viewport);

            // Second step: upload file.
            ChooseFileStep.fillOut();
            Navigation.goNextStep(viewport);

            // Third step: create a new import profile.
            MapCsvStep.newProfile.fillOutNewProfile("test 123", viewport);

            Navigation.goNextStep(viewport);
            MapCsvStep.newProfile.successToastExists("test 123");

            // Fourth step: adjust the transactions.
            // We have a Groceries account in the default onboarding accounts but not a Food one.
            AdjustTransactionsStep.fillOutForAsset(viewport, {expenseAccount: "Groceries"});
            Navigation.goNextStep(viewport);

            // Fifth step: confirm the summary and import the transactions.
            SummaryStep.checkStats(viewport, {profileName: "test 123"});

            Navigation.goNextStep(viewport);

            // Make sure the transactions exist.
            verifyTransactionsImported(viewport);
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Bulk Transaction Changes", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            baseBeforeEach(viewport);
            firstSteps(viewport);
        });

        it("can bulk change the descriptions", () => {
            const newDescription = "testing testing 123";

            // Change all the descriptions.
            AdjustTransactionsStep.selectAllTransactions();
            AdjustTransactionsStep.changeDescription(newDescription, viewport);

            Navigation.goNextStep(viewport);

            // Finish import.
            finalSteps(viewport);

            // Make sure the transactions with the description exist.
            verifyBulkTransactionsProperty(viewport, newDescription, numberOfFileTransactions);
        });

        it("can bulk change the amounts", () => {
            const newAmount = "758.18";

            // Change all the amounts.
            AdjustTransactionsStep.selectAllTransactions();
            AdjustTransactionsStep.changeAmount(newAmount, viewport);

            Navigation.goNextStep(viewport);

            // Finish import.
            finalSteps(viewport, {balanceChange: "-$1,516.36"});

            // Make sure the transactions with the amount exist.
            verifyBulkTransactionsProperty(viewport, newAmount, numberOfFileTransactions);
        });

        it("can bulk change the dates", () => {
            // Note: We're using a date that is in the past so that we can ensure a consistent format
            // when looking for the final dates on the imported transactions.
            const rawDate = "2019-08-01";
            const newDate = "Aug 1, 2019";

            // Change all the dates.
            AdjustTransactionsStep.selectAllTransactions();
            AdjustTransactionsStep.changeDate(rawDate, viewport);

            Navigation.goNextStep(viewport);

            // Finish import.
            finalSteps(viewport);

            // Make sure the transactions with the date exist.
            if (viewport === "desktop") {
                verifyBulkTransactionsProperty(viewport, newDate, numberOfFileTransactions);
            } else {
                // Because dates on mobile are just headers, there should only be 1 header.
                verifyBulkTransactionsProperty(viewport, newDate, 1, {useView: true});
            }
        });

        it("can bulk change the types", () => {
            // Change some of the types.
            // We're changing the 2 income transactions to expenses, to match the other 4 expenses.
            AdjustTransactionsStep.selectTransactions([0, 2], viewport);
            AdjustTransactionsStep.changeType("Expense", viewport);

            // Have to fill the account out again.
            AdjustTransactionsStep.selectTransactions([0, 2], viewport);
            AdjustTransactionsStep.changeAccount(
                seedData.accountsByType["expense"][0].name,
                viewport
            );

            Navigation.goNextStep(viewport);

            // Finish import.
            finalSteps(viewport, {balanceChange: "-$3,650.50"});

            // Make sure the transactions with the type exist.
            verifyBulkTransactionsProperty(viewport, "expense", numberOfFileTransactions, {
                checkTypes: true
            });
        });

        it("can bulk include/exclude transactions", () => {
            // Will use this description just as a marker of which transactions were newly imported.
            const newDescription = "testing testing 123";

            // Exclude some transactions.
            AdjustTransactionsStep.selectTransactions([0, 1, 2], viewport);
            AdjustTransactionsStep.excludeFromImport(viewport);

            // Then include some again.
            AdjustTransactionsStep.selectTransactions([1], viewport);
            AdjustTransactionsStep.includeInImport(viewport);

            // Change the descriptions to act as markers.
            AdjustTransactionsStep.selectTransactions([1, 3, 4, 5], viewport);
            AdjustTransactionsStep.changeDescription(newDescription, viewport);

            Navigation.goNextStep(viewport);

            // Finish import.
            finalSteps(viewport, {
                balanceChange: "-$1,650.50",
                numberOfTransactions: numberOfFileTransactions - 2
            });

            // Make sure the transactions were excluded by checking for the new description.
            verifyBulkTransactionsProperty(viewport, newDescription, numberOfFileTransactions - 2);
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Individual Transaction Editing", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            baseBeforeEach(viewport);
            firstSteps(viewport);
        });

        it("can edit a single transaction", () => {
            const newDescription = "testing testing 123";

            // Edit the description of the first transaction.
            if (viewport === "mobile") {
                // Need to open the actions on mobile.
                cy.get(sharedSelectors.transactions.mobile.actionOverflow).first().click();
            }

            cy.get(sharedSelectors.transactions[viewport].actionEdit).first().click();

            TransactionForm.descriptionInput().type(newDescription);
            TransactionForm.updateTransaction();

            Navigation.goNextStep(viewport);

            // Finish import.
            finalSteps(viewport);

            // Make sure the edited transaction was imported.
            verifyBulkTransactionsProperty(viewport, newDescription, 1);
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Creating an Account during Import", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            baseBeforeEach(viewport);
            firstSteps(viewport);
        });

        it("can create (and use) an account during the import process", () => {
            // Used as a marker for the new account.
            const newAccountName = "new income account 123";

            // Create the new account.
            GlobalAddButton.addAccount(viewport);

            AccountForm.enterFormData({name: newAccountName, type: "Income"});
            AccountForm.createAccount();

            // Use the new account for one of the transactions.
            AdjustTransactionsStep.selectTransaction(0, viewport);
            AdjustTransactionsStep.changeAccount(newAccountName, viewport);

            Navigation.goNextStep(viewport);

            // Finish the import.
            finalSteps(viewport);

            // Make sure the new account was used properly.
            verifyBulkTransactionsProperty(viewport, newAccountName, 1);
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Sorting by From/To Account in Adjust Transactions", () => {
    // There was a bug where sorting by From/To was broken for non-standard transaction tables.
    // These tests should address those.
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            baseBeforeEach(viewport);
            firstSteps(viewport, {fillOut: false});
        });

        it("can sort by the 'From'", () => {
            // Change sorting to From ascending.
            cy.get(sharedSelectors.transactions["desktop"].tableColumnFrom).click();

            // First transaction should now have "BANK" as the account.
            cy.get(sharedSelectors.transactions["desktop"].item)
                .first()
                .contains("BANK")
                .should("exist");

            // Change sorting to To ascending.
            cy.get(sharedSelectors.transactions["desktop"].tableColumnFrom).click();

            // First transaction should now have "COMPANY" as the account.
            cy.get(sharedSelectors.transactions["desktop"].item)
                .first()
                .contains("COMPANY")
                .should("exist");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });
});

describe("Invalid File", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            baseBeforeEach(viewport);
        });

        it("displays an error message when the user provides a non-CSV file", () => {
            // First step: choose an account.
            ChooseAccountStep.fillOut();
            Navigation.goNextStep(viewport);

            // Second step: upload file.
            ChooseFileStep.fillOut({
                fileName: testData.invalidFileForImport,
                isValidFile: false
            });

            // Expect the error message.
            cy.contains(
                `Couldn't parse file; is "${testData.invalidFileForImport}" a CSV file?`
            ).should("exist");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Navigating Away", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            baseBeforeEach(viewport);
        });

        it("clears the process state, returning the user back to step 1", () => {
            // First step: choose an account.
            ChooseAccountStep.fillOut();
            Navigation.goNextStep(viewport);

            // Second step: upload file...
            ChooseFileStep.fillOut();
            Navigation.goNextStep(viewport);

            // Now navigate to somewhere else in the app (using in-app navigation).
            AppNavigation.gotoDashboard(viewport);

            // Navigate back to the Import process and we should be on the first step.
            gotoCSVImport(viewport);
            ChooseAccountStep.isOnStep();
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("All Transactions are Duplicates", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            baseBeforeEach(viewport);
        });

        it("can import transactions when all transactions are duplicates", () => {
            // Used as a marker for the duplicate transaction that will get imported twice.
            const newDescription = "testing testing 123";

            // Import the file.
            firstSteps(viewport);
            Navigation.goNextStep(viewport);
            finalSteps(viewport);

            // Head back to the import process.
            gotoCSVImport(viewport);

            // Get to the fourth step again.
            firstSteps(viewport);

            // Make sure the user knows these are duplicate transactions.
            cy.contains(
                `Looks like we found ${numberOfFileTransactions} duplicate transactions.`
            ).should("exist");

            // Include the first duplicate transaction and change its description.
            AdjustTransactionsStep.selectTransaction(0, viewport);
            AdjustTransactionsStep.includeInImport(viewport);

            AdjustTransactionsStep.selectTransaction(0, viewport);
            AdjustTransactionsStep.changeDescription(newDescription, viewport);

            Navigation.goNextStep(viewport);

            // Import the transaction.
            finalSteps(viewport, {
                balanceChange: "$1,500.00",
                numberOfTransactions: 1
            });

            // Make sure the duplicate transaction was actually imported.
            verifyBulkTransactionsProperty(viewport, newDescription, 1);
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});
