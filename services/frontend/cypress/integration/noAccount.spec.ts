import {
    helpers,
    sharedSelectors,
    testData,
    AccountForm,
    AppNavigation,
    FeedbackDialog,
    GlobalAddButton,
    NoAccount,
    ScreenUrls,
    UserSettings,
    DerivedAppScreenUrls
} from "../support";
import {Viewport} from "../support/types";

const email = Cypress.env("email");
const password = Cypress.env("password");

const {authentication} = helpers;
const {email: newEmail, password: newPassword} = testData.newUser;

const selectors = {
    appNavigationSignUpButton: "[data-testid=app-navigation-signup]",
    settingsNavigationSignUpButton: "[data-testid=settings-navigation-signup]"
};

describe("No-Account Login", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.changeViewport(viewport);
        });

        it("can be logged into via a link from the authentication scene", () => {
            NoAccount.login();
        });

        it("can be logged into after logging into an actual account", () => {
            cy.visit(ScreenUrls.LOGIN);

            authentication.aliasLoginForm();
            authentication.loginThroughInputs(email, password);
            cy.url().should("include", ScreenUrls.APP);

            NoAccount.loginThroughLink();
        });

        it("doesn't kick the user out when trying to log in while already logged in", () => {
            // Login normally.
            NoAccount.login();

            // Need a sleep for the login to settle.
            cy.wait(2000);

            // Forcefully log in again...
            NoAccount.loginThroughLink({doOnboarding: false});

            // Should still be in the app.
            cy.url().should("include", ScreenUrls.APP);
            cy.contains("Dashboard").should("exist");
        });

        it("can be logged out of with a warning that data will be wiped", () => {
            NoAccount.login();

            authentication.logout(viewport);
            NoAccount.logoutConfirm();

            cy.url().should("include", ScreenUrls.LOGIN);
        });

        it("can cancel the logout warning to return to the app", () => {
            NoAccount.login();

            authentication.logout(viewport);
            NoAccount.logoutCancel();

            cy.url().should("include", ScreenUrls.APP);
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("No-Account Sign Up", () => {
    const newAccountName = "new account name 123";

    const signUpTest = (viewport: Viewport, gotoSignUp: (viewport: Viewport) => void) => {
        // Create a new account for testing data migration.
        GlobalAddButton.addAccount(viewport);

        AccountForm.enterFormData({name: newAccountName, type: "Income"});
        AccountForm.createAccount();

        // Sign up.
        gotoSignUp(viewport);

        authentication.aliasSignUpForm();
        authentication.signUpThroughInputs(newEmail, newPassword);

        // Make sure we're now back in the app.
        cy.url().should("include", ScreenUrls.APP);
        cy.url().should("not.include", DerivedAppScreenUrls.NO_ACCOUNT_SIGN_UP);

        // Make sure the account still exists.
        AppNavigation.gotoAccounts(viewport);
        cy.contains(newAccountName).should("exist");

        // Logout and back in to ensure the user account was actually created.
        authentication.logout(viewport);

        authentication.aliasLoginForm();
        authentication.loginThroughInputs(newEmail, newPassword);

        cy.url().should("include", ScreenUrls.APP);

        // Make sure the (financial) account still exists.
        AppNavigation.gotoAccounts(viewport);
        cy.contains(newAccountName).should("exist");
    };

    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.resetDb();

            cy.changeViewport(viewport);
            NoAccount.login();
        });

        const gotoSignUpFromSettings = (viewport: Viewport) => {
            AppNavigation.gotoSettings(viewport);
            cy.get(selectors.settingsNavigationSignUpButton).click();
        };

        it("can sign up from the settings to create an account", () => {
            signUpTest(viewport, gotoSignUpFromSettings);
        });
    };

    describe("Desktop", () => {
        tests("desktop");

        const gotoSignUpFromHeader = () => {
            cy.get(selectors.appNavigationSignUpButton).click();
        };

        it("can sign up from the app header to create an account", () => {
            signUpTest("desktop", gotoSignUpFromHeader);
        });
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Disabled Features", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.changeViewport(viewport);
            NoAccount.login();
        });

        it("doesn't show the 'User Account' section in the Settings", () => {
            AppNavigation.gotoSettings(viewport);
            cy.contains("User Account").should("not.exist");
        });

        it("doesn't show the Encrypted Backup option in the 'My Data' section of the Settings", () => {
            AppNavigation.gotoSettingsMyData(viewport);
            cy.contains("Download Encrypted Backup").should("not.exist");
        });

        it("can't restore encrypted backups", () => {
            AppNavigation.gotoSettingsMyData(viewport);

            UserSettings.restoreFile(viewport, {
                file: testData.encryptedBackup,
                deleteAccounts: false,
                checkAccounts: false
            });

            cy.contains("Cannot restore encrypted backup to a different account").should("exist");
        });

        it("can't submit in-app feedback", () => {
            FeedbackDialog.isHidden(viewport);
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Demo Account", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.changeViewport(viewport);
        });

        it("can login using Demo Data", () => {
            NoAccount.login({demoData: true});

            // I don't know how else we should verify this, so we'll just check that the Current Net Worth
            // isn't 0. Is there a non-zero chance that 500+ random transactions _could_ have an exactly
            // $0 net worth? Yes. Is it really small? Infinitesimally.
            cy.get(sharedSelectors.currentNetWorth).contains("$0.00").should("not.exist");

            // Also, we can check that the success toast showed up.
            cy.contains("Using Demo Data").should("exist");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});
