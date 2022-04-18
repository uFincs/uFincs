import {
    seedData,
    sharedSelectors,
    testData,
    DerivedAppScreenUrls,
    GlobalAddButton
} from "../support";
import {Viewport} from "../support/types";

export interface SummaryStats {
    accountName?: string;
    balanceChange?: string;
    profileName?: string;
    numberOfTransactions?: number;
}

// These descriptions _must_ match those found in `fixtures/${testData.csvFile}`.
export const transactionDescriptions = [
    "Payroll",
    "Customer Transfer",
    "Interest",
    "Savings",
    "Credit Card",
    "Bill Payment"
];

export const numberOfFileTransactions = transactionDescriptions.length;

const {firstAccount, firstImportProfile} = seedData;

const selectors = {
    navigation: {
        footer: "[data-testid=step-navigation-footer]",
        mobileProgressStepper: "[data-testid=mobile-progress-stepper]",
        back: "[data-testid=step-navigation-back-button]",
        next: "[data-testid=step-navigation-next-button]"
    },
    chooseAccount: {
        step: "[data-testid=choose-account-step]",
        inputAccount: "[data-testid=choose-account-step-account-input]"
    },
    chooseFile: {
        inputFile: "[data-testid=choose-file-step-file-input]"
    },
    mapCsv: {
        existingProfile: {
            inputProfile: "[data-testid=map-csv-step-existing-profile-input]"
        },
        newProfile: {
            inputProfileName: "[data-testid=map-csv-step-new-profile-name-input]",
            desktop: {
                mappingView: "[data-testid=csv-mapping-table]",
                mappingInput: "[data-testid=csv-mapping-table-input]"
            },
            mobile: {
                mappingView: "[data-testid=csv-mapping-list]",
                mappingInput: "[data-testid=csv-mapping-list-input]"
            }
        }
    },
    bulkActions: {
        selectAllCheckbox: "input[type=checkbox]:visible",
        desktop: {
            container: "[data-testid=desktop-bulk-transaction-actions]"
        },
        mobile: {
            container: "[data-testid=mobile-bulk-transaction-actions]"
        }
    },
    bulkActionDialogs: {
        account: "[data-testid=bulk-action-dialog-account]",
        amount: "[data-testid=bulk-action-dialog-amount]",
        date: "[data-testid=bulk-action-dialog-date]",
        description: "[data-testid=bulk-action-dialog-description]",
        type: "[data-testid=bulk-action-dialog-type]",
        inputs: {
            account: "input",
            amount: "input",
            date: "input",
            description: "input",
            type: sharedSelectors.transactions.typePicker
        }
    },
    summary: {
        stats: "[data-testid=summary-step-stats]"
    }
};

export const Navigation = {
    goBackStep(viewport: Viewport) {
        if (viewport === "mobile") {
            cy.get(selectors.navigation.mobileProgressStepper)
                .find(selectors.navigation.back)
                .click();
        } else {
            cy.get(selectors.navigation.footer).find(selectors.navigation.back).click();
        }

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

        cy.wait(1000);
    }
};

export const ChooseAccountStep = {
    clickType(type: string) {
        cy.contains(type, {matchCase: false}).click();
    },
    selectAccount(name: string) {
        return cy.get(selectors.chooseAccount.inputAccount).select(name);
    },
    fillOut({name, type} = firstAccount) {
        this.clickType(type);
        this.selectAccount(name);
    },
    isOnStep() {
        cy.get(selectors.chooseAccount.step).should("exist");
    }
};

export const ChooseFileStep = {
    uploadFile(fileName: string) {
        cy.get(selectors.chooseFile.inputFile).attachFile(fileName);
    },
    fillOut({fileName = testData.csvFile, isValidFile = true} = {}) {
        this.uploadFile(fileName);

        if (isValidFile) {
            // Make sure the file name is displayed to the user.
            cy.contains(fileName).should("exist");

            // Make sure the success message shows up with the number of possible transactions.
            cy.contains("found 6 possible transactions").should("exist");
        }
    }
};

