// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import "cypress-file-upload";
import "@testing-library/cypress/add-commands";
// import {MailSlurp} from "mailslurp-client";

import {AUTH_STORAGE_KEY} from "../../src/api/auth";
import localForage from "../../src/store/localForage";
import hashPassword from "../../src/utils/hashPassword";
import ScreenUrls from "../../src/values/screenUrls";
import {E2ECrypto} from "../../src/vendor/redux-e2e-encryption";
import {authentication} from "./helpers";
import sharedSelectors from "./sharedSelectors";
import {newUser} from "./testData";
import {Viewport} from "./types";

/* Custom Commands */

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            resetDb: () => void;
            loginHeadless: (email?: string, password?: string) => void;
            signUp: ({
                email,
                password,
                skipOnboarding
            }?: {
                email?: string;
                password?: string;
                skipOnboarding?: boolean;
            }) => void;
            desktopViewport: () => void;
            mobileViewport: () => void;
            changeViewport: (viewport: "desktop" | "mobile") => void;
            scrollToTop: () => void;
            selectDateRange: (viewport: "desktop" | "mobile", dateRange: string) => void;
            setDateRangeStart: (date: string) => void;
            setDateRangeEnd: (date: string) => void;
            toggleShowFuture: () => void;
            transactionsExist: (
                viewport: "desktop" | "mobile",
                descriptions: Array<string>
            ) => void;
            waitForLatestEmail: (inboxId?: string) => Promise<{subject: string; body: string}>;
            deleteAllEmails: () => Promise<void>;
        }
    }
}

const backendPort = Cypress.env("BACKEND_PORT");
const backendUrl = `${Cypress.env("BACKEND_HOST")}:${backendPort}`;
const frontendPort = Cypress.env("FRONTEND_PORT");
const dockerComposeProjectName = Cypress.env("PROJECT_NAME");

// Tech Debt: Mailslurp is no longer viable now that inboxes are no longer permanent,
// so any tests relying on it are now skipped.
//
// let mailslurp: MailSlurp;

// try {
//     // If you try to run Cypress on a fresh machine and run into the following error:
//     //
//     // ```
//     // Error: The following error originated from your test code, not from Cypress.
//     // > undefined
//     // ```
//     //
//     // It's because the MAILSLURP_API_KEY env var is missing. It can be provided in the form of a cypress.env.json
//     // file to shut the error up. Worst error message ever... so we throw a better one.
//     const mailslurpApiKey = Cypress.env("MAILSLURP_API_KEY");
//     mailslurp = new MailSlurp({apiKey: mailslurpApiKey});
// } catch (e) {
//     throw new Error(
//         "MAILSLURP_API_KEY is not defined; please add a cypress.env.json to `services/frontend` with it"
//     );
// }

const crypto = new E2ECrypto();

let lastEmail = "";
let loginToken = "";
let dek: CryptoKey | undefined = undefined;
let userId = "";

Cypress.Commands.overwrite("visit", (orig, url, options) => {
    orig(url, options);

    // Ever since we introduced the encryption process, we've needed a short wait when navigating
    // with visit, to give the encryption process time to initialize.
    // If we don't do this, then there's the possibility of a race condition happening where the encryption
    // stuff isn't initialized in time.
    cy.wait(1500);
});

Cypress.Commands.add(
    "loginHeadless",
    (email = Cypress.env("email"), password = Cypress.env("password")) => {
        if (loginToken && dek && userId && email === lastEmail) {
            window.localStorage.setItem(AUTH_STORAGE_KEY, loginToken);
            injectStoreUser(userId, email);

            return E2ECrypto.fillStorage(dek, userId);
        } else {
            return new Cypress.Promise((resolve) => {
                hashPassword(password)
                    .then((hashedPassword) => {
                        return hashedPassword;
                    })
                    .then((hashedPassword) => {
                        // This uses `fetch` over `cy.request` so that a `cy` command isn't invoked and
                        // cause the "can't return a promise while also invoking cy commands" error.
                        //
                        // By using `fetch`, along with returning a `Cypress.Promise`, the entire
                        // call chain just uses normal promises, so everything works out such that
                        // the promise has to resolve before anything else happens.
                        //
                        // And obviously, it is important that the promise fully resolve before anything
                        // else happens because login is normally something that needs to happen before
                        // anything else can happen; if the login doesn't finish properly, then everything
                        // else is screwed.
                        return fetch(`${backendUrl}/authentication`, {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                email,
                                password: hashedPassword,
                                strategy: "local"
                            })
                        })
                            .then((res) => {
                                return res.json();
                            })
                            .then((body) => {
                                const {accessToken, user} = body;

                                loginToken = accessToken;
                                lastEmail = email;

                                window.localStorage.setItem(AUTH_STORAGE_KEY, loginToken);
                                injectStoreUser(user.id, email);

                                return crypto
                                    .init(user.edek, user.kekSalt, password, user.id)
                                    .then(() => {
                                        dek = crypto.dek;
                                        userId = user.id;

                                        resolve();
                                    });
                            });
                    });
            });
        }
    }
);

