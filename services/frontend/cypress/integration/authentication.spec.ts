import {v4 as uuidv4} from "uuid";
import {
    helpers,
    keyCodes,
    seedData,
    sharedSelectors,
    testData,
    AccountForm,
    DerivedAppScreenUrls,
    GlobalAddButton,
    ScreenUrls
} from "../support";
import {Viewport} from "../support/types";

const {authentication} = helpers;
const {firstAccount} = seedData;
const {email: newEmail, password: newPassword} = testData.newUser;

const userId = Cypress.env("userId");
const email = Cypress.env("email");
const password = Cypress.env("password");

const FAILED_LOGIN_MESSAGE = "Wrong email or password";

const selectors = {
    changeEmailForm: {
        emailInput: "input[name=newEmail]",
        submitButton: "[data-testid=change-email-form-submit]"
    },
    changePasswordForm: {
        oldPasswordInput: "input[name=oldPassword]",
        newPasswordInput: "input[name=newPassword]",
        submitButton: "[data-testid=change-password-form-submit]"
    },
    passwordResetForm: {
        passwordInput: "input[name=password]",
        confirmPasswordInput: "input[name=confirmPassword]",
        submitButton: "[data-testid=password-reset-form-submit]"
    },
    sendPasswordResetForm: {
        input: "input[name=email]"
    }
};

describe("Login", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.visit(ScreenUrls.LOGIN);
            cy.url().should("include", ScreenUrls.LOGIN);

            cy.changeViewport(viewport);

            authentication.aliasLoginForm();
        });

        it("can login successfully", () => {
            authentication.loginThroughInputs(email, password);

            cy.url().should("include", ScreenUrls.APP);
        });

        it("should fail to login when given the wrong credentials", () => {
            authentication.loginThroughInputs(email, "abc123");

            authentication.loginFailed(FAILED_LOGIN_MESSAGE);

            // The email input should receive focus after an error and
            // the password should be cleared.
            cy.get("@emailInput").should("have.focus");
            cy.get("@passwordInput").should("have.value", "");
        });

        it("should fail to login when the email isn't provided", () => {
            authentication.loginThroughInputs("", password);

            authentication.loginFailed(FAILED_LOGIN_MESSAGE, "Email is missing");

            cy.get("@emailInput").should("have.focus");
        });

        it("should fail to login when the password isn't provided", () => {
            authentication.loginThroughInputs(email, "");

            authentication.loginFailed(FAILED_LOGIN_MESSAGE, "Password is missing");

            cy.get("@passwordInput").should("have.focus");
        });

        it("shows a single error toast when trying to access the app without logging in", () => {
            cy.visit(ScreenUrls.APP);

            cy.get(sharedSelectors.toastMessages)
                .findAllByText("Please authenticate")
                .should("have.length", 1);
        });

        it("the root route (formerly Landing scene) is redirected to Login", () => {
            cy.visit("/");
            cy.url().should("include", ScreenUrls.LOGIN);
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Headless Login", () => {
    beforeEach(() => {
        cy.loginHeadless();
    });

    it("can login without the UI", () => {
        cy.visit(ScreenUrls.APP);
        cy.url().should("include", ScreenUrls.APP);
    });

    it("should redirect logged in users back to the app", () => {
        cy.visit(ScreenUrls.APP);
        cy.url().should("include", ScreenUrls.APP);

        cy.visit(ScreenUrls.LOGIN);
        cy.url().should("include", ScreenUrls.APP);
    });
});