export const MapCsvStep = {
    switchToExistingTab() {
        cy.contains("Use Existing Format").click();
    },
    switchToNewTab() {
        cy.contains("Create New Format").click();
    },
    existingProfile: {
        useExistingProfile({name = seedData.firstImportProfile.name} = {}) {
            cy.get(selectors.mapCsv.existingProfile.inputProfile).select(name);
        }
    },
    newProfile: {
        selectField(column: number, field: string, viewport: "desktop" | "mobile") {
            const newProfileSelectors = selectors.mapCsv.newProfile[viewport];

            cy.get(newProfileSelectors.mappingView)
                .find(newProfileSelectors.mappingInput)
                .eq(column)
                .select(field);
        },
        fillOutNewProfile(name: string, viewport: "desktop" | "mobile") {
            cy.get(selectors.mapCsv.newProfile.inputProfileName).type(name);

            this.selectField(0, "Date", viewport);
            this.selectField(1, "Amount", viewport);
            this.selectField(3, "Description", viewport);
            this.selectField(4, "Account", viewport);
        },
        successToastExists(name: string) {
            cy.contains(`Created CSV format "${name}"!`);
        }
    }
};

export const AdjustTransactionsStep = {
    openActiveRules() {
        cy.contains("Active Import Rules").click({force: true});
    },
    openImportForm() {
        cy.contains("Add Rule").click({force: true});
    },
    toggleRuleEnablement() {
        cy.contains("Enable Rules").click({force: true});
    },
    openMobileActionsDropdown() {
        // Use force: true because I ran into an error once where the actions were covered up and couldn't
        // be clicked on mobile.
        cy.contains("Bulk Actions").click({force: true});
    },
    clickAction(action: string, viewport: "desktop" | "mobile") {
        if (viewport === "mobile") {
            this.openMobileActionsDropdown();
        }

        // Force click the action to deal with the potential for the action being 'detached' from the DOM
        // because of the rendering of the sticky actions into a portal.
        cy.get(selectors.bulkActions[viewport].container).contains(action).click({force: true});
    },
    fillOutDialog(action: "account" | "amount" | "date" | "description", property: string) {
        cy.get(selectors.bulkActionDialogs[action])
            .find(selectors.bulkActionDialogs.inputs[action])
            // Force type because of the same detached DOM problem as above.
            .type(property, {force: true});

        cy.get(selectors.bulkActionDialogs[action]).contains("Change").click({force: true});
    },
    changeAccount(name: string, viewport: "desktop" | "mobile") {
        this.clickAction("Change Account", viewport);
        this.fillOutDialog("account", name);
    },
    changeAmount(amount: string, viewport: "desktop" | "mobile") {
        this.clickAction("Change Amount", viewport);
        this.fillOutDialog("amount", amount);
    },
    changeDate(date: string, viewport: "desktop" | "mobile") {
        this.clickAction("Change Date", viewport);
        this.fillOutDialog("date", date);
    },
    changeDescription(description: string, viewport: "desktop" | "mobile") {
        this.clickAction("Change Description", viewport);
        this.fillOutDialog("description", description);
    },
    changeType(type: string, viewport: "desktop" | "mobile") {
        this.clickAction("Change Type", viewport);

        cy.get(sharedSelectors.transactions.typePicker).contains(type).click({force: true});
        cy.get(selectors.bulkActionDialogs.type).contains("Change").click({force: true});
    },
    excludeFromImport(viewport: "desktop" | "mobile") {
        this.clickAction("Exclude from Import", viewport);
    },
    includeInImport(viewport: "desktop" | "mobile") {
        this.clickAction("Include in Import", viewport);
    },
    selectTransaction(index: number, viewport: "desktop" | "mobile") {
        cy.get(sharedSelectors.transactions[viewport].item).eq(index).click();
    },
    selectTransactions(indexes: Array<number>, viewport: "desktop" | "mobile") {
        for (const index of indexes) {
            this.selectTransaction(index, viewport);
        }
    },
    selectAllTransactions() {
        cy.get(selectors.bulkActions.selectAllCheckbox).first().click();
    },
    fillOutForAsset(
        viewport: Viewport,
        {
            incomeAccount = seedData.accountsByType["income"][0].name,
            expenseAccount = seedData.accountsByType["expense"][0].name
        } = {}
    ) {
        // We know that the first and third transactions are the same type.
        // See the `validTransactions.csv` fixture.
        this.selectTransactions([0, 2], viewport);
        this.changeAccount(incomeAccount, viewport);

        // We know that the second, fourth, fifth, and sixth transactions are the same (but different) type.
        this.selectTransactions([1, 3, 4, 5], viewport);
        this.changeAccount(expenseAccount, viewport);
    },
    fillOutForLiability(viewport: "desktop" | "mobile") {
        this.selectTransactions([0, 2], viewport);
        this.changeAccount(seedData.accountsByType["expense"][0].name, viewport);

        this.selectTransactions([1, 3, 4, 5], viewport);
        this.changeAccount(seedData.accountsByType["asset"][0].name, viewport);
    }
};

