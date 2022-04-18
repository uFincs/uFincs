import {createSelector, PayloadAction} from "@reduxjs/toolkit";
import {Account, AccountData, AccountType, BulkEditableAccountProperty} from "models/";
import {ValueConversion} from "services/";
import {State} from "store/";
import mounts from "store/mountpoints";
import {
    createOfflineRequestSlices,
    createSliceWithSelectors,
    routerResetCaseReducers
} from "store/utils";
import {deepClone} from "utils/helperFunctions";
import objectReduce from "utils/objectReduce";
import {Id} from "utils/types";
import inputValidation from "values/inputValidation";
import steps, {STEP_INDICES} from "values/onboardingSteps";

/* State */

export interface OnboardingSliceState {
    /** The current step that the user is on in the onboarding process. */
    currentStep: number;

    /** The set of the accounts the user wants to create, broken down by type.
     *  Is filled with some defaults for them to pick from. */
    accounts: Record<AccountType, Record<Id, AccountData>>;

    /** A map of which accounts the user has selected to create. */
    selectedAccounts: Record<Id, boolean>;
}

export const defaultAssets = [
    new Account({name: "Chequing Account", type: Account.ASSET}),
    new Account({name: "Cash", type: Account.ASSET}),
    new Account({name: "Savings Account", type: Account.ASSET}),
    new Account({name: "Retirement Savings", type: Account.ASSET})
];

export const defaultLiabilities = [
    new Account({name: "Credit Card", type: Account.LIABILITY}),
    new Account({name: "Mortgage", type: Account.LIABILITY}),
    new Account({name: "Loan to Friend", type: Account.LIABILITY}),
    new Account({name: "Line of Credit", type: Account.LIABILITY})
];

export const defaultIncome = [
    new Account({name: "Salary", type: Account.INCOME}),
    new Account({name: "Gifts Received", type: Account.INCOME}),
    new Account({name: "Interest", type: Account.INCOME}),
    new Account({name: "Other Income", type: Account.INCOME})
];

export const defaultExpenses = [
    new Account({name: "Rent", type: Account.EXPENSE}),
    new Account({name: "Netflix", type: Account.EXPENSE}),
    new Account({name: "Groceries", type: Account.EXPENSE}),
    new Account({name: "Takeout", type: Account.EXPENSE})
];

export const initialState: OnboardingSliceState = {
    currentStep: STEP_INDICES.ASSETS,
    accounts: {
        [Account.ASSET]: {
            [defaultAssets[0].id]: defaultAssets[0],
            [defaultAssets[1].id]: defaultAssets[1],
            [defaultAssets[2].id]: defaultAssets[2],
            [defaultAssets[3].id]: defaultAssets[3]
        },
        [Account.LIABILITY]: {
            [defaultLiabilities[0].id]: defaultLiabilities[0],
            [defaultLiabilities[1].id]: defaultLiabilities[1],
            [defaultLiabilities[2].id]: defaultLiabilities[2],
            [defaultLiabilities[3].id]: defaultLiabilities[3]
        },
        [Account.INCOME]: {
            [defaultIncome[0].id]: defaultIncome[0],
            [defaultIncome[1].id]: defaultIncome[1],
            [defaultIncome[2].id]: defaultIncome[2],
            [defaultIncome[3].id]: defaultIncome[3]
        },
        [Account.EXPENSE]: {
            [defaultExpenses[0].id]: defaultExpenses[0],
            [defaultExpenses[1].id]: defaultExpenses[1],
            [defaultExpenses[2].id]: defaultExpenses[2],
            [defaultExpenses[3].id]: defaultExpenses[3]
        }
    } as unknown as Record<AccountType, Record<Id, AccountData>>,
    selectedAccounts: {
        [defaultAssets[0].id]: true,
        [defaultAssets[1].id]: true,
        [defaultAssets[2].id]: true,
        [defaultAssets[3].id]: false,
        [defaultLiabilities[0].id]: true,
        [defaultLiabilities[1].id]: true,
        [defaultLiabilities[2].id]: false,
        [defaultLiabilities[3].id]: true,
        [defaultIncome[0].id]: true,
        [defaultIncome[1].id]: false,
        [defaultIncome[2].id]: true,
        [defaultIncome[3].id]: true,
        [defaultExpenses[0].id]: true,
        [defaultExpenses[1].id]: false,
        [defaultExpenses[2].id]: true,
        [defaultExpenses[3].id]: true
    }
};

/* Slice Helper Functions */

export const canGotoNextStep = (state: OnboardingSliceState): boolean => {
    switch (state.currentStep) {
        case STEP_INDICES.ASSETS:
            return accountsAreValid(state, Account.ASSET).valid;
        case STEP_INDICES.LIABILITIES:
            return accountsAreValid(state, Account.LIABILITY).valid;
        case STEP_INDICES.INCOME:
            return accountsAreValid(state, Account.INCOME).valid;
        case STEP_INDICES.EXPENSES:
            return accountsAreValid(state, Account.EXPENSE).valid;
        case STEP_INDICES.FINISH_SETUP:
            return true;
        default:
            return false;
    }
};