describe("Logout", () => {
    describe("Desktop", () => {
        beforeEach(() => {
            cy.loginHeadless();
            cy.visit(ScreenUrls.APP);

            cy.changeViewport("desktop");
        });

        it("can logout", () => {
            authentication.logout("desktop");

            cy.url().should("eq", Cypress.config().baseUrl + ScreenUrls.LOGIN);

            // Trying to get back to app should redirect the user to the login form.
            cy.visit(ScreenUrls.APP);
            cy.url().should("include", ScreenUrls.LOGIN);
        });

        it("can close the dropdown menu when pressing escape", () => {
            cy.get(sharedSelectors.userDropdownTrigger).click();

            // Opacity isn't counted towards visibility, so we have to check it manually.
            // Reference: https://github.com/cypress-io/cypress/issues/4474
            cy.get(sharedSelectors.userDropdown)
                .as("userDropdown")
                .should("have.css", "opacity", "1");

            cy.get("body").trigger("keydown", {keyCode: keyCodes.ESCAPE});

            cy.get("@userDropdown").should("have.css", "opacity", "0");
        });
    });

    describe("Mobile", () => {
        beforeEach(() => {
            cy.loginHeadless();
            cy.visit(ScreenUrls.APP);

            cy.changeViewport("mobile");
        });

        it("can logout", () => {
            authentication.logout("mobile");

            cy.url().should("eq", Cypress.config().baseUrl + ScreenUrls.LOGIN);

            // Trying to get back to app should redirect the user to the login form.
            cy.visit(ScreenUrls.APP);
            cy.url().should("include", ScreenUrls.LOGIN);
        });
    });
});

