import {AppNavigation} from "./appNavigation";
import {Viewport} from "./types";
import {sharedSelectors, testData, ScreenUrls, DerivedAppScreenUrls, ImportRuleForm} from "./";

/* Authentication */

const selectors = {
    emailInput: "input[name=email]",
    passwordInput: "input[name=password]",
    consentInput: "input[name=consent]",
    authForm: "[data-testid=auth-form]",
    mobile: {
        logout: "[data-testid=settings-logout-mobile]",
        settings: "[data-testid=app-navigation-small-item-Settings]"
    }
};

export const authentication = {
    loginFailed(...messages: Array<string>) {
        cy.url().should("include", ScreenUrls.LOGIN);
        cy.url().should("not.include", ScreenUrls.APP);

        messages.forEach((message) => cy.contains(message));
    },
    signUpFailed(...messages: Array<string>) {
        cy.url().should("include", ScreenUrls.SIGN_UP);
        cy.url().should("not.include", ScreenUrls.APP);

        messages.forEach((message) => cy.contains(message));
    },
    aliasInputs() {
        cy.get(selectors.emailInput).as("emailInput");
        cy.get(selectors.passwordInput).as("passwordInput");
    },
    aliasLoginForm() {
        this.aliasInputs();
        cy.get(selectors.authForm).contains("button", "Login").as("loginButton");
    },
    aliasSignUpForm() {
        this.aliasInputs();
        cy.get(selectors.authForm).contains("button", "Sign Up").as("signUpButton");
    },
    typeIntoInputs(email: string, password: string) {
        if (email) {
            cy.get("@emailInput").clear().type(email);
        }

        if (password) {
            cy.get("@passwordInput").clear().type(password);
        }
    },
    checkConsentInput() {
        cy.get(selectors.consentInput).click();
    },
    loginThroughInputs(email: string, password: string) {
        this.typeIntoInputs(email, password);
        cy.get("@loginButton").click();
    },
    signUpThroughInputs(email: string, password: string) {
        this.typeIntoInputs(email, password);
        cy.get("@signUpButton").click();
    },
    logout(viewport: Viewport) {
        if (viewport === "desktop") {
            cy.get(sharedSelectors.userDropdownTrigger).click();
            cy.contains("Logout").click();
        } else {
            AppNavigation.gotoSettings(viewport);
            cy.get(selectors.mobile.logout).click();
        }
    }
};

export const createNewRule = (rule = testData.newRule) => {
    cy.visit(DerivedAppScreenUrls.IMPORT_OVERVIEW);
    cy.contains("Add Rule").first().click();

    ImportRuleForm.enterFormData(rule);
    ImportRuleForm.createRule();
};

export const ruleExists = (viewport: Viewport, rule: typeof testData.newRule) => {
    const view = sharedSelectors.importRules[viewport].view;

    for (const action of rule.actions) {
        if (action.property === "description") {
            cy.get(view).contains(action.value).should("exist");
        }
    }

    for (const condition of rule.conditions) {
        if (condition.property === "description") {
            cy.get(view).contains(condition.value).should("exist");
        }
    }
};
