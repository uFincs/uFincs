import {Account} from "models/";
import mounts from "store/mountpoints";
import {STEP_INDICES} from "values/onboardingSteps";
import {
    canGotoNextStep,
    nextStepDisabledReason,
    defaultAssets,
    defaultExpenses,
    defaultIncome,
    defaultLiabilities,
    initialState,
    onboardingSlice,
    OnboardingSliceState
} from "./onboarding.slice";

const createNewState = (newState: Partial<OnboardingSliceState>) => ({
    ...initialState,
    ...newState
});

const typesToSteps = {
    [Account.ASSET]: STEP_INDICES.ASSETS,
    [Account.LIABILITY]: STEP_INDICES.LIABILITIES,
    [Account.INCOME]: STEP_INDICES.INCOME,
    [Account.EXPENSE]: STEP_INDICES.EXPENSES
};

describe("canGotoNextStep", () => {
    it("returns false when an unknown step is passed", () => {
        const state = createNewState({currentStep: 1000});
        expect(canGotoNextStep(state)).toBe(false);
    });

    describe("Any Account Step", () => {
        it("returns true when all selected accounts of a type have a name", () => {
            for (const type of Account.ACCOUNT_TYPES) {
                const account = new Account({name: "name", type});

                const state = createNewState({
                    currentStep: typesToSteps[type],
                    accounts: {
                        ...initialState.accounts,
                        [type]: {
                            [account.id]: account
                        }
                    },
                    selectedAccounts: {
                        [account.id]: true
                    }
                });

                expect(canGotoNextStep(state)).toBe(true);
            }
        });

        it("returns false when any selected accounts of a type don't have a name", () => {
            for (const type of Account.ACCOUNT_TYPES) {
                const account = new Account({name: "", type});

                const state = createNewState({
                    currentStep: typesToSteps[type],
                    accounts: {
                        ...initialState.accounts,
                        [type]: {
                            [account.id]: account
                        }
                    },
                    selectedAccounts: {
                        [account.id]: true
                    }
                });

                expect(canGotoNextStep(state)).toBe(false);
            }
        });

        it("returns false when a type has no selected accounts", () => {
            for (const type of Account.ACCOUNT_TYPES) {
                const state = createNewState({
                    currentStep: typesToSteps[type],
                    selectedAccounts: {}
                });

                expect(canGotoNextStep(state)).toBe(false);
            }
        });
    });

    describe("Finish Setup step", () => {
        it("returns true for the last step", () => {
            const state = createNewState({currentStep: STEP_INDICES.FINISH_SETUP});
            expect(canGotoNextStep(state)).toBe(true);
        });
    });
});

describe("nextStepDisabledReason", () => {
    it("returns an empty string when an unknown step is passed", () => {
        const state = createNewState({currentStep: 1000});
        expect(nextStepDisabledReason(state)).toBe("");
    });

    describe("Any Account Step", () => {
        it("returns a message when there aren't any account for the type", () => {
            for (const type of Account.ACCOUNT_TYPES) {
                const state = createNewState({
                    currentStep: typesToSteps[type],
                    accounts: {
                        ...initialState.accounts,
                        [type]: {}
                    }
                });

                expect(nextStepDisabledReason(state)).toBe(`You need at least 1 ${type} account`);
            }
        });

        it("returns a message when there are accounts without a name for the type", () => {
            for (const type of Account.ACCOUNT_TYPES) {
                const account = new Account({name: "", type});

                const state = createNewState({
                    currentStep: typesToSteps[type],
                    accounts: {
                        ...initialState.accounts,
                        [type]: {
                            [account.id]: account
                        }
                    },
                    selectedAccounts: {
                        [account.id]: true
                    }
                });

                expect(nextStepDisabledReason(state)).toBe(
                    "One or more selected accounts have an empty name"
                );
            }
        });

        it("returns a message when a type has no selected accounts", () => {
            for (const type of Account.ACCOUNT_TYPES) {
                const state = createNewState({
                    currentStep: typesToSteps[type],
                    selectedAccounts: {}
                });

                expect(nextStepDisabledReason(state)).toBe(
                    `You need at least 1 selected ${type} account`
                );
            }
        });
    });

    describe("Finish Setup step", () => {
        it("returns an empty string, since Next shouldn't be disabled on the last step", () => {
            const state = createNewState({currentStep: STEP_INDICES.FINISH_SETUP});
            expect(nextStepDisabledReason(state)).toBe("");
        });
    });
});

