import {sharedSelectors, DerivedAppScreenUrls, ScreenUrls} from "../support";
import {Viewport} from "../support/types";

// Yeah, this is kind of a hack. There are times where we need to force click the mobile navigation
// because it's scrolled of out view, which is fine, but then there are also times where force-clicking
// on desktop just doesn't do anything.
//
// So...only force click on mobile.
const force = (viewport: Viewport) => viewport === "mobile";

export const AppNavigation = {
    gotoDashboard(viewport: Viewport) {
        cy.get(sharedSelectors.navigation[viewport].dashboard).click({force: force(viewport)});
        cy.url().should("eq", Cypress.config().baseUrl + ScreenUrls.APP);
    },
    gotoAccounts(viewport: Viewport) {
        cy.get(sharedSelectors.navigation[viewport].accounts).click({force: force(viewport)});
        cy.url().should("include", DerivedAppScreenUrls.ACCOUNTS);
    },
    gotoTransactions(viewport: Viewport) {
        cy.get(sharedSelectors.navigation[viewport].transactions).click({force: force(viewport)});
        cy.url().should("include", DerivedAppScreenUrls.TRANSACTIONS);
    },
    gotoSettings(viewport: Viewport) {
        if (viewport === "mobile") {
            // Want to force click the nav item in case the navigation hides itself on mobile because
            // Cypress decides to randomly scroll the page.
            cy.get(sharedSelectors.navigation.mobile.settings).click({force: true});
        } else {
            cy.get(sharedSelectors.userDropdownTrigger).click();
            cy.contains("Settings").click();
        }

        cy.url().should("include", DerivedAppScreenUrls.SETTINGS);
    },
    gotoSettingsUserAccount(viewport: Viewport) {
        this.gotoSettings(viewport);

        cy.get(sharedSelectors.navigation[viewport].settingsNavigation)
            .contains("User Account")
            .click();

        cy.url().should("include", DerivedAppScreenUrls.SETTINGS_USER_ACCOUNT);
    },
    gotoSettingsMyData(viewport: Viewport) {
        this.gotoSettings(viewport);

        cy.get(sharedSelectors.navigation[viewport].settingsNavigation).contains("My Data").click();
        cy.url().should("include", DerivedAppScreenUrls.SETTINGS_DATA);
    },
    gotoSettingsMyPreferences(viewport: Viewport) {
        this.gotoSettings(viewport);

        cy.get(sharedSelectors.navigation[viewport].settingsNavigation)
            .contains("My Preferences")
            .click();

        cy.url().should("include", DerivedAppScreenUrls.SETTINGS_PREFERENCES);
    }
};