// Note: Cannot do a 'headless' sign up, since we can't simulate the process of generating the encryption
// keys headlessly. Or at least, it's less complicated to just do it through the UI.
// And anyways, signups are a rarer occurrence than logins, so it's fine.
Cypress.Commands.add(
    "signUp",
    ({email = newUser.email, password = newUser.password, skipOnboarding = true} = {}) => {
        cy.visit(ScreenUrls.SIGN_UP);

        authentication.aliasSignUpForm();
        authentication.signUpThroughInputs(email, password);

        if (skipOnboarding) {
            cy.contains("Let's go!").click();
            cy.contains("Skip Setup").click();

            // Need a short wait to get through to the app correctly (since there's a short wait
            // in the app to send the user there).
            cy.wait(1000);
        }

        cy.url().should("include", ScreenUrls.APP);
    }
);

Cypress.Commands.add("resetDb", () => {
    if (dockerComposeProjectName) {
        return cy.exec(
            `cd ../../ && sh ./scripts/cypress_reset_db.sh ${dockerComposeProjectName} ${backendPort} ${frontendPort}`
        );
    } else {
        return cy.exec("cd ../../ && sh ./scripts/cypress_reset_db.sh");
    }
});

Cypress.Commands.add("desktopViewport", () => {
    cy.viewport(1366, 768);
});

Cypress.Commands.add("mobileViewport", () => {
    // iPhone 6, portrait
    cy.viewport(375, 667);
});

Cypress.Commands.add("changeViewport", (viewport: Viewport) => {
    if (viewport === "desktop") {
        cy.desktopViewport();
    } else if (viewport === "mobile") {
        cy.mobileViewport();
    }
});

Cypress.Commands.add("scrollToTop", () => {
    cy.get(sharedSelectors.appRouter).scrollTo("top");
});

Cypress.Commands.add("selectDateRange", (viewport: Viewport, dateRange: string) => {
    const selector = sharedSelectors.dateRangePicker.dateRangeSizePicker[viewport];

    if (viewport === "desktop") {
        // Need to force-click because the Date Picker can get mounted/unmounted as the viewport
        // changes size (e.g. for the Accounts scene switching from mobile to desktop).
        cy.get(`${selector}:visible`).contains(dateRange).click({force: true});
    } else {
        // Sometimes (aka on the Accounts scene) there are multiple date pickers.
        // Use only the visible one.
        //
        // Force-click for the same reasons as above.
        cy.get(`${selector}:visible`).select(dateRange, {force: true});
    }
});

Cypress.Commands.add("setDateRangeStart", (date: string) => {
    cy.get(sharedSelectors.dateRangePicker.dateSwitcher)
        .find(sharedSelectors.dateRangePicker.startDateInput)
        .type(date);
});

Cypress.Commands.add("setDateRangeEnd", (date: string) => {
    cy.get(sharedSelectors.dateRangePicker.dateSwitcher)
        .find(sharedSelectors.dateRangePicker.endDateInput)
        .type(date);
});

Cypress.Commands.add("toggleShowFuture", () => {
    // Need to scroll to the top to get the Show Future button visible on mobile.
    cy.scrollToTop();

    // Because there are technically 2 Show Future buttons, we need to pick the visible one.
    cy.get(`${sharedSelectors.dateRangePicker.showFutureToggle}:visible`).click();
});

Cypress.Commands.add(
    "transactionsExist",
    (viewport: "desktop" | "mobile", descriptions: Array<string>) => {
        const view = sharedSelectors.transactions[viewport].view;

        for (const description of descriptions) {
            cy.get(view).contains(description).should("exist");
        }
    }
);

// Cypress.Commands.add("waitForLatestEmail", (inboxId = Cypress.env("mailslurpInboxId")) => {
//     return mailslurp.waitForLatestEmail(inboxId);
// });

// Cypress.Commands.add("deleteAllEmails", async () => {
//     return mailslurp.getAllEmails().then((emails) => {
//         if (emails?.content?.length) {
//             const promises = emails.content?.map(({id}) => {
//                 return mailslurp.deleteEmail(id);
//             });

//             return Promise.all(promises);
//         }
//     });
// });

/** Helper Functions */

const injectStoreUser = (id: string, email: string) => {
    // The forward slashes need to be escaped so that we get literal forward slashes in the output.
    // If we don't have these, then `redux-persist` won't be happy and will throw an error while
    // trying to parse the object.
    const store = `{
        "user":"{\\"id\\":\\"${id}\\",\\"email\\":\\"${email}\\"}",
        "_persist":"{\\"version\\":-1,\\"rehydrated\\":true}"
    }`;

    localForage.setItem("persist:ufincs", store);
};

// Need this so that TypeScript doesn't complain about the `declare global`.
// Basically, this file needs to be a module for it to work.
export {};
