import {
    helpers,
    sharedSelectors,
    testData,
    DerivedAppScreenUrls,
    GlobalAddButton,
    ImportRuleForm,
    DerivedAppModalUrls
} from "../support";
import {Viewport} from "../support/types";

const {createNewRule, ruleExists} = helpers;
const {anotherRule, newRule} = testData;

describe("Import Rules Table and Sorting", () => {
    // The Import Rules Table only exists on desktop, so these tests only operate on desktop.
    beforeEach(() => {
        cy.loginHeadless();
        cy.visit(DerivedAppScreenUrls.IMPORT_OVERVIEW);

        cy.changeViewport("desktop");

        // Gotta create the rules first...
        createNewRule(anotherRule);
        createNewRule(newRule);

        cy.get(sharedSelectors.importRules.desktop.view).as("view");
    });

    it("can sort by the rule rank", () => {
        // Change the sorting to Rule. Should be ascending by default.
        cy.get(sharedSelectors.importRules.desktop.tableColumnRule).click();

        // The first transaction should now be the "anotherRule".
        cy.get(sharedSelectors.importRules.desktop.item)
            .first()
            .contains(anotherRule.conditions[0].value)
            .should("exist");

        // Change the sorting to descending.
        cy.get(sharedSelectors.importRules.desktop.tableColumnRule).click();

        // The first transaction should now be the "newRule".
        cy.get(sharedSelectors.importRules.desktop.item)
            .first()
            .contains(newRule.conditions[0].value)
            .should("exist");
    });
});

