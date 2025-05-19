import {push} from "connected-react-router";
import {
    Account,
    ImportableTransaction,
    ImportableTransactionData,
    ImportProfile,
    ImportProfileData,
    Transaction
} from "models/";
import mounts from "store/mountpoints";
import {Id} from "utils/types";
import {DerivedAppModalUrls} from "values/screenUrls";
import {STEP_INDICES} from "values/transactionsImportSteps";
import {
    canGotoNextStep,
    nextStepDisabledReason,
    initialState,
    transactionsImportSlice,
    ImportProfileSection,
    TransactionsImportSliceState
} from "./transactionsImport.slice";

const createNewState = (newState: Partial<TransactionsImportSliceState>) => ({
    ...initialState,
    ...newState
});

const createNewStoreState = (
    newState: Partial<TransactionsImportSliceState>,
    importProfiles: Record<Id, ImportProfileData> = {}
) => ({
    [mounts.importProfiles]: importProfiles,
    [mounts.transactionsImport]: {
        ...initialState,
        ...newState
    }
});

const assetAccount = new Account({type: Account.ASSET});
const incomeAccount = new Account({type: Account.INCOME});
const expenseAccount = new Account({type: Account.EXPENSE});

const accountsById = {
    [assetAccount.id]: assetAccount,
    [incomeAccount.id]: incomeAccount,
    [expenseAccount.id]: expenseAccount
};

const importProfile = new ImportProfile();
const importProfileState = {[importProfile.id]: importProfile};

const validTransactionData = {
    creditAccountId: incomeAccount.id,
    debitAccountId: assetAccount.id,
    amount: 12300,
    description: "c",
    date: "1970",
    type: Transaction.INCOME,
    includeInImport: true
};

const validTransaction = new ImportableTransaction(validTransactionData);

