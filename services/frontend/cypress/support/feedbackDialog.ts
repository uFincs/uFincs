import {AppNavigation, sharedSelectors} from "../support";
import {Viewport} from "../support/types";

const selectors = {
    feedback: {
        dialog: {
            feedbackDialog: "[data-testid=feedback-dialog]",
            backButton: "[data-testid=feedback-dialog-back-button]",
            closeButton: "[data-testid=feedback-dialog-close-button]"
        },
        form: {
            feedbackForm: "[data-testid=feedback-form]",
            inputIsAnonymous: "input[name=isAnonymous]",
            inputMessage: "textarea[name=message]"
        },
        mobile: {
            feedbackSettingsButton: "[data-testid=settings-send-feedback-mobile]"
        }
    }
};

export const FeedbackDialog = {
    dialogTitle: "What's up?",
    dialog() {
        return cy.get(selectors.feedback.dialog.feedbackDialog);
    },
    isOpen() {
        cy.contains(this.dialogTitle).should("exist");
    },
    isClosed() {
        cy.contains(this.dialogTitle).should("not.exist");
    },
    isHidden(viewport: Viewport) {
        if (viewport === "desktop") {
            cy.get(sharedSelectors.userDropdownTrigger).click();
            cy.contains("Send Feedback").should("not.exist");
        } else {
            AppNavigation.gotoSettings(viewport);
            cy.get(selectors.feedback.mobile.feedbackSettingsButton).should("not.exist");
        }
    },
    open(viewport: Viewport) {
        if (viewport === "desktop") {
            cy.get(sharedSelectors.userDropdownTrigger).click();
            cy.contains("Send Feedback").click();
        } else {
            AppNavigation.gotoSettings(viewport);
            cy.get(selectors.feedback.mobile.feedbackSettingsButton).click();
        }

        this.isOpen();
    },
    close() {
        this.dialog().find(selectors.feedback.dialog.closeButton).click();
        this.isClosed();
    },
    goBack() {
        this.dialog().find(selectors.feedback.dialog.backButton).click();
        this.isOpen();
    },
    clickOption(type: string) {
        this.dialog().contains(type).click();
    }
};

export const FeedbackForm = {
    form() {
        return cy.get(selectors.feedback.form.feedbackForm);
    },
    formInput(selector: string) {
        return this.form().find(selector);
    },
    messageInput() {
        return this.formInput(selectors.feedback.form.inputMessage);
    },
    isAnonymousCheckbox() {
        return this.formInput(selectors.feedback.form.inputIsAnonymous);
    },
    enterFormData(message: string, isAnonymous = false) {
        if (message) {
            this.messageInput().type(message);
        }

        if (isAnonymous) {
            this.isAnonymousCheckbox().check();
        }
    },
    submit() {
        this.form().contains("Submit Feedback").click();
    }
};
