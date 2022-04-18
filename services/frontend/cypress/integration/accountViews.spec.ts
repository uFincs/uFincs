import {seedData, sharedSelectors, DerivedAppModalUrls, DerivedAppScreenUrls} from "../support";
import {Viewport} from "../support/types";

const {firstAccount, secondAccount} = seedData;

const selectors = {
    chart: {
        accountBalanceChart: "[data-testid=account-balance-chart]"
    },
    details: {
        deleteAction: "[data-testid=account-details-delete-action]",
        editAction: "[data-testid=account-details-edit-action]"
    },
    list: {
        emptyList: "[data-testid=accounts-list-empty]"
    },
    typeFilters: {
        container: "[data-testid=account-type-filters]:visible"
    },
    desktop: {
        details: {
            transactions: "[data-testid=transactions-table-desktop]"
        }
    },
    mobile: {
        details: {
            backButton: "[data-testid=account-details-back-button]",
            transactions: "[data-testid=transactions-list-mobile]"
        }
    }
};

// These are the balances that I expect from the seed data set.
// I'm too lazy to write up how they should be properly calculated,
// so I'm just hard-coding them as known values at a point in time.
// If they change, then we know something went wrong
// (i.e. a test is actually failing or the seed data changed).
//
// The index of this array maps to the indices of seedData.ACCOUNTS.
const allTimeAccountBalances = [
    "3,885.91",
    "135.33",
    "6,014.75",
    "453.98",
    "69.67",
    "463.97",
    "3,700.90",
    "14.75"
];

const accountNamesExist = (accounts: typeof seedData.ACCOUNTS = seedData.ACCOUNTS) => {
    for (const account of accounts) {
        cy.get("@list").contains(account.name).should("exist");
    }
};

const accountNamesDontExist = (accounts: typeof seedData.ACCOUNTS) => {
    for (const account of accounts) {
        cy.get("@list").contains(account.name).should("not.exist");
    }
};

const accountBalancesExist = (balances: Array<string> = allTimeAccountBalances) => {
    for (const balance of balances) {
        cy.get("@list").contains(balance).should("exist");
    }
};

describe("Accounts List Empty State", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.resetDb();
            cy.signUp();
            cy.visit(DerivedAppScreenUrls.ACCOUNTS);

            cy.changeViewport(viewport);
        });

        it("shows an empty state with a button to add a new account", () => {
            // Force click because of the desktop/mobile rendering logic (i.e. elements become detached).
            cy.get(selectors.list.emptyList).contains("Add Account").click({force: true});
            cy.url().should("include", DerivedAppModalUrls.ACCOUNT_FORM);
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Accounts List", () => {
    beforeEach(() => {
        cy.loginHeadless();
    });

    describe("Desktop", () => {
        beforeEach(() => {
            cy.desktopViewport();
            cy.visit(DerivedAppScreenUrls.ACCOUNTS);
            cy.selectDateRange("desktop", "All Time");

            cy.get(sharedSelectors.accounts.desktop.accountsList).as("list");
        });

        it("shows all of the users accounts", () => {
            accountNamesExist();
            accountBalancesExist();
        });

        it("goes to the details view of the first account by default", () => {
            cy.url().should("include", firstAccount.id);
        });

        it("can change the selected account", () => {
            cy.get("@list").contains(secondAccount.name).click();
            cy.url().should("include", secondAccount.id);
        });
    });

    describe("Mobile", () => {
        beforeEach(() => {
            cy.mobileViewport();
            cy.visit(DerivedAppScreenUrls.ACCOUNTS);
            cy.selectDateRange("mobile", "All Time");

            cy.get(sharedSelectors.accounts.mobile.accountsList).as("list");
        });

        it("shows all of the users accounts", () => {
            accountNamesExist();
            accountBalancesExist();
        });

        it("doesn't go to the details view of the first account", () => {
            cy.url().should("eq", Cypress.config().baseUrl + DerivedAppScreenUrls.ACCOUNTS);
        });

        it("can go to the details view of the first account after clicking the first account", () => {
            cy.get("@list").contains(firstAccount.name).click();
            cy.url().should("include", firstAccount.id);
        });

        it("can change to the details view of a different account", () => {
            cy.get("@list").contains(secondAccount.name).click();
            cy.url().should("include", secondAccount.id);
        });
    });

    describe("Responsive", () => {
        it("should select the first account after switching from the mobile list to the desktop list", () => {
            cy.mobileViewport();
            cy.visit(DerivedAppScreenUrls.ACCOUNTS);

            cy.url().should("eq", Cypress.config().baseUrl + DerivedAppScreenUrls.ACCOUNTS);

            cy.desktopViewport();

            cy.url().should("include", firstAccount.id);
        });
    });
});