describe("canGotoNextStep", () => {
    it("returns false when an unknown step is passed", () => {
        const state = createNewState({currentStep: 1000});
        expect(canGotoNextStep(createNewStoreState(state), state)).toBe(false);
    });

    describe("Choose Account step", () => {
        it("returns true when there is a chosen account", () => {
            const state = createNewState({
                currentStep: STEP_INDICES.CHOOSE_ACCOUNT,
                accountId: "id"
            });

            expect(canGotoNextStep(createNewStoreState(state), state)).toBe(true);
        });

        it("returns false when there isn't a chosen account", () => {
            const state = createNewState({
                currentStep: STEP_INDICES.CHOOSE_ACCOUNT,
                accountId: ""
            });

            expect(canGotoNextStep(createNewStoreState(state), state)).toBe(false);
        });
    });

    describe("Choose File step", () => {
        it("returns true when there is a chosen file name and file contents", () => {
            const state = createNewState({
                currentStep: STEP_INDICES.CHOOSE_FILE,
                fileName: "name",
                fileContents: [["contents"]]
            });

            expect(canGotoNextStep(createNewStoreState(state), state)).toBe(true);
        });

        it("returns false when there isn't a file name", () => {
            const state = createNewState({
                currentStep: STEP_INDICES.CHOOSE_FILE,
                fileName: "",
                fileContents: [["contents"]]
            });

            expect(canGotoNextStep(createNewStoreState(state), state)).toBe(false);
        });

        it("returns false when there isn't file contents", () => {
            const state = createNewState({
                currentStep: STEP_INDICES.CHOOSE_FILE,
                fileName: "name",
                fileContents: []
            });

            expect(canGotoNextStep(createNewStoreState(state), state)).toBe(false);
        });
    });

    describe("Map Fields step", () => {
        describe("Import Profiles Exist", () => {
            describe("Existing Section", () => {
                it("returns true when there is a chosen import profile", () => {
                    const state = createNewState({
                        currentStep: STEP_INDICES.MAP_FIELDS,
                        activeImportProfileSection: ImportProfileSection.existing,
                        importProfileId: "id"
                    });

                    const storeState = createNewStoreState(state, importProfileState);

                    expect(canGotoNextStep(storeState, state)).toBe(true);
                });

                it("returns false when there isn't a chosen import profile", () => {
                    const state = createNewState({
                        currentStep: STEP_INDICES.MAP_FIELDS,
                        activeImportProfileSection: ImportProfileSection.existing,
                        importProfileId: ""
                    });

                    const storeState = createNewStoreState(state, importProfileState);

                    expect(canGotoNextStep(storeState, state)).toBe(false);
                });
            });

            describe("New Section", () => {
                it("returns true when there is a name for the profile", () => {
                    const state = createNewState({
                        currentStep: STEP_INDICES.MAP_FIELDS,
                        activeImportProfileSection: ImportProfileSection.new,
                        newImportProfileName: "new profile name"
                    });

                    const storeState = createNewStoreState(state, importProfileState);

                    expect(canGotoNextStep(storeState, state)).toBe(true);
                });

                it("returns false when there is not a name for the profile", () => {
                    const state = createNewState({
                        currentStep: STEP_INDICES.MAP_FIELDS,
                        activeImportProfileSection: ImportProfileSection.new,
                        newImportProfileName: ""
                    });

                    const storeState = createNewStoreState(state, importProfileState);

                    expect(canGotoNextStep(storeState, state)).toBe(false);
                });
            });
        });

        describe("Import Profiles Don't Exist", () => {
            it("returns true when there is a name for the profile", () => {
                const state = createNewState({
                    currentStep: STEP_INDICES.MAP_FIELDS,
                    activeImportProfileSection: ImportProfileSection.existing,
                    newImportProfileName: "new profile name"
                });

                const storeState = createNewStoreState(state);

                expect(canGotoNextStep(storeState, state)).toBe(true);
            });

            it("returns false when there is not a name for the profile", () => {
                const state = createNewState({
                    currentStep: STEP_INDICES.MAP_FIELDS,
                    activeImportProfileSection: ImportProfileSection.existing,
                    newImportProfileName: ""
                });

                const storeState = createNewStoreState(state);

                expect(canGotoNextStep(storeState, state)).toBe(false);
            });
        });
    });

    describe("Adjust Transactions step", () => {
        const tests = (areRulesEnabled: boolean = true) => {
            it("returns true when there are valid parsed transactions", () => {
                const transaction1 = new ImportableTransaction(validTransactionData);
                const transaction2 = new ImportableTransaction(validTransactionData);

                const transactions = {
                    [transaction1.id]: transaction1,
                    [transaction2.id]: transaction2
                };

                const state = createNewState({
                    currentStep: STEP_INDICES.ADJUST_TRANSACTIONS,
                    areRulesEnabled,
                    transactions,
                    transactionsFromRules: transactions
                });

                expect(canGotoNextStep(createNewStoreState(state), state, accountsById)).toBe(true);
            });

            it("returns false when there are no transactions", () => {
                const state = createNewState({currentStep: STEP_INDICES.ADJUST_TRANSACTIONS});

                expect(canGotoNextStep(createNewStoreState(state), state, accountsById)).toBe(
                    false
                );
            });

            it("returns false when there are transactions with invalid accounts", () => {
                const transaction = new ImportableTransaction({
                    ...validTransactionData,
                    // Can't exactly mix an Income account and an Expense account on one transaction.
                    creditAccountId: incomeAccount.id,
                    debitAccountId: expenseAccount.id
                });

                const transactions = {[transaction.id]: transaction};

                const state = createNewState({
                    currentStep: STEP_INDICES.ADJUST_TRANSACTIONS,
                    areRulesEnabled,
                    transactions,
                    transactionsFromRules: transactions
                });

                expect(canGotoNextStep(createNewStoreState(state), state, accountsById)).toBe(
                    false
                );
            });

            it("returns false when there are invalid transactions that should be imported", () => {
                const transaction1 = new ImportableTransaction({includeInImport: true});
                const transaction2 = new ImportableTransaction({includeInImport: true});

                const transactions = {
                    [transaction1.id]: transaction1,
                    [transaction2.id]: transaction2
                };

                const state = createNewState({
                    currentStep: STEP_INDICES.ADJUST_TRANSACTIONS,
                    areRulesEnabled,
                    transactions,
                    transactionsFromRules: transactions
                });

                expect(canGotoNextStep(createNewStoreState(state), state, accountsById)).toBe(
                    false
                );
            });

            it("returns true when there are invalid transactions that shouldn't be imported", () => {
                const transaction1 = new ImportableTransaction({
                    ...validTransactionData,
                    includeInImport: true
                });
                const transaction2 = new ImportableTransaction({includeInImport: false});

                const transactions = {
                    [transaction1.id]: transaction1,
                    [transaction2.id]: transaction2
                };

                const state = createNewState({
                    currentStep: STEP_INDICES.ADJUST_TRANSACTIONS,
                    areRulesEnabled,
                    transactions,
                    transactionsFromRules: transactions
                });

                expect(canGotoNextStep(createNewStoreState(state), state, accountsById)).toBe(true);
            });
        };

        describe("With Rules Enabled", () => {
            tests(true);
        });

        describe("With Rules Disabled", () => {
            tests(false);
        });
    });

    describe("Complete Import step", () => {
        it("always returns true", () => {
            const state = createNewState({currentStep: STEP_INDICES.COMPLETE_IMPORT});
            expect(canGotoNextStep(createNewStoreState(state), state)).toBe(true);
        });
    });
});