export const nextStepDisabledReason = (state: OnboardingSliceState): string => {
    switch (state.currentStep) {
        case STEP_INDICES.ASSETS:
            return accountsAreValid(state, Account.ASSET).message;
        case STEP_INDICES.LIABILITIES:
            return accountsAreValid(state, Account.LIABILITY).message;
        case STEP_INDICES.INCOME:
            return accountsAreValid(state, Account.INCOME).message;
        case STEP_INDICES.EXPENSES:
            return accountsAreValid(state, Account.EXPENSE).message;
        case STEP_INDICES.FINISH_SETUP:
            return "";
        default:
            return "";
    }
};

const accountsAreValid = (state: OnboardingSliceState, type: AccountType) => {
    const accounts = state.accounts[type];

    if (Object.keys(accounts).length === 0) {
        return {valid: false, message: `You need at least 1 ${type} account`};
    } else if (Object.values(accounts).filter(({id}) => state.selectedAccounts[id]).length === 0) {
        return {valid: false, message: `You need at least 1 selected ${type} account`};
    } else {
        const allSelectedHaveNames = Object.values(accounts).reduce((acc, {id, name}) => {
            if (state.selectedAccounts[id]) {
                return acc && !!name;
            } else {
                return acc;
            }
        }, true);

        return {
            valid: allSelectedHaveNames,
            message: "One or more selected accounts have an empty name"
        };
    }
};

/* Selectors */

const selectState = (state: State): OnboardingSliceState => state[mounts.onboarding];

const selectCurrentStep = createSelector([selectState], (state) => state.currentStep);
const selectCanGotoNextStep = createSelector([selectState], canGotoNextStep);
const selectNextStepDisabledReason = createSelector([selectState], nextStepDisabledReason);

const selectAccounts = createSelector([selectState], (state) => state.accounts);

const selectAccountsByType = (type: AccountType) =>
    createSelector([selectAccounts], (accounts) => Object.values(accounts[type]));

const selectSelectedIds = createSelector([selectState], (state) => state.selectedAccounts);

const selectSelectedAccount = (id: Id) =>
    createSelector([selectSelectedIds], (accounts) => accounts[id]);

const selectSelectedAccounts = createSelector(
    [selectSelectedIds, selectAccounts],
    (ids, accountsByType) =>
        objectReduce(accountsByType, (accounts) =>
            Object.values(accounts).filter(({id}) => ids[id])
        )
);

const selectSelectedAccountsList = createSelector([selectSelectedAccounts], (accountsByType) =>
    (Object.keys(accountsByType) as Array<AccountType>).reduce((acc, type) => {
        acc = [...acc, ...Object.values(accountsByType[type])];
        return acc;
    }, [] as Array<AccountData>)
);

const selectors = {
    selectOnboarding: selectState,
    selectCurrentStep,
    selectCanGotoNextStep,
    selectNextStepDisabledReason,
    selectAccountsByType,
    selectSelectedIds,
    selectSelectedAccount,
    selectSelectedAccounts,
    selectSelectedAccountsList
};

/* Slice */

export const onboardingSlice = createSliceWithSelectors({
    name: mounts.onboarding,
    initialState,
    reducers: {
        setCurrentStep: (state: OnboardingSliceState, action: PayloadAction<number>) => {
            const nextStep = action.payload;

            if (nextStep < state.currentStep) {
                state.currentStep = Math.min(steps.length - 1, Math.max(0, nextStep));
            }
        },
        gotoNextStep: (state: OnboardingSliceState) => {
            if (canGotoNextStep(state)) {
                state.currentStep = Math.min(steps.length - 1, state.currentStep + 1);
            }
        },
        gotoPreviousStep: (state: OnboardingSliceState) => {
            state.currentStep = Math.max(0, state.currentStep - 1);
        },
        newAccount: (state: OnboardingSliceState, action: PayloadAction<AccountType>) => {
            const type = action.payload;
            const account = new Account({type});

            state.accounts[type][account.id] = account;
            state.selectedAccounts[account.id] = true;
        },
        updateAccount: (
            state: OnboardingSliceState,
            action: PayloadAction<{
                id: Id;
                type: AccountType;
                property: BulkEditableAccountProperty;
                newValue: string;
            }>
        ) => {
            const newState = deepClone(state);

            const {id, type, property, newValue} = action.payload;

            let value: number | string = newValue;

            if (property === "openingBalance") {
                value = ValueConversion.convertDollarsToCents(newValue);

                // Since we don't use a form for the SelectableAccountsList, we need to do the
                // input validation here. Except instead of giving users error messages when they
                // try and trick us, we just truncate their inputs.
                value = value > inputValidation.maxNumber ? inputValidation.maxNumber : value;
            } else if (property === "name") {
                value =
                    value.length > inputValidation.maxNameLength
                        ? value.substring(0, inputValidation.maxNameLength)
                        : value;
            }

            if (id in newState.accounts[type]) {
                const existingAccount = newState.accounts[type][id];
                const newProperties = {[property]: value};

                newState.accounts[type][id] = new Account({
                    ...existingAccount,
                    ...newProperties
                });
            }

            return newState;
        },
        setAccountSelected: (
            state: OnboardingSliceState,
            action: PayloadAction<{id: string; selected: boolean}>
        ) => {
            const {id, selected} = action.payload;

            state.selectedAccounts[id] = selected;
        }
    },
    extraReducers: routerResetCaseReducers(initialState),
    selectors
});

/* Requests Slice */

export const onboardingRequestsSlice = createOfflineRequestSlices(mounts.onboardingRequests, [
    "finishOnboarding",
    "skipOnboarding",
    "useDemoData"
]);
