import {sharedSelectors, AppNavigation, DerivedAppScreenUrls} from "../support";
import {Viewport} from "../support/types";

const selectors = {
    restoreForm: {
        restoreBackup: "[data-testid=restore-data-form-file-input]"
    }
};

export const UserSettings = {
    deleteAccountFirstAccount(viewport: Viewport, name: string) {
        cy.get(sharedSelectors.accounts[viewport].accountsList).as("list");

        if (viewport === "mobile") {
            // Open the actions.
            cy.get("@list").find(sharedSelectors.accounts.list.actionOverflow).first().click();
        }

        // Delete the account.
        cy.get("@list").find(sharedSelectors.accounts.list.actionDelete).first().click();
        cy.get(sharedSelectors.dialogs.primaryAction).click();

        // Make sure it's gone.
        cy.get("@list").contains(name).should("not.exist");
    },
    restoreFile(
        viewport: Viewport,
        {
            file,
            deleteAccounts = true,
            checkAccounts = true
        }: {file: string; deleteAccounts?: boolean; checkAccounts?: boolean}
    ) {
        // Delete the asset accounts to give us a dirty state to work with.
        if (deleteAccounts) {
            AppNavigation.gotoAccounts(viewport);

            this.deleteAccountFirstAccount(viewport, "Cash");
            this.deleteAccountFirstAccount(viewport, "Chequing");
            this.deleteAccountFirstAccount(viewport, "Savings Account");
        }

        // Go to restore the file.
        cy.visit(DerivedAppScreenUrls.SETTINGS_DATA);

        // Restore the file.
        cy.get(selectors.restoreForm.restoreBackup).attachFile(file);

        if (checkAccounts) {
            // Give it a wait to load in the backup.
            cy.wait(2000);

            // Make sure the accounts were restored.
            AppNavigation.gotoAccounts(viewport);

            cy.contains("Cash").should("exist");
            cy.contains("Chequing").should("exist");
            cy.contains("Savings Account").should("exist");
        }
    }
};