describe("nextStepDisabledReason", () => {
    it("returns an empty string when an unknown step is passed", () => {
        const state = createNewState({currentStep: 1000});
        expect(nextStepDisabledReason(createNewStoreState(state), state)).toBe("");
    });

    describe("Choose Account step", () => {
        it("returns a message indicating that the account must be chosen", () => {
            const state = createNewState({
                currentStep: STEP_INDICES.CHOOSE_ACCOUNT
            });

            expect(nextStepDisabledReason(createNewStoreState(state), state)).toBe(
                "You must choose an account"
            );
        });
    });

    describe("Choose File step", () => {
        it("returns a message indicating that a file must be chosen", () => {
            const state = createNewState({
                currentStep: STEP_INDICES.CHOOSE_FILE
            });

            expect(nextStepDisabledReason(createNewStoreState(state), state)).toBe(
                "You must choose a valid CSV file"
            );
        });
    });

    describe("Map Fields step", () => {
        describe("Import Profiles Exist", () => {
            describe("Existing Section", () => {
                it("returns a message indicating that a format must be chosen", () => {
                    const state = createNewState({
                        currentStep: STEP_INDICES.MAP_FIELDS,
                        activeImportProfileSection: ImportProfileSection.existing,
                        importProfileId: ""
                    });

                    const storeState = createNewStoreState(state, importProfileState);

                    expect(nextStepDisabledReason(storeState, state)).toBe(
                        "You must choose an existing format"
                    );
                });
            });

            describe("New Section", () => {
                it("returns a message indicating that the new format needs a name", () => {
                    const state = createNewState({
                        currentStep: STEP_INDICES.MAP_FIELDS,
                        activeImportProfileSection: ImportProfileSection.new,
                        newImportProfileName: ""
                    });

                    const storeState = createNewStoreState(state, importProfileState);

                    expect(nextStepDisabledReason(storeState, state)).toBe(
                        "The new format needs a name"
                    );
                });
            });
        });

        describe("Import Profiles Don't Exist", () => {
            it("returns a message indicating that the new format needs a name", () => {
                const state = createNewState({
                    currentStep: STEP_INDICES.MAP_FIELDS,
                    activeImportProfileSection: ImportProfileSection.existing,
                    newImportProfileName: ""
                });

                const storeState = createNewStoreState(state);

                expect(nextStepDisabledReason(storeState, state)).toBe(
                    "The new format needs a name"
                );
            });
        });
    });

    describe("Adjust Transactions step", () => {
        it("returns an inconspicuous message when there are no transactions", () => {
            const state = createNewState({currentStep: STEP_INDICES.ADJUST_TRANSACTIONS});

            expect(nextStepDisabledReason(createNewStoreState(state), state, accountsById)).toBe(
                "There aren't any transactions; honestly, not sure how you got here"
            );
        });

        const tests = (areRulesEnabled: boolean = true) => {
            it("returns an empty string when all the transactions are valid", () => {
                const transaction1 = new ImportableTransaction(validTransactionData);
                const transaction2 = new ImportableTransaction(validTransactionData);

                const transactions = {
                    [transaction1.id]: transaction1,
                    [transaction2.id]: transaction2
                };

                const state = createNewState({
                    currentStep: STEP_INDICES.ADJUST_TRANSACTIONS,
                    areRulesEnabled,
                    transactions,
                    transactionsFromRules: transactions
                });

                expect(
                    nextStepDisabledReason(createNewStoreState(state), state, accountsById)
                ).toBe("");
            });

            it("returns an empty string when there are invalid (but excluded) transactions", () => {
                const transaction1 = new ImportableTransaction({
                    ...validTransactionData,
                    includeInImport: false
                });
                const transaction2 = new ImportableTransaction({includeInImport: false});

                const transactions = {
                    [transaction1.id]: transaction1,
                    [transaction2.id]: transaction2
                };

                const state = createNewState({
                    currentStep: STEP_INDICES.ADJUST_TRANSACTIONS,
                    areRulesEnabled,
                    transactions,
                    transactionsFromRules: transactions
                });

                expect(
                    nextStepDisabledReason(createNewStoreState(state), state, accountsById)
                ).toBe("");
            });

            describe("all the reasons transactions aren't valid", () => {
                const generateInvalidState = (
                    invalidTransaction: Partial<ImportableTransactionData>
                ) => {
                    const transaction1 = new ImportableTransaction(validTransactionData);
                    const transaction2 = new ImportableTransaction(invalidTransaction);

                    const transactions = {
                        [transaction1.id]: transaction1,
                        [transaction2.id]: transaction2
                    };

                    const state = createNewState({
                        currentStep: STEP_INDICES.ADJUST_TRANSACTIONS,
                        areRulesEnabled,
                        transactions,
                        transactionsFromRules: transactions
                    });

                    return state;
                };

                const description = `("${validTransactionData.description}")`;

                it("has a transaction without a description", () => {
                    const state = generateInvalidState({...validTransactionData, description: ""});

                    expect(
                        nextStepDisabledReason(createNewStoreState(state), state, accountsById)
                    ).toBe("Transaction 2 is missing a description");
                });

                it("has a transaction without an amount", () => {
                    const state = generateInvalidState({...validTransactionData, amount: 0});

                    expect(
                        nextStepDisabledReason(createNewStoreState(state), state, accountsById)
                    ).toBe(`Transaction 2 ${description} is missing an amount`);
                });

                it("has a transaction without a date", () => {
                    const state = generateInvalidState({...validTransactionData, date: ""});

                    expect(
                        nextStepDisabledReason(createNewStoreState(state), state, accountsById)
                    ).toBe(`Transaction 2 ${description} is missing a date`);
                });

                it("has a transaction without a type", () => {
                    // @ts-expect-error Allow empty type for testing purposes.
                    const state = generateInvalidState({...validTransactionData, type: ""});

                    expect(
                        nextStepDisabledReason(createNewStoreState(state), state, accountsById)
                    ).toBe(`Transaction 2 ${description} is missing a type`);
                });

                it("has a transaction without a credit account", () => {
                    const state = generateInvalidState({
                        ...validTransactionData,
                        creditAccountId: ""
                    });

                    expect(
                        nextStepDisabledReason(createNewStoreState(state), state, accountsById)
                    ).toBe(`Transaction 2 ${description} is missing an account`);
                });

                it("has a transaction without a debit account", () => {
                    const state = generateInvalidState({
                        ...validTransactionData,
                        debitAccountId: ""
                    });

                    expect(
                        nextStepDisabledReason(createNewStoreState(state), state, accountsById)
                    ).toBe(`Transaction 2 ${description} is missing an account`);
                });

                it("has a transaction with invalid accounts", () => {
                    const state = generateInvalidState({
                        ...validTransactionData,
                        // Can't exactly mix an Income account and an Expense account on one transaction.
                        creditAccountId: incomeAccount.id,
                        debitAccountId: expenseAccount.id
                    });

                    expect(
                        nextStepDisabledReason(createNewStoreState(state), state, accountsById)
                    ).toBe(`Transaction 2 ${description} has an invalid mix of accounts`);
                });
            });
        };

        describe("Rules are Enabled", () => {
            tests(true);
        });

        describe("Rules are Disabled", () => {
            tests(false);
        });
    });

    describe("Complete Import step", () => {
        it("returns an empty string, since Next shouldn't be disabled on the last step", () => {
            const state = createNewState({currentStep: STEP_INDICES.COMPLETE_IMPORT});
            expect(nextStepDisabledReason(createNewStoreState(state), state)).toBe("");
        });
    });
});

