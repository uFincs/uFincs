import {sharedSelectors, AppNavigation, ScreenUrls} from "../support";

describe("App Navigation", () => {
    beforeEach(() => {
        cy.loginHeadless();
        cy.visit(ScreenUrls.APP);

        cy.desktopViewport();
    });

    describe("Large", () => {
        it("can go to the Accounts page", () => {
            AppNavigation.gotoAccounts("desktop");
        });

        it("can go to the Transactions page", () => {
            AppNavigation.gotoTransactions("desktop");
        });

        it("can go back to the Dashboard page", () => {
            AppNavigation.gotoAccounts("desktop");
            AppNavigation.gotoDashboard("desktop");

            cy.url().should("eq", Cypress.config().baseUrl + ScreenUrls.APP);
        });

        it("can go to the Settings page", () => {
            AppNavigation.gotoSettings("desktop");
        });

        it("can click the logo to return to the Dashboard page", () => {
            cy.get(sharedSelectors.navigation.desktop.accounts).click();
            cy.get(sharedSelectors.navigation.logoLink).click();

            cy.url().should("include", ScreenUrls.APP);
        });

        it("shows the user's current net worth", () => {
            cy.get(sharedSelectors.navigation.desktop.container).as("container");

            cy.get("@container").contains("Current Net Worth").should("exist");
            cy.get("@container").contains("$9,582.01").should("exist");
        });
    });

    describe("Small", () => {
        beforeEach(() => {
            cy.mobileViewport();
        });

        it("can go to the Accounts page", () => {
            AppNavigation.gotoAccounts("mobile");
        });

        it("can go to the Transactions page", () => {
            AppNavigation.gotoTransactions("mobile");
        });

        it("can go back to the Dashboard page", () => {
            AppNavigation.gotoAccounts("mobile");
            AppNavigation.gotoDashboard("mobile");

            cy.url().should("include", ScreenUrls.APP);
        });

        it("can go back to the Settings page", () => {
            AppNavigation.gotoSettings("mobile");
        });
    });
});