describe("Import Rule Form - Creation", () => {
    const tests = (viewport: Viewport) => {
        const baseBeforeEach = () => {
            cy.loginHeadless();
            cy.changeViewport(viewport);

            cy.visit(DerivedAppScreenUrls.DASHBOARD);
            GlobalAddButton.importTransactions(viewport);

            cy.contains("Add Rule").first().click();
        };

        describe("Tests with Database", () => {
            beforeEach(() => {
                cy.resetDb();
                baseBeforeEach();
            });

            it("can create a new import rule", () => {
                ImportRuleForm.enterFormData(newRule);
                ImportRuleForm.createRule();

                ruleExists(viewport, newRule);
            });

            it("can create multiple rules without the form closing", () => {
                // Create the first rule.
                ImportRuleForm.enterFormData(newRule);
                ImportRuleForm.createAndMakeAnother();

                // Make sure the form is still open.
                cy.url().should("include", DerivedAppModalUrls.IMPORT_RULE_FORM);

                // Create another rule.
                ImportRuleForm.enterFormData(anotherRule);
                ImportRuleForm.createRule();

                // Make sure the rules exist.
                ruleExists(viewport, newRule);
                ruleExists(viewport, anotherRule);
            });
        });

        describe("Tests without Database", () => {
            before(() => {
                cy.resetDb();
            });

            beforeEach(() => {
                baseBeforeEach();
            });

            it("can close the form without creating a rule", () => {
                ImportRuleForm.closeForm();

                cy.url().should("not.include", DerivedAppModalUrls.IMPORT_RULE_FORM);
            });

            it("shows error messages when the inputs are empty", () => {
                // Try creating a rule.
                ImportRuleForm.createRule();

                // Should still be on the form.
                cy.url().should("include", DerivedAppModalUrls.IMPORT_RULE_FORM);

                // Should find error messages.
                ImportRuleForm.form().contains("Value is required").should("exist");
            });

            it("shows a message when there are no actions", () => {
                ImportRuleForm.deleteAction();

                ImportRuleForm.form().contains("You need at least 1 action");
            });

            it("shows a message when there are no conditions", () => {
                ImportRuleForm.deleteCondition();

                ImportRuleForm.form().contains("You need at least 1 condition");
            });

            it("shows a form-level message when there are no actions", () => {
                // Need to delete all actions/conditions to have the right form-level message show up,
                // otherwise, it'll start with the missing Value message first if we only delete
                // the action.
                ImportRuleForm.deleteAction();
                ImportRuleForm.deleteCondition();

                ImportRuleForm.createRule();

                ImportRuleForm.form().contains("Rules must have at least one action");
            });

            it("shows a form-level message when there are no conditions", () => {
                // Need to fill out the action to get the right form-level message to show up.
                ImportRuleForm.deleteCondition();
                ImportRuleForm.enterActionData({property: "description", value: "test"});

                ImportRuleForm.createRule();

                ImportRuleForm.form().contains("Rules must have at least one condition");
            });

            // The following two tests are regression tests because there was one point where
            // trying to add an action/condition when there weren't any would cause an error.
            it("can add an action when there are no actions", () => {
                ImportRuleForm.deleteAction();
                ImportRuleForm.addAction();

                ImportRuleForm.actions().findAllByText("Account").should("have.length", 1);
            });

            it("can add a condition when there are no conditions", () => {
                ImportRuleForm.deleteCondition();
                ImportRuleForm.addCondition();

                ImportRuleForm.conditions().findAllByText("Account").should("have.length", 1);
            });

            it("can only add a total of 3 actions", () => {
                // Just try adding it a bunch of times.
                ImportRuleForm.addAction();
                ImportRuleForm.addAction();
                ImportRuleForm.addAction();
                ImportRuleForm.addAction();
                ImportRuleForm.addAction();
                ImportRuleForm.addAction();

                ImportRuleForm.shouldHaveNumberOfActions(3);
            });

            it("can only add a total of 2 conditions", () => {
                // Just try adding it a bunch of times.
                ImportRuleForm.addCondition();
                ImportRuleForm.addCondition();
                ImportRuleForm.addCondition();
                ImportRuleForm.addCondition();
                ImportRuleForm.addCondition();
                ImportRuleForm.addCondition();

                ImportRuleForm.shouldHaveNumberOfConditions(2);
            });
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Import Rule Form - Editing", () => {
    const tests = (viewport: Viewport) => {
        const baseBeforeEach = () => {
            cy.loginHeadless();
            cy.changeViewport(viewport);

            // Create the rule first.
            createNewRule(newRule);

            openEditForm(viewport);
        };

        const openEditForm = (viewport: Viewport) => {
            if (viewport === "mobile") {
                // Need to open the actions on mobile.
                cy.get(sharedSelectors.importRules.mobile.actionOverflow).first().click();
            }

            // We're only gonna bother editing the first transaction.
            cy.get(sharedSelectors.importRules[viewport].actionEdit).first().click();

            // Note: Because there aren't any import rules in the seed data, we don't have a known
            // ID to check the URL against.
            cy.url().should("include", DerivedAppModalUrls.IMPORT_RULE_FORM);
        };

        describe("Tests with Database", () => {
            beforeEach(() => {
                cy.resetDb();
                baseBeforeEach();
            });

            it("can edit all of a rule's data", () => {
                ImportRuleForm.enterFormData(anotherRule);
                ImportRuleForm.updateRule();

                cy.url().should("include", DerivedAppScreenUrls.IMPORT_OVERVIEW);
                ruleExists(viewport, anotherRule);
            });
        });

        describe("Tests without Database", () => {
            before(() => {
                cy.resetDb();
            });

            beforeEach(() => {
                baseBeforeEach();
            });

            it("can close the form without editing", () => {
                ImportRuleForm.closeForm();

                cy.url().should("not.include", DerivedAppModalUrls.IMPORT_RULE_FORM);
            });

            it("has removed the Make Another button", () => {
                ImportRuleForm.form().contains("Make Another").should("not.exist");
            });

            it("shows a message/button to New Rule when editing an invalid rule", () => {
                cy.visit(`${DerivedAppModalUrls.IMPORT_RULE_FORM}/abc123`);

                // Make sure the title is still for editing an import rule.
                cy.contains("Edit Import Rule").should("exist");

                // Make sure there's a helpful message to tell the user what's going on.
                cy.contains("Hmm, doesn't seem like there's an import rule here.").should("exist");

                // Make sure the user can go to the New Rule form.
                cy.contains("New Rule").click();

                // Make sure we're not editing anymore.
                cy.url().should(
                    "eq",
                    Cypress.config().baseUrl + DerivedAppModalUrls.IMPORT_RULE_FORM
                );
            });
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Import Rule Deletion", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.resetDb();
            cy.loginHeadless();
            cy.changeViewport(viewport);

            // Need to create the rule first.
            createNewRule(newRule);
        });

        const deleteRule = (viewport: Viewport) => {
            if (viewport === "mobile") {
                // Need to open the actions on mobile.
                cy.get(sharedSelectors.importRules.mobile.actionOverflow).first().click();
            }

            // We're only gonna bother deleting the first transaction.
            cy.get(sharedSelectors.importRules[viewport].actionDelete).first().click();
        };

        it("can delete the import rule", () => {
            deleteRule(viewport);

            cy.contains("Deleted import rule for").should("exist");
        });

        it("can undo deletion of the rule", () => {
            deleteRule(viewport);

            // Undo deletion.
            cy.get(sharedSelectors.toastMessages).contains("Undo").click();

            ruleExists(viewport, newRule);

            // Should get a success toast.
            cy.contains("Undo successful").should("exist");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});