describe("reducer", () => {
    const {actions, reducer} = transactionsImportSlice;

    it("can reset to the initial state", () => {
        expect(reducer(undefined, actions.resetState())).toEqual(initialState);
        expect(reducer(initialState, actions.resetState())).toEqual(initialState);

        const state = createNewState({currentStep: 3, accountId: "id"});
        expect(reducer(state, actions.resetState())).toEqual(initialState);
    });

    describe("setCurrentStep", () => {
        it("can set any previous step as the current step", () => {
            const oldState = createNewState({currentStep: 3});
            const newState = createNewState({currentStep: 2});

            expect(reducer(oldState, actions.setCurrentStep(2))).toEqual(newState);
        });

        it("can't set any future step as the current step", () => {
            const oldState = createNewState({currentStep: 2});
            expect(reducer(oldState, actions.setCurrentStep(3))).toEqual(oldState);
        });

        it("doesn't do anything when setting the current step as the current step", () => {
            const oldState = createNewState({currentStep: 2});
            expect(reducer(oldState, actions.setCurrentStep(2))).toEqual(oldState);
        });
    });

    describe("setLoadingStep", () => {
        it("can set that the step is being loaded", () => {
            const oldState = createNewState({loadingStep: false});
            const newState = createNewState({loadingStep: true});

            expect(reducer(oldState, actions.setLoadingStep(true))).toEqual(newState);
        });
    });

    describe("gotoNextStep", () => {
        it("can go to the next step", () => {
            const oldState = createNewState({
                currentStep: STEP_INDICES.CHOOSE_ACCOUNT,
                accountId: "id"
            });

            const newState = createNewState({
                currentStep: STEP_INDICES.CHOOSE_FILE,
                accountId: "id"
            });

            expect(reducer(oldState, actions.gotoNextStep())).toEqual(newState);
        });

        it("can't go past the last step", () => {
            const oldState = createNewState({currentStep: STEP_INDICES.COMPLETE_IMPORT});
            expect(reducer(oldState, actions.gotoNextStep())).toEqual(oldState);
        });

        it("can go to the next step even if a previous step somehow becomes incomplete", () => {
            // Technically, this shouldn't be allowed to happen. But for implementation
            // simplicities sake, it is allowed. It would take a bit more sophisticated
            // system to properly move the user around the import process if they somehow
            // were able to jump to future steps without completing past steps.
            // But considering how low impact (and unlikely) this is to happen, it has been
            // decided against implementing this more sophisticated system.

            const oldState = createNewState({
                currentStep: STEP_INDICES.MAP_FIELDS,
                accountId: "", // A previous step (Choose Account) becomes incomplete
                importProfileId: "id"
            });

            const newState = createNewState({
                currentStep: STEP_INDICES.ADJUST_TRANSACTIONS,
                accountId: "",
                importProfileId: "id"
            });

            expect(reducer(oldState, actions.gotoNextStep())).toEqual(newState);
        });
    });

    describe("gotoPreviousStep", () => {
        it("can go to the previous step", () => {
            const oldState = createNewState({currentStep: 3});
            const newState = createNewState({currentStep: 2});

            expect(reducer(oldState, actions.gotoPreviousStep())).toEqual(newState);
        });

        it("can't go past the first step", () => {
            const oldState = createNewState({currentStep: 0});
            expect(reducer(oldState, actions.gotoPreviousStep())).toEqual(oldState);
        });
    });

    describe("startMoveToAdjustTransactionsStep", () => {
        it("sets the loading state but doesn't change the step yet", () => {
            const oldState = createNewState({
                loadingStep: false,
                currentStep: STEP_INDICES.CHOOSE_FILE
            });

            const newState = createNewState({
                loadingStep: true,
                currentStep: STEP_INDICES.CHOOSE_FILE
            });

            expect(reducer(oldState, actions.startMoveToAdjustTransactionsStep())).toEqual(
                newState
            );
        });
    });

    describe("finishMoveToAdjustTransactionsStep", () => {
        it("ends the loading state and changes the step to Adjust Transactions", () => {
            const oldState = createNewState({
                loadingStep: true,
                currentStep: STEP_INDICES.CHOOSE_FILE
            });

            const newState = createNewState({
                loadingStep: false,
                currentStep: STEP_INDICES.ADJUST_TRANSACTIONS
            });

            expect(reducer(oldState, actions.finishMoveToAdjustTransactionsStep())).toEqual(
                newState
            );
        });
    });

    describe("setAreRulesEnabled", () => {
        it("can set whether or not the rules are enabled", () => {
            const oldState = createNewState({areRulesEnabled: true});
            const newState = createNewState({areRulesEnabled: false});

            expect(reducer(oldState, actions.setAreRulesEnabled(false))).toEqual(newState);
        });
    });

    describe("setMarkInvalidTransactions", () => {
        it("can set whether or not to mark (highlight) invalid transactions", () => {
            const oldState = createNewState({markInvalidTransactions: false});
            const newState = createNewState({markInvalidTransactions: true});

            expect(reducer(oldState, actions.setMarkInvalidTransactions(true))).toEqual(newState);
        });
    });

    describe("setActiveRuleIds", () => {
        it("can set the active rule IDs", () => {
            const oldState = createNewState({activeRuleIds: []});
            const newState = createNewState({activeRuleIds: ["1", "2"]});

            expect(reducer(oldState, actions.setActiveRuleIds(["1", "2"]))).toEqual(newState);
        });
    });

    describe("setTransactions", () => {
        const transactions = {
            [validTransaction.id]: validTransaction
        };

        it("sets the transactions", () => {
            const oldState = createNewState({});
            const newState = createNewState({transactions});

            expect(reducer(oldState, actions.setTransactions(transactions))).toEqual(newState);
        });

        it("resets the state of 'are rules enabled' to true", () => {
            const oldState = createNewState({areRulesEnabled: false});
            const newState = createNewState({transactions, areRulesEnabled: true});

            expect(reducer(oldState, actions.setTransactions(transactions))).toEqual(newState);
        });
    });

    describe("setTransactionsFromRules", () => {
        const transactions = {
            [validTransaction.id]: validTransaction
        };

        it("sets the transactions", () => {
            const oldState = createNewState({});
            const newState = createNewState({transactionsFromRules: transactions});

            expect(reducer(oldState, actions.setTransactionsFromRules(transactions))).toEqual(
                newState
            );
        });

        it("resets the state of 'are rules enabled' to true", () => {
            const oldState = createNewState({areRulesEnabled: false});

            const newState = createNewState({
                transactionsFromRules: transactions,
                areRulesEnabled: true
            });

            expect(reducer(oldState, actions.setTransactionsFromRules(transactions))).toEqual(
                newState
            );
        });
    });

    describe("updateTransaction", () => {
        const transaction = new ImportableTransaction();
        const {id} = transaction;

        const oldState = createNewState({
            transactions: {[id]: transaction},
            transactionsFromRules: {[id]: transaction}
        });

        it("can update a whole (single) transaction", () => {
            const updatedTransaction = new ImportableTransaction({
                ...transaction,
                description: "test",
                amount: 12345,
                type: Transaction.EXPENSE
            });

            const newState = createNewState({
                transactions: {[id]: updatedTransaction},
                transactionsFromRules: {[id]: updatedTransaction}
            });

            expect(reducer(oldState, actions.updateTransaction(updatedTransaction))).toEqual(
                newState
            );
        });

        it("can't add a new unknown transaction", () => {
            const action = actions.updateTransaction(new ImportableTransaction());
            expect(reducer(oldState, action)).toEqual(oldState);
        });
    });

    describe("bulkUpdateTransactions", () => {
        const transaction1 = new ImportableTransaction();
        const transaction2 = new ImportableTransaction();

        const {id: id1} = transaction1;
        const {id: id2} = transaction2;

        const oldTransactionsState = {
            [id1]: transaction1,
            [id2]: transaction2
        };

        const oldState = createNewState({
            transactions: oldTransactionsState,
            transactionsFromRules: oldTransactionsState
        });

        it("can update a multiple transaction's amount", () => {
            const updatedTransaction1 = new ImportableTransaction({...transaction1, amount: 12345});
            const updatedTransaction2 = new ImportableTransaction({...transaction2, amount: 12345});

            const newTransactionsState = {
                [id1]: updatedTransaction1,
                [id2]: updatedTransaction2
            };

            const newState = createNewState({
                transactions: newTransactionsState,
                transactionsFromRules: newTransactionsState
            });

            const action = actions.bulkUpdateTransactions({
                ids: [id1, id2],
                property: "amount",
                newValue: "123.45"
            });

            expect(reducer(oldState, action)).toEqual(newState);
        });

        it("can update the 'includeInImport' property", () => {
            const updatedTransaction1 = new ImportableTransaction({
                ...transaction1,
                includeInImport: false
            });

            const updatedTransaction2 = new ImportableTransaction({
                ...transaction2,
                includeInImport: false
            });

            const newTransactionsState = {
                [id1]: updatedTransaction1,
                [id2]: updatedTransaction2
            };

            const newState = createNewState({
                transactions: newTransactionsState,
                transactionsFromRules: newTransactionsState
            });

            // Can change to false.
            const actionFalse = actions.bulkUpdateTransactions({
                ids: [id1, id2],
                property: "includeInImport",
                newValue: "false"
            });

            expect(reducer(oldState, actionFalse)).toEqual(newState);

            // Can change to true.
            const actionTrue = actions.bulkUpdateTransactions({
                ids: [id1, id2],
                property: "includeInImport",
                newValue: "true"
            });

            expect(reducer(newState, actionTrue)).toEqual(oldState);
        });

        it("can update some other regular string property", () => {
            const updatedTransaction1 = new ImportableTransaction({
                ...transaction1,
                description: "test"
            });

            const updatedTransaction2 = new ImportableTransaction({
                ...transaction2,
                description: "test"
            });

            const newTransactionsState = {
                [id1]: updatedTransaction1,
                [id2]: updatedTransaction2
            };

            const newState = createNewState({
                transactions: newTransactionsState,
                transactionsFromRules: newTransactionsState
            });

            const action = actions.bulkUpdateTransactions({
                ids: [id1, id2],
                property: "description",
                newValue: "test"
            });

            expect(reducer(oldState, action)).toEqual(newState);
        });

        it("can't add new unknown transactions", () => {
            const action = actions.bulkUpdateTransactions({
                ids: [id1],
                property: "amount",
                newValue: "123.45"
            });

            expect(reducer(initialState, action)).toEqual(initialState);
        });
    });

    describe("Setter actions", () => {
        describe("Account", () => {
            it("can set the account ID", () => {
                const newState = createNewState({accountId: "123"});
                expect(reducer(initialState, actions.setAccountId("123"))).toEqual(newState);
            });

            it("clears all the state after the first step when setting the account ID", () => {
                const oldState = createNewState({
                    currentStep: 0,
                    accountId: "",
                    fileName: "test.csv",
                    fileContents: [["test"]],
                    importProfileId: "test123",
                    areRulesEnabled: false,
                    markInvalidTransactions: true,
                    transactions: {
                        "1": new ImportableTransaction({id: "1"})
                    },
                    transactionsFromRules: {
                        "1": new ImportableTransaction({id: "1"})
                    },
                    cleanTransactions: {
                        "1": new Transaction({id: "1"})
                    }
                });

                const newState = createNewState({currentStep: 0, accountId: "123"});

                expect(reducer(oldState, actions.setAccountId("123"))).toEqual(newState);
            });
        });

        describe("File", () => {
            it("can set the file name", () => {
                const newState = createNewState({fileName: "123"});
                expect(reducer(initialState, actions.setFileName("123"))).toEqual(newState);
            });

            it("can set the file contents and the number of fields for a new import profile", () => {
                const newState = createNewState({
                    fileContents: [["123"]],
                    newImportProfileFields: [""]
                });

                expect(reducer(initialState, actions.setFileContents([["123"]]))).toEqual(newState);
            });

            it("clears all the state after the second step when setting the file name", () => {
                const oldState = createNewState({
                    currentStep: 1,
                    accountId: "123",
                    fileName: "",
                    fileContents: [],
                    importProfileId: "test123",
                    areRulesEnabled: false,
                    markInvalidTransactions: true,
                    transactions: {
                        "1": new ImportableTransaction({id: "1"})
                    },
                    transactionsFromRules: {
                        "1": new ImportableTransaction({id: "1"})
                    },
                    cleanTransactions: {
                        "1": new Transaction({id: "1"})
                    }
                });

                const newState = createNewState({
                    currentStep: 1,
                    accountId: "123",
                    fileName: "test.csv"
                });

                expect(reducer(oldState, actions.setFileName("test.csv"))).toEqual(newState);
            });
        });

        describe("Import Profile", () => {
            it("can set the import profile ID", () => {
                const newState = createNewState({importProfileId: "123"});
                expect(reducer(initialState, actions.setImportProfileId("123"))).toEqual(newState);
            });

            it("can set the active import profile section", () => {
                const newState = createNewState({
                    activeImportProfileSection: ImportProfileSection.new
                });

                expect(
                    reducer(
                        initialState,
                        actions.setActiveImportProfileSection(ImportProfileSection.new)
                    )
                ).toEqual(newState);
            });

            it("can set the name of the new import profile", () => {
                const newState = createNewState({newImportProfileName: "new name"});

                expect(reducer(initialState, actions.setNewImportProfileName("new name"))).toEqual(
                    newState
                );
            });

            it("can update a field for the new import profile", () => {
                const newState = createNewState({newImportProfileFields: ["description"]});

                expect(
                    reducer(
                        initialState,
                        actions.updateNewImportProfileField({index: 0, value: "description"})
                    )
                ).toEqual(newState);
            });

            it("clears all the state after the third step when setting the import profile ID", () => {
                const oldState = createNewState({
                    currentStep: 2,
                    accountId: "123",
                    fileName: "test.csv",
                    fileContents: [["test"]],
                    importProfileId: "",
                    areRulesEnabled: false,
                    markInvalidTransactions: true,
                    transactions: {
                        "1": new ImportableTransaction({id: "1"})
                    },
                    transactionsFromRules: {
                        "1": new ImportableTransaction({id: "1"})
                    },
                    cleanTransactions: {
                        "1": new Transaction({id: "1"})
                    }
                });

                const newState = createNewState({
                    currentStep: 2,
                    accountId: "123",
                    fileName: "test.csv",
                    fileContents: [["test"]],
                    importProfileId: "test123"
                });

                expect(reducer(oldState, actions.setImportProfileId("test123"))).toEqual(newState);
            });
        });

        describe("Transactions", () => {
            const transaction = new ImportableTransaction();
            const transactions = {[transaction.id]: transaction};

            it("can set the transactions", () => {
                const newState = createNewState({transactions});
                expect(reducer(initialState, actions.setTransactions(transactions))).toEqual(
                    newState
                );
            });

            it("clears all the state after the fourth step when setting the transactions", () => {
                const oldState = createNewState({
                    currentStep: 2,
                    accountId: "123",
                    fileName: "test.csv",
                    fileContents: [["test"]],
                    importProfileId: "test123",
                    areRulesEnabled: false,
                    markInvalidTransactions: true,
                    transactions: {},
                    transactionsFromRules: {},
                    cleanTransactions: {
                        "1": new Transaction({id: "1"})
                    }
                });

                const newState = createNewState({
                    currentStep: 2,
                    accountId: "123",
                    fileName: "test.csv",
                    fileContents: [["test"]],
                    importProfileId: "test123",
                    transactions
                });

                expect(reducer(oldState, actions.setTransactions(transactions))).toEqual(newState);
            });
        });

        describe("Clean Transactions", () => {
            const transaction = new Transaction();
            const cleanTransactions = {[transaction.id]: transaction};

            it("can set the clean transactions", () => {
                const newState = createNewState({cleanTransactions});

                expect(
                    reducer(initialState, actions.setCleanTransactions(cleanTransactions))
                ).toEqual(newState);
            });
        });
    });

    describe("Saga only actions", () => {
        it("leaves the state as is", () => {
            // @ts-expect-error Allow passing no arguments for parseFile for testing purposes.
            expect(reducer(initialState, actions.parseFile())).toEqual(initialState);
        });
    });

    describe("Reset router reducers", () => {
        it("resets the state to the initial state", () => {
            const oldState = createNewState({accountId: "123"});
            expect(reducer(oldState, push(""))).toEqual(initialState);
        });

        it("doesn't reset the state when navigating to the edit form", () => {
            const oldState = createNewState({accountId: "123"});

            expect(reducer(oldState, push(DerivedAppModalUrls.TRANSACTIONS_IMPORT_FORM))).toEqual(
                oldState
            );
        });
    });
});

