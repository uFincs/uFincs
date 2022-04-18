import {DerivedAppScreenUrls} from "../support";
import {Viewport} from "../support/types";

const selectors = {
    accountSummaries: "[data-testid=account-summaries]",
    incomeExpenseChart: "[data-testid=income-expense-chart]",
    netWorthChart: "[data-testid=net-worth-chart]",
    recentTransactionsList: "[data-testid=recent-transactions-list]"
};

describe("Account Summaries", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.DASHBOARD);

            cy.changeViewport(viewport);

            // Set the date range to all time so that the tests aren't date dependent.
            cy.selectDateRange(viewport, "All Time");

            cy.get(selectors.accountSummaries).as("accountSummaries");
        });

        it("can see the total assets", () => {
            cy.get("@accountSummaries").contains("$10,035.99").should("exist");
        });

        it("can see the total liabilities", () => {
            cy.get("@accountSummaries").contains("$453.98").should("exist");
        });

        it("can see the total income", () => {
            cy.get("@accountSummaries").contains("$3,715.65").should("exist");
        });

        it("can see the total expenses", () => {
            cy.get("@accountSummaries").contains("$533.64").should("exist");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Net Worth Chart", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.DASHBOARD);

            cy.changeViewport(viewport);

            // Set the date range to all time so that the tests aren't date dependent.
            cy.selectDateRange(viewport, "All Time");

            cy.get(selectors.netWorthChart).as("chart");
        });

        it("can find the current net worth", () => {
            cy.get("@chart").contains("$9,582.01").should("exist");
        });

        it("can find the net worth's 'From' amount", () => {
            cy.get("@chart").contains("from $6,400.00").should("exist");
        });

        it("can find the change from the 'From' amount to the current net worth", () => {
            cy.get("@chart").contains("+49.72% ($3,182.01)").should("exist");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Income/Expense Chart", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.DASHBOARD);

            cy.changeViewport(viewport);

            // Set the date range to all time so that the tests aren't date dependent.
            cy.selectDateRange(viewport, "All Time");

            cy.get(selectors.incomeExpenseChart).as("chart");
        });

        it("can find the current income amount", () => {
            cy.get("@chart").contains("$3,715.65").should("exist");
        });

        it("can find the current expense amount", () => {
            cy.get("@chart").contains("$533.64").should("exist");
        });

        it("can find the change from the 'From' amount to the current income amount", () => {
            cy.get("@chart").contains("+Infinity% ($3,715.65)").should("exist");
        });

        it("can find the change from the 'From' amount to the current expense amount", () => {
            cy.get("@chart").contains("+Infinity% ($533.64)").should("exist");
        });

        it("can find the 'From' amount (which is always 0 cause that's how income/expense works)", () => {
            cy.get("@chart").contains("from $0.00").should("exist");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Recent Transactions", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.DASHBOARD);

            cy.changeViewport(viewport);

            // Set the date range to all time so that the tests aren't date dependent.
            cy.selectDateRange(viewport, "All Time");

            cy.get(selectors.recentTransactionsList).as("list");
        });

        it("can see the 5 most recent transactions", () => {
            cy.get("@list").contains("Bought some dinner").should("exist");
            cy.get("@list").contains("Went out to the pub with friends").should("exist");
            cy.get("@list").contains("Got an HDMI cable for the monitor").should("exist");
            cy.get("@list").contains("Bought a new SSD for my desktop").should("exist");
            cy.get("@list").contains("Bought a Dell Ultrasharp monitor").should("exist");
        });

        it("doesn't see any other transaction", () => {
            cy.get("@list").contains("Salary from company").should("not.exist");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});
