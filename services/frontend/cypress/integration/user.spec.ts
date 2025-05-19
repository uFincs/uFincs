import {
    sharedSelectors,
    testData,
    DateService,
    AppNavigation,
    DerivedAppScreenUrls,
    NoAccount,
    ScreenUrls,
    UserSettings
} from "../support";
import {Viewport} from "../support/types";

const password = Cypress.env("password");

const selectors = {
    backupForm: {
        downloadBackup: "[data-testid=backup-data-form-backup]",
        downloadEncryptedBackup: "[data-testid=backup-data-form-encrypted-backup]"
    },
    deleteUserAccount: {
        dialog: {
            container: "[data-testid=delete-user-account-dialog]",
            input: "input[name=password]"
        },
        form: {
            submitButton: "[data-testid=delete-user-account-form-submit]"
        }
    },
    preferences: {
        currencyInput: "[data-testid=currency-preference-form-input]"
    },
    restoreForm: {
        restoreBackup: "[data-testid=restore-data-form-file-input]"
    }
};

const CURRENT_FILE_VERSION = "1.3";

// There isn't, as far as I can find, a way to disable the download prompt
// when running in headless Electron (i.e. when using `cypress run`).
// As such, just skip these tests.
describe("Backup Data", () => {
    const date = DateService.getTodayAsUTCString();

    const regularBackupFile = `ufincs-backup-${date}.json`;
    const encryptedBackupFile = `ufincs-encrypted-backup-${date}.json`;

    before(() => {
        cy.resetDb();
    });

    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.task("clearDownloads");

            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.SETTINGS_DATA);

            cy.changeViewport(viewport);

            cy.get(selectors.backupForm.downloadBackup).as("downloadBackup");
            cy.get(selectors.backupForm.downloadEncryptedBackup).as("downloadEncryptedBackup");

            // Wait for data to be fetched and stored from the Backend.
            // Otherwise, the backup files will be empty.
            cy.wait(2000);
        });

        const validateFile = (data: any, encrypted: boolean) => {
            expect(data.version).to.equal(CURRENT_FILE_VERSION);
            expect(data.encrypted).to.equal(encrypted);

            expect(data.data).to.not.equal(undefined);

            expect(Object.keys(data.data.accounts)).to.have.length.greaterThan(0);
            expect(Object.keys(data.data.importProfiles)).to.have.length.greaterThan(0);
            expect(Object.keys(data.data.importProfileMappings)).to.have.length.greaterThan(0);
            expect(Object.keys(data.data.transactions)).to.have.length.greaterThan(0);

            // There aren't any recurring recurring transactions in the seed data, so there
            // shouldn't be any in the backup.
            expect(Object.keys(data.data.recurringTransactions)).to.have.lengthOf(0);
        };

        it("can download a regular backup file", () => {
            cy.get("@downloadBackup").click();

            // Wait just a smidge to give the file time to download.
            cy.wait(1000);

            cy.task("parseDownloadedJsonFile", regularBackupFile).then((data: any) => {
                validateFile(data, false);
            });
        });

        it("can download an encrypted backup file", () => {
            cy.get("@downloadEncryptedBackup").click();

            // Wait just a smidge to give the file time to download.
            cy.wait(1000);

            cy.task("parseDownloadedJsonFile", encryptedBackupFile).then((data: any) => {
                validateFile(data, true);
            });
        });
    };

    // Need this check to be inside the `describe` block so that the spec splitting logic doesn't
    // cut the file at the wrong spot.
    if (!Cypress.isBrowser("electron")) {
        describe("Desktop", () => {
            tests("desktop");
        });

        describe("Mobile", () => {
            tests("mobile");
        });
    }
});