describe("Sign Up", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.visit(ScreenUrls.SIGN_UP);
            cy.url().should("include", ScreenUrls.SIGN_UP);

            cy.changeViewport(viewport);

            authentication.aliasSignUpForm();
        });

        it("can sign up successfully", () => {
            cy.resetDb();

            authentication.signUpThroughInputs(newEmail, newPassword);

            cy.url().should("include", ScreenUrls.APP);
        });

        it("should fail to sign up when the user already exists", () => {
            authentication.signUpThroughInputs(email, password);

            authentication.signUpFailed("This user already exists");
        });

        it("should fail to sign up when the email isn't provided", () => {
            authentication.signUpThroughInputs("", newPassword);

            authentication.signUpFailed("Email is missing", "You must provide an email");
        });

        it("should fail to sign up when the password isn't provided", () => {
            authentication.signUpThroughInputs(newEmail, "");

            authentication.signUpFailed("Password is missing", "You must provide a password");
        });

        it("should fail to sign up when the password isn't provided", () => {
            authentication.signUpThroughInputs(newEmail, newPassword);
            authentication.signUpFailed();
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Switching between Authentication Types", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.changeViewport(viewport);
        });

        it("can switch to the sign up form from login and sign up", () => {
            cy.resetDb();

            cy.visit(ScreenUrls.LOGIN);

            cy.contains("button", "Sign Up").click();
            cy.url().should("include", ScreenUrls.SIGN_UP);

            authentication.aliasSignUpForm();
            authentication.signUpThroughInputs(newEmail, newPassword);

            cy.url().should("include", ScreenUrls.APP);
        });

        it("can switch to the login form from sign up and login", () => {
            cy.visit(ScreenUrls.SIGN_UP);

            cy.contains("button", "Login").click();
            cy.url().should("include", ScreenUrls.LOGIN);

            authentication.aliasLoginForm();
            authentication.loginThroughInputs(email, password);

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

describe("Change Email", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.resetDb();

            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.SETTINGS_USER_ACCOUNT);

            cy.changeViewport(viewport);

            cy.get(selectors.changeEmailForm.emailInput).as("email");
            cy.get(selectors.changeEmailForm.submitButton).as("submit");
        });

        it("can change the user's email", () => {
            // Change the password.
            cy.get("@email").type(newEmail);

            cy.get("@submit").click();

            // Should see this message in a toast if successful.
            cy.contains(`Successfully changed email to ${newEmail}`).should("exist");

            authentication.logout(viewport);

            // Try logging in with old email; should fail.
            authentication.aliasLoginForm();
            authentication.loginThroughInputs(email, password);

            cy.contains("Wrong email or password").should("exist");

            // Should be able to login with new email.
            authentication.loginThroughInputs(newEmail, password);

            cy.url().should("include", ScreenUrls.APP);
        });

        it("can fail when the input is empty", () => {
            cy.get("@submit").click();

            // Should have the error message.
            cy.contains("New Email is missing").should("exist");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Change Password", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.resetDb();

            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.SETTINGS_USER_ACCOUNT);

            cy.changeViewport(viewport);

            cy.get(selectors.changePasswordForm.oldPasswordInput).as("oldPassword");
            cy.get(selectors.changePasswordForm.newPasswordInput).as("newPassword");
            cy.get(selectors.changePasswordForm.submitButton).as("submit");
        });

        const newPassword = "abc123";

        it("can change the user's password", () => {
            // Change the password.
            cy.get("@oldPassword").type(password);
            cy.get("@newPassword").type(newPassword);

            cy.get("@submit").click();

            // Should see this message in a toast if successful.
            cy.contains("Successfully changed password").should("exist");

            authentication.logout(viewport);

            // Try logging in with old password; should fail.
            authentication.aliasLoginForm();
            authentication.loginThroughInputs(email, password);

            cy.contains("Wrong email or password").should("exist");

            // Should be able to login with new password.
            authentication.loginThroughInputs(email, newPassword);

            cy.url().should("include", ScreenUrls.APP);
        });

        it("can fail when the old password is wrong", () => {
            // Try to change the password.
            cy.get("@oldPassword").type(newPassword);
            cy.get("@newPassword").type(newPassword);

            cy.get("@submit").click();

            // Should have the error message.
            cy.contains("Wrong old password").should("exist");
        });

        it("can fail when either password input is empty", () => {
            // Only fill out New Password input.
            cy.get("@newPassword").type(newPassword);

            cy.get("@submit").click();

            // Should have the error message.
            cy.contains("Old Password is missing").should("exist");

            // Only fill out Old Password input.
            cy.get("@oldPassword").type(password);
            cy.get("@newPassword").clear();

            cy.get("@submit").click();

            // Should have the error message.
            cy.contains("New Password is missing").should("exist");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Password Reset", () => {
    // 'test' prefix to differentiate these credentials from the email/password defined above for
    // the test@test.com account.
    const testEmail = Cypress.env("mailslurpEmail");
    const testPassword = "testing 123";
    const newPassword = "thisisanewpassword";

    const dummyAccountName = "dummy account";

    const tests = (viewport: Viewport) => {
        // The actual password reset test is rather flakey when running under Electron (i.e. headless).
        // It seems to work fine when running in actual Chrome though.
        if (!Cypress.isBrowser("electron")) {
            describe("Tests with Database", () => {
                beforeEach(() => {
                    cy.resetDb();
                    cy.changeViewport(viewport);

                    // Clear out all emails before receiving new ones, just to make sure there aren't any
                    // old emails clogging up the system.
                    return cy.deleteAllEmails().then(() => {
                        // Need to create the user account with the 'legit' email.
                        cy.signUp({
                            email: testEmail,
                            password: testPassword
                        });

                        // Create a dummy (financial) account just to test that user data gets wiped.
                        GlobalAddButton.addAccount(viewport);
                        AccountForm.enterFormData({name: dummyAccountName});
                        AccountForm.createAccount();

                        // Go to the Send Password Reset page.
                        authentication.logout(viewport);

                        cy.visit(ScreenUrls.LOGIN);
                        cy.contains("Forgot your password?").click();

                        cy.url().should("include", ScreenUrls.SEND_PASSWORD_RESET);
                    });
                });

                // Note: Because this test relies on a third-party service for receiving the emails,
                // and the service has limits on how many emails it can receive, we want to minimize how
                // many emails are sent by the app. As such, the core logic is all encapsulated into a
                // single test so that only 1 email has to be sent.
                it("can reset a user's password and wipe their data but not wipe other user data", () => {
                    // Send the password reset email.
                    cy.get(selectors.sendPasswordResetForm.input).type(testEmail);
                    cy.contains("Send password reset email").click();

                    cy.waitForLatestEmail().then(({body}) => {
                        // Get the link with the reset token.
                        const url = body
                            .match(/"http:\/\/localhost:3000\/password-reset\/.*"/)?.[0]
                            ?.replace(/"/g, "");

                        if (!url) {
                            throw new Error("Token link not found in email");
                        }

                        // Delete all emails in the inbox because retrieving the 'Successful password reset'
                        // email can be flaky if we don't.
                        cy.deleteAllEmails().then(() => {
                            // Go to the password reset page.
                            cy.visit(url);
                            cy.url().should("equal", url);

                            // Perform the password reset.
                            cy.get(selectors.passwordResetForm.passwordInput).type(newPassword);
                            cy.get(selectors.passwordResetForm.confirmPasswordInput).type(
                                newPassword
                            );

                            cy.get(selectors.passwordResetForm.submitButton).click();

                            cy.contains("Yes, Change Password").click();

                            cy.waitForLatestEmail().then(({subject}) => {
                                // Make sure we get the success email.
                                expect(subject).to.include("Successful password reset");

                                // Delete all the emails to keep the inbox clean for future runs.
                                cy.deleteAllEmails().then(() => {
                                    // We should have been logged in as part of the password reset.
                                    cy.url().should("include", ScreenUrls.APP);

                                    // Make sure the dummy account no longer exists (i.e. user data was wiped).
                                    cy.visit(DerivedAppScreenUrls.ACCOUNTS);
                                    cy.contains(dummyAccountName).should("not.exist");

                                    // Logout and log back in using the new password to make sure the password
                                    // reset actually worked.
                                    authentication.logout(viewport);

                                    cy.visit(ScreenUrls.LOGIN);
                                    authentication.aliasLoginForm();
                                    authentication.loginThroughInputs(testEmail, newPassword);

                                    cy.url().should("include", ScreenUrls.APP);

                                    // Logout and log back in to the test@test.com account to make sure we didn't
                                    // accidentally delete _all_ user data (this has happened before...)
                                    authentication.logout(viewport);

                                    cy.visit(ScreenUrls.LOGIN);
                                    authentication.aliasLoginForm();
                                    authentication.loginThroughInputs(email, password);

                                    cy.url().should("include", ScreenUrls.APP);
                                    cy.get(sharedSelectors.navigation[viewport].accounts).click();
                                    cy.contains(firstAccount.name).should("exist");
                                });
                            });
                        });
                    });
                });
            });
        }

        describe("Tests without Database", () => {
            before(() => {
                cy.resetDb();
            });

            beforeEach(() => {
                cy.visit(ScreenUrls.PASSWORD_RESET);
            });

            it("should fail when the new password is missing", () => {
                cy.get(selectors.passwordResetForm.confirmPasswordInput).type(newPassword);
                cy.get(selectors.passwordResetForm.submitButton).click();

                cy.contains("New Password is missing").should("exist");
                cy.contains("Password doesn't match").should("exist");
            });

            it("should fail when the confirmation password is missing", () => {
                cy.get(selectors.passwordResetForm.passwordInput).type(newPassword);
                cy.get(selectors.passwordResetForm.submitButton).click();

                cy.contains("Confirm Password is missing").should("exist");
            });

            it("should fail when the confirmation password doesn't match the new password", () => {
                cy.get(selectors.passwordResetForm.passwordInput).type(newPassword);
                cy.get(selectors.passwordResetForm.confirmPasswordInput).type(
                    "some incorrect password"
                );
                cy.get(selectors.passwordResetForm.submitButton).click();

                cy.contains("Password doesn't match").should("exist");
            });

            it("should fail when the token is in an unknown format", () => {
                cy.visit(`${ScreenUrls.SEND_PASSWORD_RESET}/lasdkgfbjsdlgfkjbdfg`);

                cy.get(selectors.passwordResetForm.passwordInput).type(newPassword);
                cy.get(selectors.passwordResetForm.confirmPasswordInput).type(newPassword);
                cy.get(selectors.passwordResetForm.submitButton).click();

                cy.contains("Yes, Change Password").click();

                cy.contains("Password reset token expired or invalid").should("exist");
            });

            it("should fail when the token's ID is unknown", () => {
                cy.visit(
                    `${ScreenUrls.SEND_PASSWORD_RESET}/${uuidv4()}___37634d7628621cb60dfca945d90297`
                );

                cy.get(selectors.passwordResetForm.passwordInput).type(newPassword);
                cy.get(selectors.passwordResetForm.confirmPasswordInput).type(newPassword);
                cy.get(selectors.passwordResetForm.submitButton).click();

                cy.contains("Yes, Change Password").click();

                cy.contains("Password reset token expired or invalid").should("exist");
            });

            it("should fail when the token's secret is invalid", () => {
                cy.visit(
                    `${ScreenUrls.SEND_PASSWORD_RESET}/${userId}___37634d7628621cb60dfca945d90297`
                );

                cy.get(selectors.passwordResetForm.passwordInput).type(newPassword);
                cy.get(selectors.passwordResetForm.confirmPasswordInput).type(newPassword);
                cy.get(selectors.passwordResetForm.submitButton).click();

                cy.contains("Yes, Change Password").click();

                cy.contains("Password reset token expired or invalid").should("exist");
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
