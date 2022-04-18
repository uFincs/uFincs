import {
    seedData,
    sharedSelectors,
    transactionHelpers,
    AppNavigation,
    DerivedAppScreenUrls,
    DerivedAppModalUrls,
    NoAccount
} from "../support";
import {Viewport} from "../support/types";

const {
    firstTransaction,
    paginatedTransactions,
    allTimeTransactions,
    getDescriptions,
    switchToSummaryTab,
    toggleFilters,
    transactionsDontExist
} = transactionHelpers;

describe("Transactions Scene Empty State", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.resetDb();
            cy.signUp();

            cy.changeViewport(viewport);

            cy.visit(DerivedAppScreenUrls.DASHBOARD);
            cy.visit(DerivedAppScreenUrls.TRANSACTIONS);
        });

        it("shows an empty state with a button to add a new transaction", () => {
            // Note: These Transactions Scene Empty State tests have to come before
            // the rest of the tests, because if they come after, Cypress doesn't seem
            // to pick up the change in user account fast enough, so it thinks the
            // the transactions table is still in the DOM, even though it isn't.
            // Just try moving this set of tests below the Transactions Table tests and
            // you'll see what I mean.
            cy.get(sharedSelectors.transactions[viewport].view)
                .find(sharedSelectors.transactions.list.emptyList)
                .contains("Add Transaction")
                .click();

            cy.url().should("include", DerivedAppModalUrls.TRANSACTION_FORM);
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Transactions and Date Range Picker", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.TRANSACTIONS);

            cy.changeViewport(viewport);

            cy.get(sharedSelectors.transactions[viewport].view).as("view");
            cy.get(sharedSelectors.dateRangePicker.dateSwitcher).as("dateSwitcher");
        });

        const startDateInput = () =>
            cy.get("@dateSwitcher").find(sharedSelectors.dateRangePicker.startDateInput);

        const endDateInput = () =>
            cy.get("@dateSwitcher").find(sharedSelectors.dateRangePicker.endDateInput);

        const incrementButton = () =>
            cy.get("@dateSwitcher").find(sharedSelectors.dateRangePicker.incrementButton);

        const decrementButton = () =>
            cy.get("@dateSwitcher").find(sharedSelectors.dateRangePicker.decrementButton);

        const setStartDate = (date: string) => {
            startDateInput().type(date);
        };

        const setEndDate = (date: string) => {
            endDateInput().type(date);
        };

        const incrementDateRange = () => {
            incrementButton().click();
        };

        const decrementDateRange = () => {
            decrementButton().click();
        };

        it("can see transactions from All Time", () => {
            cy.selectDateRange(viewport, "All Time");

            // Look, I don't know why Cypress doesn't pick up that the transactions exist (even though
            // they clearly show up in the DOM snapshots), but it just doesn't, but _only_ for the first
            // test here. Adding a small wait seems to fix it, so screw it, throw a wait in here!
            cy.wait(1000);

            cy.transactionsExist(viewport, getDescriptions(paginatedTransactions));
        });

        it("can see yearly transactions", () => {
            // Go to 2019.
            setEndDate("2019-12-31");
            cy.selectDateRange(viewport, "Yearly");

            cy.transactionsExist(viewport, getDescriptions(paginatedTransactions));
        });

        it("can see monthly transactions", () => {
            // Go to December 2019.
            setEndDate("2019-12-31");
            cy.selectDateRange(viewport, "Monthly");

            // Decrement 9 times to get to March 2019, which is where (most) the transactions are.
            // This is really just to test that the decrement button works.
            for (let i = 0; i < 9; i++) {
                decrementDateRange();
            }

            // Make sure the transactions for March exist.
            const marchTransactions = paginatedTransactions.filter(({date}) => {
                const fullDate = new Date(date);
                return fullDate.getUTCMonth() === 2;
            });

            cy.transactionsExist(viewport, getDescriptions(marchTransactions));
        });

        it("can see weekly transactions", () => {
            // Go to February 2019.
            setStartDate("2019-02-01");
            setEndDate("2019-02-07");

            // Set the range to Weekly.
            // This is technically redundant since setting both the dates above should change
            // the range size to weekly, but eh, why not.
            cy.selectDateRange(viewport, "Weekly");

            // Increment 3 times to get to the last week in February.
            // This is really just to test the increment button.
            for (let i = 0; i < 3; i++) {
                incrementDateRange();
            }

            // Make sure the transactions for the last week of February exist.
            const febTransactions = paginatedTransactions.filter(({date}) => {
                const fullDate = new Date(date);
                return fullDate.getUTCMonth() === 1 && fullDate.getUTCDate() >= 22;
            });

            cy.transactionsExist(viewport, getDescriptions(febTransactions));
        });

        it("can see daily transactions", () => {
            // Go to February 15, 2019.
            setEndDate("2019-02-15");
            cy.selectDateRange(viewport, "Daily");

            // Make sure the transactions for the day.
            const febTransactions = paginatedTransactions.filter(({date}) => {
                const fullDate = new Date(date);
                return fullDate.getUTCMonth() === 1 && fullDate.getUTCDate() === 15;
            });

            cy.transactionsExist(viewport, getDescriptions(febTransactions));
        });

        it("can see a custom range of transactions", () => {
            // Go to the first half of 2019.
            setStartDate("2019-01-01");
            setEndDate("2019-07-01");

            // Make sure all the transactions exist.
            cy.transactionsExist(viewport, getDescriptions(paginatedTransactions));
        });

        it("can't change the dates when the range is set to 'All Time'", () => {
            // Set some baseline dates.
            setStartDate("2019-01-01");
            setEndDate("2019-07-01");

            // Change to All Time.
            cy.selectDateRange(viewport, "All Time");

            // All of the date switcher elements should be disabled.
            startDateInput().should("be.disabled");
            endDateInput().should("be.disabled");
            incrementButton().should("be.disabled");
            decrementButton().should("be.disabled");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Transactions and Searching", () => {
    const tests = (viewport: Viewport) => {
        before(() => {
            cy.resetDb();
        });

        beforeEach(() => {
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.TRANSACTIONS);

            cy.changeViewport(viewport);

            // Want to only operate on all Transactions for test consistency's sake.
            cy.selectDateRange(viewport, "All Time");

            cy.get(sharedSelectors.transactions.searchInput).as("searchInput");
        });

        it("can filter the list of transactions by description", () => {
            // Find the two 'Salary' transactions.
            cy.get("@searchInput").type("sal");

            cy.get(sharedSelectors.transactions[viewport].item).should("have.length", 2);
            cy.contains("Mar 1, 2019");
            cy.contains("Feb 15, 2019");

            // Make sure the type amounts also changed.
            cy.get(sharedSelectors.transactions.typeFilters.container).contains("$3,700.90");
        });

        it("can find no transactions when using unknown queries", () => {
            cy.get("@searchInput").type("dlgksjdfglksdbjgf");

            cy.get(sharedSelectors.transactions[viewport].item).should("have.length", 0);
        });

        it("can still have type filters applied after searching", () => {
            cy.get("@searchInput").type("bough");

            // The 3 transactions should be present.
            cy.get(sharedSelectors.transactions[viewport].item).should("have.length", 3);

            // Remove the debts.
            toggleFilters(["debts"]);

            // There should now be only 1 transaction.
            cy.get(sharedSelectors.transactions[viewport].item).should("have.length", 1);
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Transactions Custom Pagination Size", () => {
    const tests = (viewport: Viewport) => {
        before(() => {
            cy.resetDb();
        });

        beforeEach(() => {
            // The easiest way for us to get a bunch of transactions to test with is through the demo mode.
            NoAccount.login({demoData: true});

            cy.changeViewport(viewport);
            AppNavigation.gotoTransactions(viewport);

            // Want to only operate on all Transactions for test consistency's sake.
            cy.selectDateRange(viewport, "All Time");
        });

        it("can change the pagination size", () => {
            cy.get(sharedSelectors.paginationPageSize).select("100");
            cy.contains("1 - 100").should("exist");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Transactions and Type Filtering", () => {
    const transactionsByType = seedData.TRANSACTIONS.reduce(
        (acc, transaction) => {
            acc[transaction.type].push(transaction);
            return acc;
        },
        {income: [], expense: [], debt: [], transfer: []} as {
            [key: string]: Array<typeof seedData.TRANSACTIONS[0]>;
        }
    );

    const typeFilters = ["Income", "Expenses", "Debts", "Transfers"];

    const typeMap = {
        income: typeFilters[0],
        expense: typeFilters[1],
        debt: typeFilters[2],
        transfer: typeFilters[3]
    } as {[key: string]: string};

    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.TRANSACTIONS);

            cy.changeViewport(viewport);

            // Want to only operate on all Transactions for test consistency's sake.
            cy.selectDateRange(viewport, "All Time");

            cy.get(sharedSelectors.transactions[viewport].view).as("view");
            cy.get(sharedSelectors.transactions.typeFilters.container).as("typeFilters");
        });

        it("can see only one type at a time", () => {
            // Disable all of the type filters.
            toggleFilters(typeFilters);

            // Enable each type one by one and check for the transactions.
            for (const type in transactionsByType) {
                // Enable the type.
                cy.get("@typeFilters").contains(typeMap[type], {matchCase: false}).click();

                // Check for transactions.
                cy.transactionsExist(viewport, getDescriptions(transactionsByType[type]));

                // Make sure all other transactions don't show up.
                for (const notType in transactionsByType) {
                    if (notType !== type) {
                        transactionsDontExist(transactionsByType[notType]);
                    }
                }

                // Disable the type before checking the next one.
                cy.get("@typeFilters").contains(typeMap[type], {matchCase: false}).click();
            }
        });

        it("can see no transactions when all filters are disabled", () => {
            // Disable all of the type filters.
            toggleFilters(typeFilters);

            // Make sure all transactions are gone.
            transactionsDontExist(seedData.TRANSACTIONS);
        });

        it("can see all transactions after toggling all of the filters twice", () => {
            // Disable all of the type filters.
            toggleFilters(typeFilters);

            // Re-enable all of the type filters.
            toggleFilters(typeFilters);

            // Make sure all transactions are present.
            cy.transactionsExist(viewport, getDescriptions(seedData.TRANSACTIONS));
        });

        it("shows the current sum for each type", () => {
            // You just gotta take it on faith that these sums are correct.
            cy.get("@typeFilters").contains("3,715.65").should("exist");
            cy.get("@typeFilters").contains("79.66").should("exist");
            cy.get("@typeFilters").contains("453.98").should("exist");
            cy.get("@typeFilters").contains("1,000.00").should("exist");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Transactions Table and Sorting", () => {
    // The Transactions Table only exists on desktop, so these tests only operate on desktop.
    beforeEach(() => {
        cy.loginHeadless();
        cy.visit(DerivedAppScreenUrls.TRANSACTIONS);

        cy.changeViewport("desktop");

        cy.selectDateRange("desktop", "All Time");

        cy.get(sharedSelectors.transactions["desktop"].view).as("view");
    });

    it("can sort by something other than date (e.g. description)", () => {
        // The first transaction, when sorting by date descending, should be "Bought some dinner".
        cy.get(sharedSelectors.transactions["desktop"].item)
            .first()
            .contains(firstTransaction.description)
            .should("exist");

        // Change the sorting to description ascending.
        cy.get(sharedSelectors.transactions["desktop"].tableColumnDescription).click();

        const descriptionSorted = seedData.TRANSACTIONS.sort((a, b) =>
            a.description < b.description ? -1 : 1
        );

        // The first transaction should now be "Bought a Dell Ultrasharp monitor".
        cy.get(sharedSelectors.transactions["desktop"].item)
            .first()
            .contains(descriptionSorted[0].description)
            .should("exist");

        // Change the sorting to description descending.
        cy.get(sharedSelectors.transactions["desktop"].tableColumnDescription).click();

        // The first transaction should now be "Went out to the pub with friends".
        cy.get(sharedSelectors.transactions["desktop"].item)
            .first()
            .contains(descriptionSorted.reverse()[0].description)
            .should("exist");
    });

    // This test should, by proxy, ensure that the 'To' column also works.
    it("can sort by the 'From' columns", () => {
        // Change the sorting to From ascending.
        cy.get(sharedSelectors.transactions["desktop"].tableColumnFrom).click();

        // The first transaction should be "Bought some dinner".
        cy.get(sharedSelectors.transactions["desktop"].item)
            .first()
            .contains("Bought some dinner")
            .should("exist");

        // Change the sorting to From descending.
        cy.get(sharedSelectors.transactions["desktop"].tableColumnFrom).click();

        // The first transaction should now be "Salary from company".
        cy.get(sharedSelectors.transactions["desktop"].item)
            .first()
            .contains("Salary from company")
            .should("exist");
    });
});

describe("Transactions Summary", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            cy.resetDb();
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.TRANSACTIONS);

            cy.changeViewport(viewport);
            allTimeTransactions(viewport);

            if (viewport === "mobile") {
                switchToSummaryTab();
            }

            cy.get(sharedSelectors.transactions.summary.container).as("container");
        });

        const valueExists = (value: string) => {
            cy.get("@container").contains(value).should("exist");
        };

        it("can see all of the transactions summary info", () => {
            // Can see the headers.
            valueExists("Income Summary");
            valueExists("Expenses Summary");
            valueExists("Cash Flow");

            // Can see the account balances.
            valueExists("Salary");
            valueExists("$3,700.90");

            valueExists("Interest");
            valueExists("$14.75");

            valueExists("Tech");
            valueExists("$463.97");

            valueExists("Food");
            valueExists("$69.67");

            // Can see the total cash flow.
            valueExists("$3,182.01");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Transaction Deletion", () => {
    const deletionTests = (viewport: Viewport) => {
        const deleteTransaction = () => {
            // Make sure that the transaction exists.
            cy.contains(firstTransaction.description).should("exist");

            if (viewport === "mobile") {
                // Need to open the actions on mobile.
                cy.get(sharedSelectors.transactions.mobile.actionOverflow).first().click();
            }

            // Delete the transaction.
            cy.get(sharedSelectors.transactions[viewport].actionDelete).first().click();
        };

        beforeEach(() => {
            cy.resetDb();
            cy.loginHeadless();
            cy.visit(DerivedAppScreenUrls.TRANSACTIONS);

            cy.changeViewport(viewport);

            allTimeTransactions(viewport);
            cy.get(sharedSelectors.transactions[viewport].view).as("view");
        });

        it("can delete the transaction", () => {
            deleteTransaction();

            // Transaction shouldn't be in the view anymore.
            cy.get("@view").contains(firstTransaction.description).should("not.exist");
        });

        it("can undo deletion of the transaction", () => {
            deleteTransaction();

            // Undo deletion.
            cy.get(sharedSelectors.toastMessages).contains("Undo").click();

            // Transaction should now be in list.
            cy.get("@view").contains(firstTransaction.description).should("exist");

            // Should get a success toast.
            cy.contains("Undo successful").should("exist");
        });
    };

    describe("Desktop", () => {
        deletionTests("desktop");
    });

    describe("Mobile", () => {
        deletionTests("mobile");
    });
});