describe("reducer", () => {
    const {actions, reducer} = onboardingSlice;

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

    describe("gotoNextStep", () => {
        it("can go to the next step", () => {
            const oldState = createNewState({
                currentStep: STEP_INDICES.ASSETS
            });

            const newState = createNewState({
                currentStep: STEP_INDICES.LIABILITIES
            });

            expect(reducer(oldState, actions.gotoNextStep())).toEqual(newState);
        });

        it("can't go to the next step when the current step hasn't been completed", () => {
            const oldState = createNewState({
                currentStep: STEP_INDICES.ASSETS,
                accounts: {
                    ...initialState.accounts,
                    [Account.ASSET]: {}
                }
            });

            expect(reducer(oldState, actions.gotoNextStep())).toEqual(oldState);
        });

        it("can't go past the last step", () => {
            const oldState = createNewState({currentStep: STEP_INDICES.FINISH_SETUP});
            expect(reducer(oldState, actions.gotoNextStep())).toEqual(oldState);
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

    describe("newAccount", () => {
        it("can create a new account for a type", () => {
            // Since the new account has a random ID, we won't know the exact the state.
            const newState = reducer(initialState, actions.newAccount(Account.ASSET));

            expect(Object.values(newState.accounts[Account.ASSET]).length).toBe(
                Object.values(initialState.accounts[Account.ASSET]).length + 1
            );
        });
    });

    describe("updateAccount", () => {
        it("can update the name of an account", () => {
            const newName = "new name";

            const updatedAccount = new Account({
                ...Object.values(initialState.accounts[Account.ASSET])[0],
                name: newName
            });

            const newState = createNewState({
                accounts: {
                    ...initialState.accounts,
                    [Account.ASSET]: {
                        ...initialState.accounts[Account.ASSET],
                        [updatedAccount.id]: updatedAccount
                    }
                }
            });
            expect(
                reducer(
                    initialState,
                    actions.updateAccount({
                        id: updatedAccount.id,
                        property: "name",
                        newValue: newName,
                        type: Account.ASSET
                    })
                )
            ).toEqual(newState);
        });

        it("can update the opening balance of an account", () => {
            const updatedAccount = new Account({
                ...defaultAssets[0],
                openingBalance: 12345
            });

            const newState = createNewState({
                accounts: {
                    ...initialState.accounts,
                    [Account.ASSET]: {
                        ...initialState.accounts[Account.ASSET],
                        [updatedAccount.id]: updatedAccount
                    }
                }
            });
            expect(
                reducer(
                    initialState,
                    actions.updateAccount({
                        id: updatedAccount.id,
                        property: "openingBalance",
                        newValue: "123.45",
                        type: Account.ASSET
                    })
                )
            ).toEqual(newState);
        });
    });

    describe("setAccountSelected", () => {
        it("can set an account as selected", () => {
            const id = defaultAssets[0].id;

            const newState = createNewState({
                selectedAccounts: {
                    ...initialState.selectedAccounts,
                    [id]: false
                }
            });

            expect(
                reducer(initialState, actions.setAccountSelected({id, selected: false}))
            ).toEqual(newState);

            const newState2 = createNewState({
                selectedAccounts: {
                    ...initialState.selectedAccounts,
                    [id]: true
                }
            });

            expect(reducer(initialState, actions.setAccountSelected({id, selected: true}))).toEqual(
                newState2
            );
        });
    });
});

describe("selectors", () => {
    const {selectors} = onboardingSlice;

    const createNewStoreState = (newState: Partial<OnboardingSliceState>) => ({
        [mounts.onboarding]: {
            ...initialState,
            ...newState
        }
    });

    describe("selectCurrentStep", () => {
        it("can get the current step", () => {
            const state = createNewStoreState({currentStep: 1});
            expect(selectors.selectCurrentStep(state)).toEqual(1);
        });
    });

    describe("selectAccountsByType", () => {
        it("can get the slice of the accounts corresponding to a type", () => {
            const state = createNewStoreState({});
            expect(selectors.selectAccountsByType(Account.ASSET)(state)).toEqual(
                Object.values(initialState.accounts[Account.ASSET])
            );
        });
    });

    describe("selectSelectedIds", () => {
        it("can get the selected accounts IDs map", () => {
            const state = createNewStoreState({});
            expect(selectors.selectSelectedIds(state)).toEqual(initialState.selectedAccounts);
        });
    });

    describe("selectSelectedAccount", () => {
        it("can get the selected state for a single account", () => {
            const state = createNewStoreState({});

            expect(selectors.selectSelectedAccount(defaultAssets[0].id)(state)).toEqual(
                initialState.selectedAccounts[defaultAssets[0].id]
            );
        });
    });

    describe("selectSelectedAccounts", () => {
        it("can get all of the selected accounts", () => {
            const state = createNewStoreState({});

            expect(selectors.selectSelectedAccounts(state)).toEqual({
                [Account.ASSET]: [defaultAssets[0], defaultAssets[1], defaultAssets[2]],
                [Account.LIABILITY]: [
                    defaultLiabilities[0],
                    defaultLiabilities[1],
                    defaultLiabilities[3]
                ],
                [Account.INCOME]: [defaultIncome[0], defaultIncome[2], defaultIncome[3]],
                [Account.EXPENSE]: [defaultExpenses[0], defaultExpenses[2], defaultExpenses[3]]
            });
        });
    });

    describe("selectSelectedAccountsList", () => {
        it("can get all of the selected accounts as a single list", () => {
            const state = createNewStoreState({});

            expect(selectors.selectSelectedAccountsList(state)).toEqual([
                defaultAssets[0],
                defaultAssets[1],
                defaultAssets[2],
                defaultLiabilities[0],
                defaultLiabilities[1],
                defaultLiabilities[3],
                defaultIncome[0],
                defaultIncome[2],
                defaultIncome[3],
                defaultExpenses[0],
                defaultExpenses[2],
                defaultExpenses[3]
            ]);
        });
    });
});
