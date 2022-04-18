import {Viewport} from "../support/types";

const defaultSelectedAccounts = [
    {name: "Chequing Account", openingBalance: "$0.00"},
    {name: "Cash", openingBalance: "$0.00"},
    {name: "Savings Account", openingBalance: "$0.00"},
    {name: "Credit Card", openingBalance: "$0.00"},
    {name: "Mortgage", openingBalance: "$0.00"},
    {name: "Line of Credit", openingBalance: "$0.00"},
    {name: "Salary", openingBalance: "$0.00"},
    {name: "Interest", openingBalance: "$0.00"},
    {name: "Other Income", openingBalance: "$0.00"},
    {name: "Rent", openingBalance: "$0.00"},
    {name: "Groceries", openingBalance: "$0.00"},
    {name: "Takeout", openingBalance: "$0.00"}
];

const selectors = {
    navigation: {
        footer: "[data-testid=step-navigation-footer]",
        mobileProgressStepper: "[data-testid=mobile-progress-stepper]",
        back: "[data-testid=step-navigation-back-button]",
        next: "[data-testid=step-navigation-next-button]"
    },
    accountsList: {
        item: "[data-testid=selectable-accounts-list-item]",
        checkbox: "[data-testid=selectable-accounts-list-item-checkbox]",
        nameInput: "[data-testid=selectable-accounts-list-item-name]",
        balanceInput: "[data-testid=selectable-accounts-list-item-balance]"
    }
};

const Navigation = {
    goBackStep(viewport: Viewport) {
        if (viewport === "mobile") {
            cy.get(selectors.navigation.mobileProgressStepper)
                .find(selectors.navigation.back)
                .click();
        } else {
            cy.get(selectors.navigation.footer).find(selectors.navigation.back).click();
        }

        // Need to wait through the screen change delay.
        cy.wait(1000);
    },
    goNextStep(viewport: Viewport) {
        if (viewport === "mobile") {
            cy.get(selectors.navigation.mobileProgressStepper)
                .find(selectors.navigation.next)
                .click();
        } else {
            cy.get(selectors.navigation.footer).find(selectors.navigation.next).click();
        }

        // Need to wait through the screen change delay.
        cy.wait(1000);
    },
    skipOnboarding() {
        cy.contains("Skip Setup").click();

        // Need to wait through the screen change delay.
        cy.wait(1000);
    }
};

const WelcomeStep = {
    gotoOnboarding() {
        cy.contains("Let's go!").click();
    }
};

const AccountsStep = {
    createAccount(type: string) {
        cy.contains(`Add ${type} Account`, {matchCase: false}).click();

        // Need to wait out the animation for adding an account.
        cy.wait(1500);
    },
    toggleAccountSelection(row: number) {
        cy.get(selectors.accountsList.checkbox).eq(row).click();
    },
    uncheckAccounts(type: string) {
        switch (type) {
            case "asset":
                this.toggleAccountsSelection([0, 1, 2]);
                break;
            case "liability":
                this.toggleAccountsSelection([0, 1, 3]);
                break;
            case "income":
                this.toggleAccountsSelection([0, 2, 3]);
                break;
            case "expense":
                this.toggleAccountsSelection([0, 2, 3]);
                break;
            default:
                return;
        }
    },
    toggleAccountsSelection(rows: Array<number>) {
        for (const row of rows) {
            this.toggleAccountSelection(row);
        }
    },
    balanceInput(row: number) {
        return cy.get(selectors.accountsList.balanceInput).eq(row);
    },
    nameInput(row: number) {
        return cy.get(selectors.accountsList.nameInput).eq(row);
    },
    enterBalance(row: number, balance: string) {
        this.balanceInput(row).clear().type(balance);
    },
    enterName(row: number, name: string) {
        this.nameInput(row).clear().type(name);
    }
};

const FinishStep = {
    checkAccounts(accounts: Array<{name: string; openingBalance: string}>) {
        for (const account of accounts) {
            cy.contains(account.name).should("exist");
            cy.contains(account.openingBalance).should("exist");
        }
    }
};

const baseBeforeEach = (viewport: Viewport) => {
    cy.resetDb();
    cy.changeViewport(viewport);

    cy.signUp({skipOnboarding: false});

    WelcomeStep.gotoOnboarding();
};