describe("Restore Data", () => {
    describe("Restore to Same User", () => {
        const tests = (viewport: Viewport) => {
            beforeEach(() => {
                cy.resetDb();
                cy.task("clearDownloads");

                cy.loginHeadless();
                cy.visit(DerivedAppScreenUrls.DASHBOARD);

                cy.changeViewport(viewport);
            });

            it("can restore a regular backup file", () => {
                UserSettings.restoreFile(viewport, {file: testData.regularBackup});
            });

            // Decryption doesn't seem to work properly or something.
            if (!Cypress.isBrowser("electron")) {
                it("can restore an encrypted backup file", () => {
                    UserSettings.restoreFile(viewport, {file: testData.encryptedBackup});
                });
            }
        };

        describe("Desktop", () => {
            tests("desktop");
        });

        describe("Mobile", () => {
            tests("mobile");
        });
    });

    describe("Restore to Different User", () => {
        const tests = (viewport: Viewport) => {
            beforeEach(() => {
                cy.resetDb();
                cy.task("clearDownloads");

                cy.signUp();
                cy.visit(DerivedAppScreenUrls.DASHBOARD);

                cy.changeViewport(viewport);
            });

            it("can restore a regular backup file to a different user", () => {
                UserSettings.restoreFile(viewport, {
                    file: testData.regularBackup,
                    deleteAccounts: false
                });
            });

            it("can't restore an encrypted backup file to a different user", () => {
                // Go to restore the file.
                cy.visit(DerivedAppScreenUrls.SETTINGS_DATA);

                // Restore the file.
                cy.get(selectors.restoreForm.restoreBackup).attachFile(testData.encryptedBackup);

                // It should fail to decrypt the file, since the user ID is different.
                cy.contains("Failed to decrypt backup file.");
            });
        };

        describe("Desktop", () => {
            tests("desktop");
        });

        describe("Mobile", () => {
            tests("mobile");
        });
    });
});

describe("Delete User Account", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.resetDb();

            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.SETTINGS_USER_ACCOUNT);

            cy.changeViewport(viewport);

            cy.get(selectors.deleteUserAccount.form.submitButton).as("submit");
        });

        it("can delete the user's account", () => {
            // Start the deletion process.
            cy.get("@submit").click();

            // Enter password into the dialog and submit it.
            cy.get(selectors.deleteUserAccount.dialog.container).as("dialog");
            cy.get("@dialog").find(selectors.deleteUserAccount.dialog.input).type(password);
            cy.get("@dialog").contains("Delete My Account").click();

            // Should get a toast now.
            cy.contains("Successfully deleted your account... Sad to see you go :(").should(
                "exist"
            );

            // Should now be on the login page.
            cy.url().should("include", ScreenUrls.LOGIN);
        });

        it("can fail when the user enters the wrong/empty password", () => {
            // Start the deletion process.
            cy.get("@submit").click();

            // Enter password into the dialog and submit it.
            cy.get(selectors.deleteUserAccount.dialog.container).as("dialog");
            cy.get("@dialog")
                .find(selectors.deleteUserAccount.dialog.input)
                .type("totally wrong password");
            cy.get("@dialog").contains("Delete My Account").click();

            // Should get an error message now.
            cy.contains("Wrong password - try again").should("exist");

            // Try again with an empty password.
            cy.get("@submit").click();
            cy.get("@dialog").contains("Delete My Account").click();

            // Should still have the error message.
            cy.contains("Wrong password - try again").should("exist");

            // Navigate somewhere else to make sure we weren't accidentally logged out.
            cy.visit(DerivedAppScreenUrls.DASHBOARD);
            cy.url().should("include", DerivedAppScreenUrls.DASHBOARD);
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Preferences - Currency", () => {
    const tests = () => {
        it("can change the currency symbol", () => {
            // Ensure the base state is set.
            cy.get(sharedSelectors.currentNetWorth).contains("$").should("exist");
            cy.get(sharedSelectors.currentNetWorth).contains("€").should("not.exist");

            // Change the currency.
            cy.get("@input").select("EUR");

            // Expect it to be immediately reflected in the Current Net Worth.
            cy.get(sharedSelectors.currentNetWorth).contains("$").should("not.exist");
            cy.get(sharedSelectors.currentNetWorth).contains("€").should("exist");

            // Expect it to show up on the Transactions page.
            cy.visit(DerivedAppScreenUrls.TRANSACTIONS);
            cy.contains("$").should("not.exist");
            cy.contains("€").should("exist");
        });
    };

    const allAuthenticationModeTests = (viewport: Viewport) => {
        describe("Authenticated", () => {
            beforeEach(() => {
                cy.resetDb();
                cy.loginHeadless();
                cy.changeViewport(viewport);

                cy.visit(DerivedAppScreenUrls.DASHBOARD);
                AppNavigation.gotoSettingsMyPreferences(viewport);

                cy.get(selectors.preferences.currencyInput).as("input");
            });

            tests();
        });

        describe("No-Account", () => {
            beforeEach(() => {
                cy.resetDb();
                cy.changeViewport(viewport);

                NoAccount.login();
                AppNavigation.gotoSettingsMyPreferences(viewport);

                cy.get(selectors.preferences.currencyInput).as("input");
            });

            tests();
        });
    };

    describe("Desktop", () => {
        allAuthenticationModeTests("desktop");
    });

    describe("Mobile", () => {
        allAuthenticationModeTests("mobile");
    });
});