describe("selectors", () => {
    const {selectors} = transactionsImportSlice;

    describe("selectCurrentStep", () => {
        it("can get the current step", () => {
            const state = createNewStoreState({currentStep: 1});
            expect(selectors.selectCurrentStep(state)).toEqual(1);
        });
    });

    describe("selectLoadingStep", () => {
        it("can get the loading state of the current step", () => {
            const state = createNewStoreState({loadingStep: true});
            expect(selectors.selectLoadingStep(state)).toEqual(true);
        });
    });

    describe("selectAccountId", () => {
        it("can get the account ID", () => {
            const state = createNewStoreState({accountId: "id"});
            expect(selectors.selectAccountId(state)).toEqual("id");
        });
    });

    describe("selectFileName", () => {
        it("can get the file name", () => {
            const state = createNewStoreState({fileName: "name"});
            expect(selectors.selectFileName(state)).toEqual("name");
        });
    });

    describe("selectFileContents", () => {
        it("can get the file contents", () => {
            const state = createNewStoreState({fileContents: [["123"]]});
            expect(selectors.selectFileContents(state)).toEqual([["123"]]);
        });
    });

    describe("selectFileContentsSample", () => {
        it("it can get (up to) 5 sample row of data from the file contents", () => {
            const state = createNewStoreState({fileContents: [["123"], ["456"]]});
            expect(selectors.selectFileContentsSample(state)).toEqual([["123"], ["456"]]);
        });
    });

    describe("selectAnyExistingImportProfiles", () => {
        it("returns true when there are existing import profiles", () => {
            const state = createNewStoreState({}, importProfileState);
            expect(selectors.selectAnyExistingImportProfiles(state)).toBe(true);
        });

        it("returns false when there aren't any existing import profiles", () => {
            const state = createNewStoreState({}, {});
            expect(selectors.selectAnyExistingImportProfiles(state)).toBe(false);
        });
    });

    describe("selectIsNewProfileSection", () => {
        it("returns true when there are import profiles and we're on the New Profile section", () => {
            const state = createNewStoreState(
                {activeImportProfileSection: ImportProfileSection.new},
                importProfileState
            );

            expect(selectors.selectIsNewProfileSection(state)).toBe(true);
        });

        it("returns true when there aren't import profiles", () => {
            const state = createNewStoreState(
                {activeImportProfileSection: ImportProfileSection.new},
                {}
            );

            expect(selectors.selectIsNewProfileSection(state)).toBe(true);
        });

        it("returns false when there are import profiles and we're on the Existing Profile section", () => {
            const state = createNewStoreState(
                {activeImportProfileSection: ImportProfileSection.existing},
                importProfileState
            );

            expect(selectors.selectIsNewProfileSection(state)).toBe(false);
        });
    });

    describe("selectImportProfileId", () => {
        it("can get the import profile ID", () => {
            const state = createNewStoreState({importProfileId: "id"});
            expect(selectors.selectImportProfileId(state)).toEqual("id");
        });
    });

    describe("selectNewImportProfileName", () => {
        it("can get the name of the new import profile", () => {
            const state = createNewStoreState({newImportProfileName: "new name"});
            expect(selectors.selectNewImportProfileName(state)).toEqual("new name");
        });
    });

    describe("selectNewImportProfileFields", () => {
        it("can get the fields for the new import profile", () => {
            const state = createNewStoreState({newImportProfileFields: ["description"]});
            expect(selectors.selectNewImportProfileFields(state)).toEqual(["description"]);
        });
    });

    describe("selectActiveRuleIds", () => {
        it("can get the active rule IDs", () => {
            const state = createNewStoreState({activeRuleIds: ["1", "2"]});
            expect(selectors.selectActiveRuleIds(state)).toEqual(["1", "2"]);
        });
    });

    describe("selectAreRulesEnabled", () => {
        it("can get the state of whether or not rules are enabled", () => {
            const state = createNewStoreState({areRulesEnabled: false});
            expect(selectors.selectAreRulesEnabled(state)).toEqual(false);
        });
    });

    describe("selectMarkInvalidTransactions", () => {
        it("can get whether or not to mark (highlight) invalid transactions", () => {
            const state = createNewStoreState({markInvalidTransactions: true});
            expect(selectors.selectMarkInvalidTransactions(state)).toEqual(true);
        });
    });

    describe("Transactions", () => {
        const transaction = new ImportableTransaction();

        const transactionFromRules = new ImportableTransaction({
            ...transaction,
            description: "rule"
        });

        const duplicateTransaction = new ImportableTransaction({isDuplicate: true});

        const duplicateTransactionFromRules = new ImportableTransaction({
            ...transactionFromRules,
            isDuplicate: true
        });

        const rawTransactions = {
            [transaction.id]: transaction,
            [duplicateTransaction.id]: duplicateTransaction
        };

        const transactionsFromRules = {
            [transaction.id]: transactionFromRules,
            [duplicateTransaction.id]: duplicateTransactionFromRules
        };

        const nonDuplicateTransactions = {[transaction.id]: transaction};
        const nonDuplicateTransactionsFromRules = {[transaction.id]: transactionFromRules};

        const duplicateTransactions = {[duplicateTransaction.id]: duplicateTransaction};
        const duplicateTransactionsFromRules = {
            [duplicateTransaction.id]: duplicateTransactionFromRules
        };

        const rawState = {
            areRulesEnabled: false,
            transactions: rawTransactions,
            transactionsFromRules
        };

        const state = createNewStoreState(rawState);

        describe("selectAllTransactions", () => {
            it("can get all the raw (non-rule applied) transactions", () => {
                expect(
                    selectors.selectAllTransactions(
                        createNewStoreState({...rawState, areRulesEnabled: false})
                    )
                ).toEqual(rawTransactions);
            });

            it("can get all the transactions from rules", () => {
                expect(
                    selectors.selectAllTransactions(
                        createNewStoreState({...rawState, areRulesEnabled: true})
                    )
                ).toEqual(transactionsFromRules);
            });
        });

        describe("selectTransaction", () => {
            it("can get a single raw transaction", () => {
                expect(selectors.selectTransaction(transaction.id)(state)).toEqual(transaction);
            });

            it("can get a single transaction from rules", () => {
                expect(
                    selectors.selectTransaction(transaction.id)(
                        createNewStoreState({...rawState, areRulesEnabled: true})
                    )
                ).toEqual(transactionFromRules);
            });
        });

        describe("selectTransactions", () => {
            it("can get the non-duplicate transactions", () => {
                expect(selectors.selectTransactions(state)).toEqual(nonDuplicateTransactions);
            });

            it("can get the non-duplicate transactions from rules", () => {
                expect(
                    selectors.selectTransactions(
                        createNewStoreState({...rawState, areRulesEnabled: true})
                    )
                ).toEqual(nonDuplicateTransactionsFromRules);
            });
        });

        describe("selectTransactionsList", () => {
            it("can get the non-duplicate transactions as a list", () => {
                expect(selectors.selectTransactionsList(state)).toEqual([transaction]);
            });
        });

        describe("selectDuplicateTransactions", () => {
            it("can get the duplicate transactions", () => {
                expect(selectors.selectDuplicateTransactions(state)).toEqual(duplicateTransactions);
            });

            it("can get the duplicate transactions from rules", () => {
                expect(
                    selectors.selectDuplicateTransactions(
                        createNewStoreState({...rawState, areRulesEnabled: true})
                    )
                ).toEqual(duplicateTransactionsFromRules);
            });
        });

        describe("selectDuplicateTransactionsList", () => {
            it("can get the duplicate transactions as a list", () => {
                expect(selectors.selectDuplicateTransactionsList(state)).toEqual([
                    duplicateTransaction
                ]);
            });
        });
    });

    describe("Clean Transactions", () => {
        const cleanTransaction = new Transaction();

        const cleanTransactions = {[cleanTransaction.id]: cleanTransaction};
        const state = createNewStoreState({cleanTransactions});

        describe("selectCleanTransactions", () => {
            it("can get the clean transactions", () => {
                expect(selectors.selectCleanTransactions(state)).toEqual(cleanTransactions);
            });
        });

        describe("selectCleanTransactionsList", () => {
            it("can get the clean transactions as a list", () => {
                expect(selectors.selectCleanTransactionsList(state)).toEqual([cleanTransaction]);
            });
        });

        describe("selectCleanTransaction", () => {
            it("can get a single clean transaction", () => {
                expect(selectors.selectCleanTransaction(cleanTransaction.id)(state)).toEqual(
                    cleanTransaction
                );
            });
        });
    });

    describe("selectCanGotoNextStep", () => {
        it("can get that the user can not proceed to the next step", () => {
            // canGotoNextStep is tested extensively separately; only minimal testing here

            const stateInvalid = createNewStoreState({
                currentStep: STEP_INDICES.CHOOSE_ACCOUNT,
                accountId: ""
            });

            expect(selectors.selectCanGotoNextStep(stateInvalid)).toEqual(false);
        });

        it("can get that the user can proceed to the next step", () => {
            // canGotoNextStep is tested extensively separately; only minimal testing here

            const stateValid = createNewStoreState({
                currentStep: STEP_INDICES.CHOOSE_ACCOUNT,
                accountId: "id"
            });

            expect(selectors.selectCanGotoNextStep(stateValid)).toEqual(true);
        });
    });

    describe("selectNextStepDisabledReason", () => {
        it("can get the reason for why a user can not proceed to the next step", () => {
            // nextStepDisabledReason is tested extensively separately; only minimal testing here

            const stateInvalid = createNewStoreState({
                currentStep: STEP_INDICES.CHOOSE_ACCOUNT,
                accountId: ""
            });

            expect(selectors.selectNextStepDisabledReason(stateInvalid)).toEqual(
                "You must choose an account"
            );
        });
    });

    describe("selectInvalidTransactionId", () => {
        it("can get the ID of the first invalid transaction", () => {
            const invalidTransaction = new ImportableTransaction();

            const stateInvalid = createNewStoreState({
                currentStep: STEP_INDICES.ADJUST_TRANSACTIONS,
                transactionsFromRules: {
                    [invalidTransaction.id]: invalidTransaction
                }
            });

            expect(selectors.selectInvalidTransactionId(stateInvalid)).toEqual(
                invalidTransaction.id
            );
        });
    });
});
