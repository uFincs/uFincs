import {Viewport} from "./types";
import {sharedSelectors, DerivedAppModalUrls, DerivedAppScreenUrls} from "./";

export const GlobalAddButton = {
    button(viewport: Viewport) {
        return cy.get(sharedSelectors.navigation[viewport].addButton);
    },
    dropdown(viewport: Viewport) {
        return cy.get(sharedSelectors.navigation[viewport].addDropdown);
    },
    addAccount(viewport: Viewport) {
        this.button(viewport).click({force: true});
        this.dropdown(viewport).contains("Account").click();

        cy.url().should("include", DerivedAppModalUrls.ACCOUNT_FORM);
    },
    addTransaction(viewport: Viewport) {
        this.button(viewport).click({force: true});
        this.dropdown(viewport).contains("Transaction").click();

        cy.url().should("include", DerivedAppModalUrls.TRANSACTION_FORM);
    },
    importTransactions(viewport: Viewport) {
        this.button(viewport).click({force: true});
        this.dropdown(viewport).contains("Import Transactions").click();

        cy.url().should("include", DerivedAppScreenUrls.IMPORT_OVERVIEW);
    }
};
