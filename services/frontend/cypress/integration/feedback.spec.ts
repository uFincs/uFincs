import {DerivedAppScreenUrls, FeedbackDialog, FeedbackForm} from "../support";
import {Viewport} from "../support/types";

const FEEDBACK_TYPES = ["issue", "idea", "other"];
const feedbackMessage = "Hello, this is some feedback.";

const successToastExists = ({not = false} = {}) => {
    cy.contains("Thanks for giving some feedback.").should(`${not ? "not." : ""}exist`);
};

const submissionTest = ({isAnonymous = false} = {}) => {
    FeedbackForm.enterFormData(feedbackMessage, isAnonymous);
    FeedbackForm.submit();

    successToastExists();
};

describe("User Submitted Feedback", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.DASHBOARD);

            cy.changeViewport(viewport);

            FeedbackDialog.open(viewport);
        });

        it("can close the feedback dialog without doing anything", () => {
            FeedbackDialog.close();
        });

        it("can send Issue feedback", () => {
            FeedbackDialog.clickOption(FEEDBACK_TYPES[0]);
            submissionTest();
        });

        it("can send Idea feedback", () => {
            FeedbackDialog.clickOption(FEEDBACK_TYPES[1]);
            submissionTest();
        });

        it("can send Other feedback", () => {
            FeedbackDialog.clickOption(FEEDBACK_TYPES[2]);
            submissionTest();
        });

        // Note: Currently, 'send non-anonymously' is the default.
        it("can send feedback anonymously", () => {
            FeedbackDialog.clickOption(FEEDBACK_TYPES[1]);
            submissionTest({isAnonymous: true});
        });

        it("can't send feedback non-anonymously for Issue feedback", () => {
            FeedbackDialog.clickOption(FEEDBACK_TYPES[0]);
            cy.contains("Submit anonymously").should("not.exist");
        });

        it("can change the type of feedback being given", () => {
            FeedbackDialog.clickOption(FEEDBACK_TYPES[0]);
            FeedbackDialog.goBack();
            FeedbackDialog.clickOption(FEEDBACK_TYPES[1]);

            submissionTest();
        });

        it("shows an error when the message is left empty", () => {
            FeedbackDialog.clickOption(FEEDBACK_TYPES[1]);

            FeedbackForm.enterFormData("");
            FeedbackForm.submit();

            // Make sure the error message showed up.
            cy.contains("Message is missing").should("exist");

            // Make sure the success toast didn't show up.
            successToastExists({not: true});
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});
