import {ScreenUrls} from "../support";

const selectors = {
    logoutDialog: "[data-testid=no-account-logout-dialog]"
};

export const NoAccount = {
    login({demoData = false, doOnboarding = true} = {}) {
        cy.visit(ScreenUrls.LOGIN);
        cy.contains("Use without an account").click();

        if (doOnboarding) {
            this.completeOnboarding(demoData);
        }
    },
    loginThroughLink({demoData = false, doOnboarding = true} = {}) {
        cy.visit(ScreenUrls.NO_ACCOUNT_LOGIN);

        if (doOnboarding) {
            this.completeOnboarding(demoData);
        }
    },
    logoutConfirm() {
        cy.get(selectors.logoutDialog).contains("Yes, Logout").click();
    },
    logoutCancel() {
        cy.get(selectors.logoutDialog).contains("Cancel").click();
    },
    completeOnboarding(demoData: boolean) {
        // Make sure we've made it to the Onboarding process.
        cy.url().should("include", ScreenUrls.APP);
        cy.contains("You are using uFincs without an account.").should("exist");

        // Get through the warning step.
        cy.contains("Got it!").click();

        if (demoData) {
            cy.contains("Use Demo Data").click();
        } else {
            // Get through the regular welcome step.
            cy.contains("Let's go!").click();

            // Skip onboarding.
            cy.contains("Skip Setup").click();
        }

        // Should have made it to the app now.
        cy.contains("Dashboard").should("exist");
    }
};
