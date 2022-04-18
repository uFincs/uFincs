import {Viewport} from "../support/types";
import {seedData, sharedSelectors, DateService, ValueFormatting} from "./";

// We know what the first transaction should be, since the seed data conveniently has
// the transactions sorted by date, which is also how the table sorts them.
export const firstTransaction = seedData.TRANSACTIONS[0];

// Even though we currently have fewer transactions than what can be shown on a single page,
// we're just gonna slice it up anyways in case the number changes in the future.
export const paginatedTransactions = seedData.TRANSACTIONS.slice(0, 25);

export const newTransaction = {
    description: "New Transaction Description",
    amount: "123.45",
    notes: "these are some notes",
    date: "2020-07-25",
    type: "Expense",
    creditAccount: "Cash",
    debitAccount: "Food"
};

export const existingTransaction = {
    description: "Threw some money in savings",
    amount: "1000.00",
    notes: "",
    date: DateService.getTodayAsUTCString(),
    type: "Transfer",
    creditAccount: "Chequing",
    debitAccount: "Savings Account"
};

export const allTimeTransactions = (viewport: Viewport) => {
    cy.selectDateRange(viewport, "All Time");
};

export const getDescriptions = (transactions: typeof seedData.TRANSACTIONS) =>
    transactions.map(({description}) => description);

export const switchToSummaryTab = () => {
    cy.get(sharedSelectors.transactions.summary.tabs).contains("Summary").click();
    cy.wait(1000);
};

export const transactionsDontExist = (transactions: Array<{description: string}>) => {
    for (const transaction of transactions) {
        cy.get("@view").contains(transaction.description).should("not.exist");
    }
};

export const toggleFilters = (filters: Array<string>) => {
    for (const filter of filters) {
        cy.get(sharedSelectors.transactions.typeFilters.container)
            .contains(filter, {matchCase: false})
            .click();
    }
};
export const transactionExists = (transaction = newTransaction, {ignoreDate = false} = {}) => {
    cy.contains(transaction.description).should("exist");
    cy.contains(transaction.amount).should("exist");
    cy.contains(transaction.creditAccount).should("exist");
    cy.contains(transaction.debitAccount).should("exist");

    if (!ignoreDate) {
        cy.contains(ValueFormatting.formatDate(transaction.date)).should("exist");
    }
};