export const SummaryStep = {
    statExists(stat: string) {
        cy.get(selectors.summary.stats).contains(stat);
    },
    checkBaseStats(
        profileName: string,
        numberOfTransactions: number,
        viewport: "desktop" | "mobile"
    ) {
        this.statExists(testData.csvFile);
        this.statExists(profileName);

        // Number of new transactions.
        this.statExists(`${numberOfTransactions}`);

        // Check to make sure transactions exist.
        cy.get(sharedSelectors.transactions[viewport].item).should(
            "have.length",
            numberOfTransactions
        );
    },
    checkStats(
        viewport: "desktop" | "mobile",
        {
            accountName = firstAccount.name,
            balanceChange = "$349.50",
            profileName = firstImportProfile.name,
            numberOfTransactions = numberOfFileTransactions
        }: SummaryStats = {}
    ) {
        this.checkBaseStats(profileName, numberOfTransactions, viewport);

        this.statExists(accountName);
        this.statExists(balanceChange); // Net balance change.
    }
};

const gotoTransactions = (viewport: "desktop" | "mobile") => {
    // I don't know; it needs a second to actually import the transactions; if we try to access them too
    // soon, they're just not there...
    cy.wait(1000);

    cy.visit(DerivedAppScreenUrls.TRANSACTIONS);
    cy.selectDateRange(viewport, "All Time");
};

export const gotoCSVImport = (viewport: Viewport) => {
    GlobalAddButton.importTransactions(viewport);

    // Ever since the introduction of the Import Overview, we must now explicitly
    // choose the type of import to perform. These tests will assume a CSV import
    // (since that is currently the only option).
    cy.contains("CSV File").click();

    cy.url().should("include", DerivedAppScreenUrls.TRANSACTIONS_IMPORT);
};

export const verifyTransactionsImported = (
    viewport: "desktop" | "mobile",
    properties: Array<string> = transactionDescriptions
) => {
    gotoTransactions(viewport);
    cy.transactionsExist(viewport, properties);
};

export const verifyBulkTransactionsProperty = (
    viewport: "desktop" | "mobile",
    property: string,
    numberOfTransactions: number,
    {useView = false, checkTypes = false} = {}
) => {
    gotoTransactions(viewport);

    if (useView) {
        cy.get(`${sharedSelectors.transactions[viewport].view}:contains(${property})`).should(
            "have.length",
            numberOfTransactions
        );
    } else if (checkTypes) {
        cy.get(sharedSelectors.transactions[viewport].view)
            .get(`${sharedSelectors.transactions.typeIcon}--${property}`)
            .should("have.length.at.least", numberOfTransactions);
    } else {
        cy.get(sharedSelectors.transactions[viewport].view)
            .get(`${sharedSelectors.transactions[viewport].item}:contains(${property})`)
            .should("have.length", numberOfTransactions);
    }
};

export const firstSteps = (viewport: "desktop" | "mobile", {fillOut = true} = {}) => {
    // First step: choose an account.
    ChooseAccountStep.fillOut();
    Navigation.goNextStep(viewport);

    // Second step: upload file.
    ChooseFileStep.fillOut();
    Navigation.goNextStep(viewport);

    // Third step: choose an existing import profile.
    MapCsvStep.existingProfile.useExistingProfile();
    Navigation.goNextStep(viewport);

    // Fourth step: fill out the accounts.
    if (fillOut) {
        AdjustTransactionsStep.fillOutForAsset(viewport);
    }
};

export const finalSteps = (viewport: "desktop" | "mobile", stats: SummaryStats = {}) => {
    // Fifth step: confirm the summary and import the transactions.
    SummaryStep.checkStats(viewport, {accountName: firstAccount.name, ...stats});
    Navigation.goNextStep(viewport);
};

export const baseBeforeEach = (viewport: Viewport) => {
    cy.resetDb();
    cy.loginHeadless();

    cy.changeViewport(viewport);
    cy.visit(DerivedAppScreenUrls.DASHBOARD);

    gotoCSVImport(viewport);
};