describe("Accounts and Type Filtering", () => {
    const accountsByType = seedData.ACCOUNTS.reduce(
        (acc, account) => {
            acc[account.type].push(account);
            return acc;
        },
        {asset: [], liability: [], income: [], expense: []} as {
            [key: string]: Array<typeof seedData.ACCOUNTS[0]>;
        }
    );

    const typeFilters = ["Assets", "Liabilities", "Income", "Expenses"];

    const typeMap = {
        asset: typeFilters[0],
        liability: typeFilters[1],
        income: typeFilters[2],
        expense: typeFilters[3]
    } as {[key: string]: string};

    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.ACCOUNTS);

            cy.changeViewport(viewport);

            // Want to only operate on all Accounts for test consistency's sake.
            cy.selectDateRange(viewport, "All Time");

            cy.get(sharedSelectors.accounts[viewport].accountsList).as("list");
            cy.get(selectors.typeFilters.container).as("typeFilters");
        });

        const toggleFilters = (filters: Array<string>) => {
            for (const filter of filters) {
                cy.get("@typeFilters").contains(filter, {matchCase: false}).click();
            }
        };

        it("can see only one type at a time", () => {
            // Disable all of the type filters.
            toggleFilters(typeFilters);

            // Enable each type one by one and check for the accounts.
            for (const type in accountsByType) {
                // Enable the type.
                cy.get("@typeFilters").contains(typeMap[type], {matchCase: false}).click();

                // Check for accounts.
                accountNamesExist(accountsByType[type]);

                // Make sure all other accounts don't show up.
                for (const notType in accountsByType) {
                    if (notType !== type) {
                        accountNamesDontExist(accountsByType[notType]);
                    }
                }

                // Disable the type before checking the next one.
                cy.get("@typeFilters").contains(typeMap[type], {matchCase: false}).click();
            }
        });

        it("can see no accounts when all filters are disabled", () => {
            // Disable all of the type filters.
            toggleFilters(typeFilters);

            // Make sure all accounts are gone.
            accountNamesDontExist(seedData.ACCOUNTS);
        });

        it("can see all accounts after toggling all of the filters twice", () => {
            // Disable all of the type filters.
            toggleFilters(typeFilters);

            // Re-enable all of the type filters.
            toggleFilters(typeFilters);

            // Make sure all accounts are present.
            accountNamesExist();
        });

        it("shows the current sum for each type", () => {
            // You just gotta take it on faith that these sums are correct.
            cy.get("@typeFilters").contains("10,035.99").should("exist");
            cy.get("@typeFilters").contains("453.98").should("exist");
            cy.get("@typeFilters").contains("3,715.65").should("exist");
            cy.get("@typeFilters").contains("533.64").should("exist");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Account Details", () => {
    before(() => {
        // Hedge against the database being left in an incorrect state
        // from the Account Deletion tests.
        cy.resetDb();
    });

    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.loginHeadless();
            cy.changeViewport(viewport);

            cy.visit(DerivedAppScreenUrls.ACCOUNTS);
            cy.selectDateRange(viewport, "All Time");

            cy.get(sharedSelectors.accounts[viewport].accountsList)
                .contains(firstAccount.name)
                .click();

            cy.get(selectors[viewport].details.transactions).as("transactions");
            cy.get(selectors.details.deleteAction).as("deleteAction");
            cy.get(selectors.details.editAction).as("editAction");
        });

        it("can see the account's transactions", () => {
            cy.get("@transactions").contains("Bought some dinner").should("exist");

            // Switch to the second account and check its transactions.
            // This is to test against a bug where the account ID was being incorrectly memoized and,
            // as a result, the transactions wouldn't actually change when changing accounts.
            if (viewport === "mobile") {
                // Need to use the Back Button instead of navigating directly using `cy.visit` to preserve
                // the All Time date range.
                cy.get(selectors["mobile"].details.backButton).click();
            }

            cy.get(sharedSelectors.accounts[viewport].accountsList)
                .contains(secondAccount.name)
                .click();
            cy.get("@transactions").contains("Salary from company").should("exist");
        });

        it("can edit an account", () => {
            cy.get("@editAction").click();

            // Make sure the URL changed to the Account Edit form.
            cy.url().should("include", DerivedAppModalUrls.ACCOUNT_FORM);
        });

        it("can delete an account", () => {
            cy.get("@deleteAction").click();

            // Make sure the modal dialog prompt popped up.
            cy.contains("Yes, Delete Account").should("exist");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");

        it("can go back to the accounts list", () => {
            cy.get(selectors["mobile"].details.backButton).click();

            // Should be back to the Accounts list.
            cy.url().should("eq", Cypress.config().baseUrl + DerivedAppScreenUrls.ACCOUNTS);
        });
    });
});

describe("Account Details - Balance Chart", () => {
    before(() => {
        // Hedge against the database being left in an incorrect state
        // from the Account Deletion tests.
        cy.resetDb();
    });

    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.loginHeadless();
            cy.visit(`${DerivedAppScreenUrls.ACCOUNTS}/${firstAccount.id}`);

            cy.changeViewport(viewport);
            cy.selectDateRange(viewport, "All Time");

            cy.get(selectors.chart.accountBalanceChart).as("chart");
        });

        it("can find the account's current balance", () => {
            cy.get("@chart").contains("$135.33").should("exist");
        });

        it("can find the account's 'From' balance", () => {
            cy.get("@chart").contains("from $150.00").should("exist");
        });

        it("can find the change from the 'From' balance to the current balance", () => {
            cy.get("@chart").contains("-9.78% ($14.67)").should("exist");
        });

        // TODO: Uncomment once we bring back Account interest.
        // it("can find the account's interest", () => {
        //     cy.get("@chart").contains("0.000%").should("exist");
        // });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});