describe("Onboarding Process", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            baseBeforeEach(viewport);
        });

        it("can onboard by accepting all of the default accounts", () => {
            // Skip through doing anything during onboarding.
            Navigation.goNextStep(viewport);
            Navigation.goNextStep(viewport);
            Navigation.goNextStep(viewport);
            Navigation.goNextStep(viewport);

            // Finish onboarding.
            FinishStep.checkAccounts(defaultSelectedAccounts);

            // I don't know why, but this test specifically needs an extra wait before clicking
            // the final Next button, otherwise it fails under headless Electron.
            // Works fine otherwise in Chrome/Firefox, and the rest of the tests work fine in
            // terms of clicking the final Next button. It's literally just this test that
            // it fails because it says there are multiple elements to be clicked.
            // Also, it only happens on desktop.
            cy.wait(1000);
            Navigation.goNextStep(viewport);

            // Should be redirected to the dashboard.
            cy.contains("Dashboard").should("exist");
        });

        it("can create new accounts and change names/balances during onboarding", () => {
            const newAccounts = [
                {name: "An Asset Account", openingBalance: "123.45"},
                {name: "A Liability Account", openingBalance: "678.90"},
                {name: "An Income Account", openingBalance: "0.00"},
                {name: "An Expense Account", openingBalance: "0.00"}
            ];

            // Uncheck the existing accounts.
            AccountsStep.uncheckAccounts("asset");

            // Create a new asset account.
            AccountsStep.createAccount("asset");
            AccountsStep.enterName(4, newAccounts[0].name);
            AccountsStep.enterBalance(4, newAccounts[0].openingBalance);

            Navigation.goNextStep(viewport);

            // Uncheck the existing accounts.
            AccountsStep.uncheckAccounts("liability");

            // Create a new liability account.
            AccountsStep.createAccount("liability");
            AccountsStep.enterName(4, newAccounts[1].name);
            AccountsStep.enterBalance(4, newAccounts[1].openingBalance);

            Navigation.goNextStep(viewport);

            // Uncheck the existing accounts.
            AccountsStep.uncheckAccounts("income");

            // Create a new income account.
            AccountsStep.createAccount("income");
            AccountsStep.enterName(4, newAccounts[2].name);

            // Seems like the Next error validation is slightly too slow, and clicking through too
            // fast will make it think there's an error when there isn't.
            cy.wait(1500);

            Navigation.goNextStep(viewport);

            // Uncheck the existing accounts.
            AccountsStep.uncheckAccounts("expense");

            // Create a new income account.
            AccountsStep.createAccount("expense");
            AccountsStep.enterName(4, newAccounts[3].name);

            // Seems like the Next error validation is slightly too slow, and clicking through too
            // fast will make it think there's an error when there isn't.
            cy.wait(1500);

            Navigation.goNextStep(viewport);

            // Make sure we have the right accounts.
            FinishStep.checkAccounts(newAccounts);

            Navigation.goNextStep(viewport);

            // Should be redirected to the dashboard.
            cy.contains("Dashboard").should("exist");
        });

        it("can skip the onboarding process", () => {
            Navigation.skipOnboarding();

            // Should be redirected to the dashboard.
            cy.contains("Dashboard").should("exist");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});

describe("Edge Cases", () => {
    const tests = (viewport: Viewport) => {
        beforeEach(() => {
            baseBeforeEach(viewport);
        });

        it("forces at least 1 account to be selected", () => {
            // Uncheck the accounts.
            AccountsStep.uncheckAccounts("asset");

            // 'Click' the Next button to show the error message.
            Navigation.goNextStep(viewport);

            cy.contains("You need at least 1 selected asset account");
        });

        it("forces all selected accounts to have a non-empty name", () => {
            // Clear the first account's name.
            AccountsStep.nameInput(0).clear();

            // IDK, race condition where the Next button doesn't disable fast enough.
            // Waiting allows it to be disabled.
            cy.wait(1000);

            // 'Click' the Next button to show the error message.
            Navigation.goNextStep(viewport);

            cy.contains("One or more selected accounts have an empty name");
        });
    };

    describe("Desktop", () => {
        tests("desktop");
    });

    describe("Mobile", () => {
        tests("mobile");
    });
});
