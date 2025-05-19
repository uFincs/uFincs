import {createSelector, PayloadAction} from "@reduxjs/toolkit";
import {
    AccountData,
    BulkEditableTransactionProperty,
    ImportableTransaction,
    ImportableTransactionData,
    ImportProfileMappingField,
    Transaction,
    TransactionData,
    TransactionType
} from "models/";
import {ValueConversion} from "services/";
import mounts from "store/mountpoints";
import {State} from "store/types";
import {createRequestSlices, createSliceWithSelectors, routerResetCaseReducers} from "store/utils";
import {deepClone} from "utils/helperFunctions";
import objectReduce from "utils/objectReduce";
import {CsvFileContents, Id} from "utils/types";
import {DerivedAppScreenUrls, ModalsThatDontResetImport} from "values/screenUrls";
import steps, {STEP_INDICES} from "values/transactionsImportSteps";
import {accountsSlice} from "./accounts.slice";
import {importProfilesSlice} from "./importProfiles.slice";

/* State */

/** These 'sections' map to the tabs in the MapCsv step.
 *
 *  Note that, when there are no existing profiles, then there is actually only 1 section,
 *  which is the 'new' section. As such, we have to be careful to treat '0' as 'new' in that case. */
export enum ImportProfileSection {
    existing = 0,
    new = 1
}

export interface TransactionsImportSliceState {
    currentStep: number;
    loadingStep: boolean;
    accountId: Id;
    fileName: string;
    fileContents: CsvFileContents;
    activeImportProfileSection: ImportProfileSection;
    importProfileId: Id;
    newImportProfileName: string;
    newImportProfileFields: Array<ImportProfileMappingField>;
    activeRuleIds: Array<Id>;
    areRulesEnabled: boolean;
    markInvalidTransactions: boolean;
    transactions: Record<Id, ImportableTransactionData>;
    transactionsFromRules: Record<Id, ImportableTransactionData>;
    cleanTransactions: Record<Id, TransactionData>;
}

export const initialState: TransactionsImportSliceState = {
    // Index of the current step
    currentStep: STEP_INDICES.CHOOSE_ACCOUNT,
    // A loading state that can be used between steps to indicate that the next step is being loaded
    // As in, "loading step?" and not "the step being loaded" (hence a boolean flag)
    loadingStep: false,
    // The ID of the account from the Choose Account step
    accountId: "",
    // The name of the file from the Choose File step
    fileName: "",
    // The rows from the CSV file (a 2D array)
    fileContents: [],
    // The active section for the MapCsv step (that handles import profiles).
    // Need to manage this as part of the slice state so that we can correctly determine the action
    // to dispatch for the StepNavigationButtons in the ProgressStepper.
    //
    // Note: ImportProfileSection.existing is actually the 'new' tab when there are no existing profiles.
    activeImportProfileSection: ImportProfileSection.existing,
    // The ID of the import profile from the Map CSV step
    importProfileId: "",
    // The name for a new import profile created by the user.
    newImportProfileName: "",
    // The fields for a new import profile created by the user.
    newImportProfileFields: [],
    // The array of IDs for which rules are currently active.
    // Which rules are active is determined as a side effect of applying the rules to the transaction.
    activeRuleIds: [],
    // Whether the rules are enabled or not.
    // This controls whether to use `transactionsFromRules` or `transactions`.
    areRulesEnabled: true,
    // Whether or not to 'mark' (i.e. highlight) transactions that are invalid.
    // This is enabled once the user 'frustration' clicks the disabled 'Next' button during
    // the Adjust Transactions step.
    markInvalidTransactions: false,
    // The transactions parsed directly from `fileContents` using the import profile for the Adjust Transactions step.
    transactions: {},
    // The `transactions` after having the rules applied.
    transactionsFromRules: {},
    // The transactions with some minor cleaning applied for presentation in the Complete Import step.
    cleanTransactions: {}
};

/* Slice Helper Functions */

/** Determines whether or not the user can move to the next step. */
export const canGotoNextStep = (
    storeState: State,
    state: TransactionsImportSliceState,
    accountsById: Record<Id, AccountData> = {}
): boolean => {
    switch (state.currentStep) {
        case STEP_INDICES.CHOOSE_ACCOUNT:
            return !!state.accountId;
        case STEP_INDICES.CHOOSE_FILE:
            return !!state.fileName && !!state.fileContents.length;
        case STEP_INDICES.MAP_FIELDS: {
            const isNewProfileSection = selectIsNewProfileSection(storeState);

            if (isNewProfileSection) {
                return !!state.newImportProfileName;
            } else {
                return !!state.importProfileId;
            }
        }
        case STEP_INDICES.ADJUST_TRANSACTIONS: {
            // Use the selector here so that we correctly choose between `transactions` and
            // `transactionsFromRules`.
            const transactions = selectAllTransactions(storeState);

            return transactionsAreValid(transactions, accountsById);
        }
        case STEP_INDICES.COMPLETE_IMPORT:
            return true;
        default:
            return false;
    }
};

/** Gives the user a reason for why they can't move to the next step. */
export const nextStepDisabledReason = (
    storeState: State,
    state: TransactionsImportSliceState,
    accountsById: Record<Id, AccountData> = {}
): string => {
    switch (state.currentStep) {
        case STEP_INDICES.CHOOSE_ACCOUNT:
            return "You must choose an account";
        case STEP_INDICES.CHOOSE_FILE:
            return "You must choose a valid CSV file";
        case STEP_INDICES.MAP_FIELDS: {
            const isNewProfileSection = selectIsNewProfileSection(storeState);

            if (isNewProfileSection) {
                return "The new format needs a name";
            } else {
                return "You must choose an existing format";
            }
        }
        case STEP_INDICES.ADJUST_TRANSACTIONS: {
            // Use the selector here so that we correctly choose between `transactions` and
            // `transactionsFromRules`.
            const transactions = selectAllTransactions(storeState);

            return whyTransactionsArentValid(transactions, accountsById).message;
        }
        case STEP_INDICES.COMPLETE_IMPORT:
            return "";
        default:
            return "";
    }
};

/** Checks to make sure all of the required transaction fields have been filled in. */
const transactionsAreValid = (
    transactions: Record<Id, ImportableTransactionData>,
    accountsById: Record<Id, AccountData>
): boolean => {
    const numberOfTransactions = Object.keys(transactions).length;

    if (numberOfTransactions === 0) {
        return false;
    }

    const duplicateTransactions: Array<ImportableTransactionData> = [];

    for (const transaction of Object.values(transactions)) {
        const {
            creditAccountId,
            debitAccountId,
            amount,
            description,
            date,
            type,
            includeInImport,
            isDuplicate
        } = transaction;

        if (
            (!creditAccountId ||
                !debitAccountId ||
                !amount ||
                !description ||
                !date ||
                !type ||
                !Transaction.accountsAreValid(transaction, accountsById)) &&
            includeInImport
        ) {
            return false;
        }

        if (isDuplicate && !includeInImport) {
            duplicateTransactions.push(transaction);
        }
    }

    return !(duplicateTransactions.length === numberOfTransactions);
};

/** Determines the reason why the transactions aren't valid;
 *  that is, which field hasn't been filled in. */
const whyTransactionsArentValid = (
    transactions: Record<Id, ImportableTransactionData>,
    accountsById: Record<Id, AccountData>
): {id: Id; message: string} => {
    const transactionsList = Object.values(transactions);
    const numberOfTransactions = transactionsList.length;

    if (numberOfTransactions === 0) {
        return {
            message: "There aren't any transactions; honestly, not sure how you got here",
            id: ""
        };
    }

    const duplicateTransactions: Array<ImportableTransactionData> = [];

    for (let i = 0; i < transactionsList.length; i++) {
        const transaction = transactionsList[i];

        const {
            id,
            creditAccountId,
            debitAccountId,
            amount,
            description,
            date,
            type,
            includeInImport,
            isDuplicate
        } = transaction;

        if (includeInImport) {
            let prefix = `Transaction ${i + 1}`;

            if (!description) {
                return {message: `${prefix} is missing a description`, id};
            }

            prefix += ` ("${description}")`;

            if (!amount) {
                return {message: `${prefix} is missing an amount`, id};
            }

            if (!date) {
                return {message: `${prefix} is missing a date`, id};
            }

            if (!type) {
                return {message: `${prefix} is missing a type`, id};
            }

            if (!creditAccountId || !debitAccountId) {
                return {message: `${prefix} is missing an account`, id};
            }

            if (!Transaction.accountsAreValid(transaction, accountsById)) {
                return {message: `${prefix} has an invalid mix of accounts`, id};
            }
        } else if (isDuplicate) {
            duplicateTransactions.push(transaction);
        }
    }

    if (duplicateTransactions.length === numberOfTransactions) {
        return {message: "You haven't included any transactions for import", id: ""};
    } else {
        return {message: "", id: ""};
    }
};

/* Selectors */

const selectState = (state: State): TransactionsImportSliceState =>
    state[mounts.transactionsImport];

const selectCurrentStep = createSelector([selectState], (state) => state.currentStep);
const selectLoadingStep = createSelector([selectState], (state) => state.loadingStep);

const selectAccountId = createSelector([selectState], (state) => state.accountId);

const selectFileName = createSelector([selectState], (state) => state.fileName);
const selectFileContents = createSelector([selectState], (state) => state.fileContents);

const selectFileContentsSample = createSelector([selectFileContents], (fileContents) =>
    fileContents.length ? fileContents.slice(0, 5) : []
);

const selectActiveImportProfileSection = createSelector(
    [selectState],
    (state) => state.activeImportProfileSection
);

// This selector is.. its own selector because it's needed in two places: in `selectIsNewProfileSection`
// and `connect` for `MapCsvStep`.
//
// Another instance of a blasphemous 'cross slice' selector... see below for more examples.
const selectAnyExistingImportProfiles = createSelector(
    [importProfilesSlice.selectors.selectImportProfiles],
    (profiles) => Object.values(profiles).length > 0
);

const selectIsNewProfileSection = createSelector(
    [selectActiveImportProfileSection, selectAnyExistingImportProfiles],
    (section, anyExistingProfiles) =>
        anyExistingProfiles ? section === ImportProfileSection.new : true
);

const selectImportProfileId = createSelector([selectState], (state) => state.importProfileId);

const selectNewImportProfileName = createSelector(
    [selectState],
    (state) => state.newImportProfileName
);
const selectNewImportProfileFields = createSelector(
    [selectState],
    (state) => state.newImportProfileFields
);

const selectActiveRuleIds = createSelector([selectState], (state) => state.activeRuleIds);
const selectAreRulesEnabled = createSelector([selectState], (state) => state.areRulesEnabled);

const selectMarkInvalidTransactions = createSelector(
    [selectState],
    (state) => state.markInvalidTransactions
);

// The 'raw' transactions are just the transactions without the rules applied.
// This selector is needed separate so that we can re-apply the rules whenever new rules are
// added/updated.
const selectRawTransactions = createSelector([selectState], (state) => state.transactions);

// This selector isn't needed externally (hence why it isn't exported); it's just used
// in `selectAllTransactions` to mirror `selectRawTransactions`.
const selectTransactionsFromRules = createSelector(
    [selectState],
    (state) => state.transactionsFromRules
);

// 'All' transactions is somewhat of a misnomer... the functionality kind of changed since it was
// originally named. It now selects 'all' of the transactions, based on whether or not rules
// are active — that is, it just picks between `transactions` and `transactionsFromRules`.
const selectAllTransactions = createSelector(
    [selectRawTransactions, selectTransactionsFromRules, selectAreRulesEnabled],
    (transactions, transactionsFromRules, areRulesEnabled) =>
        areRulesEnabled ? transactionsFromRules : transactions
);

const selectTransaction = (id: Id) => createSelector([selectAllTransactions], (byId) => byId[id]);

// Note: This actually selects all non-duplicate transactions.
// Use `selectDuplicateTransactions` to get the rest (i.e. duplicates).
const selectTransactions = createSelector([selectAllTransactions], (transactions) =>
    objectReduce(transactions, (transaction) => !transaction.isDuplicate && transaction)
);

const selectTransactionsList = createSelector([selectTransactions], Object.values);

const selectDuplicateTransactions = createSelector([selectAllTransactions], (transactions) =>
    objectReduce(transactions, (transaction) => transaction.isDuplicate && transaction)
);

const selectDuplicateTransactionsList = createSelector(
    [selectDuplicateTransactions],
    Object.values
);

const selectCleanTransactions = createSelector([selectState], (state) =>
    objectReduce(state.cleanTransactions, (transaction) => new Transaction(transaction))
);

const selectCleanTransactionsList = createSelector([selectCleanTransactions], Object.values);

const selectCleanTransaction = (id: Id) =>
    createSelector([selectCleanTransactions], (byId) => byId[id]);

// OK, this is super duper ridiculously sacrilegious: we're creating a cross-slice selector in a slice file.
// In fact, we're creating _two_!! (see the next one down)
//
// Yes, this is terrible as far as encapsulation and existing paradigms go. Yes, I am too lazy to refactor
// everything to accommodate this change. So... TECH DEBT.
const selectCanGotoNextStep = createSelector(
    [(state: any) => state, selectState, accountsSlice.selectors.selectAccounts],
    canGotoNextStep
);

const selectNextStepDisabledReason = createSelector(
    [(state: any) => state, selectState, accountsSlice.selectors.selectAccounts],
    nextStepDisabledReason
);

const selectInvalidTransactionId = createSelector(
    [selectAllTransactions, accountsSlice.selectors.selectAccounts],
    (transactions, accounts) => whyTransactionsArentValid(transactions, accounts).id
);

const selectors = {
    selectTransactionsImport: selectState,
    selectCurrentStep,
    selectLoadingStep,
    selectAccountId,
    selectFileName,
    selectFileContents,
    selectFileContentsSample,
    selectActiveImportProfileSection,
    selectAnyExistingImportProfiles,
    selectIsNewProfileSection,
    selectImportProfileId,
    selectNewImportProfileFields,
    selectNewImportProfileName,
    selectActiveRuleIds,
    selectAreRulesEnabled,
    selectMarkInvalidTransactions,
    selectRawTransactions,
    selectAllTransactions,
    selectTransaction,
    selectTransactions,
    selectTransactionsList,
    selectDuplicateTransactions,
    selectDuplicateTransactionsList,
    selectCleanTransactions,
    selectCleanTransactionsList,
    selectCleanTransaction,
    selectCanGotoNextStep,
    selectNextStepDisabledReason,
    selectInvalidTransactionId
};

/* Slice */

export const transactionsImportSlice = createSliceWithSelectors({
    name: mounts.transactionsImport,
    initialState,
    reducers: {
        resetState: () => initialState,
        setCurrentStep: (state: TransactionsImportSliceState, action: PayloadAction<number>) => {
            // Expects a Step index as payload.
            const nextStepState = action.payload;

            // Only allow traveling backwards when manually setting the step.
            // Used by, e.g., the ImportStepper.
            if (nextStepState < state.currentStep) {
                // Prevent setting a step index greater than the number of steps and less than 0.
                state.currentStep = Math.min(steps.length - 1, Math.max(0, nextStepState));
            }
        },
        setLoadingStep: (state: TransactionsImportSliceState, action: PayloadAction<boolean>) => {
            state.loadingStep = action.payload;
        },
        gotoNextStep: (state: TransactionsImportSliceState) => {
            // Note: At one point, this action was guarded by a call to `canGotoNextStep`.
            // However, ever since the introduction of advanced transaction validation to ensure that
            // the accounts are valid (i.e. ever since needing to pass in the accounts as a param),
            // we can't do that check here since it is now dependent on state from outside the slice.
            state.currentStep = Math.min(steps.length - 1, state.currentStep + 1);
        },
        gotoPreviousStep: (state: TransactionsImportSliceState) => {
            state.currentStep = Math.max(0, state.currentStep - 1);
        },
        // Use custom actions for going to the Adjust Transactions step so that we can
        // properly wrap it in a loading state.
        startMoveToAdjustTransactionsStep: (state: TransactionsImportSliceState) => {
            state.loadingStep = true;
        },
        finishMoveToAdjustTransactionsStep: (state: TransactionsImportSliceState) => {
            state.loadingStep = false;
            state.currentStep = STEP_INDICES.ADJUST_TRANSACTIONS;
        },
        setAccountId: (state: TransactionsImportSliceState, action: PayloadAction<Id>) => {
            state.accountId = action.payload;

            // Clear all later steps' state.
            state.fileName = "";
            state.fileContents = [];
            state.importProfileId = "";
            state.areRulesEnabled = true;
            state.markInvalidTransactions = false;
            state.transactions = {};
            state.transactionsFromRules = {};
            state.cleanTransactions = {};
        },
        setFileName: (state: TransactionsImportSliceState, action: PayloadAction<string>) => {
            state.fileName = action.payload;

            // Clear all later steps' state.
            state.importProfileId = "";
            state.areRulesEnabled = true;
            state.markInvalidTransactions = false;
            state.transactions = {};
            state.transactionsFromRules = {};
            state.cleanTransactions = {};
        },
        setFileContents: (
            state: TransactionsImportSliceState,
            action: PayloadAction<CsvFileContents>
        ) => {
            // Expects an array of file rows (from e.g. a CSV).
            state.fileContents = action.payload;

            // Set the number of fields for a potential new import profile.
            state.newImportProfileFields = new Array(action.payload?.[0]?.length || 0).fill("");
        },
        setActiveImportProfileSection: (
            state: TransactionsImportSliceState,
            action: PayloadAction<ImportProfileSection>
        ) => {
            state.activeImportProfileSection = action.payload;
        },
        setImportProfileId: (state: TransactionsImportSliceState, action: PayloadAction<Id>) => {
            // Expects an Import Profile ID as payload.
            state.importProfileId = action.payload;

            // Clear all later steps' state.
            state.areRulesEnabled = true;
            state.markInvalidTransactions = false;
            state.transactions = {};
            state.transactionsFromRules = {};
            state.cleanTransactions = {};
        },
        setNewImportProfileName: (
            state: TransactionsImportSliceState,
            action: PayloadAction<string>
        ) => {
            state.newImportProfileName = action.payload;

            // Clear all later steps' state.
            state.areRulesEnabled = true;
            state.markInvalidTransactions = false;
            state.transactions = {};
            state.transactionsFromRules = {};
            state.cleanTransactions = {};
        },
        updateNewImportProfileField: (
            state: TransactionsImportSliceState,
            action: PayloadAction<{index: number; value: ImportProfileMappingField}>
        ) => {
            const {index, value} = action.payload;
            state.newImportProfileFields[index] = value;

            // Clear all later steps' state.
            state.areRulesEnabled = true;
            state.markInvalidTransactions = false;
            state.transactions = {};
            state.transactionsFromRules = {};
            state.cleanTransactions = {};
        },
        setAreRulesEnabled: (
            state: TransactionsImportSliceState,
            action: PayloadAction<boolean>
        ) => {
            state.areRulesEnabled = action.payload;
        },
        setMarkInvalidTransactions: (
            state: TransactionsImportSliceState,
            action: PayloadAction<boolean>
        ) => {
            state.markInvalidTransactions = action.payload;
        },
        setActiveRuleIds: (
            state: TransactionsImportSliceState,
            action: PayloadAction<Array<Id>>
        ) => {
            state.activeRuleIds = action.payload;
        },
        setTransactionsFromRules: (
            state: TransactionsImportSliceState,
            action: PayloadAction<Record<Id, ImportableTransactionData>>
        ) => {
            state.transactionsFromRules = action.payload;

            // Clear all later steps' state.
            state.cleanTransactions = {};

            // Reset these flags. This is to cover the case when going back and forward a step.
            state.areRulesEnabled = true;
            state.markInvalidTransactions = false;
        },
        setTransactions: (
            state: TransactionsImportSliceState,
            action: PayloadAction<Record<Id, ImportableTransactionData>>
        ) => {
            // Expects an object of Transaction objects keyed by ID.
            state.transactions = action.payload;

            // Clear all later steps' state.
            state.cleanTransactions = {};

            // Reset these flags. This is to cover the case when going back and forward a step.
            state.areRulesEnabled = true;
            state.markInvalidTransactions = false;
        },
        updateTransaction: (
            state: TransactionsImportSliceState,
            // Note: Because this transaction update comes from the `TransactionForm`,
            // the payload is a regular Transaction, not an ImportableTransaction.
            action: PayloadAction<TransactionData>
        ) => {
            const {id} = action.payload;

            // Ignore transactions that don't already exist.
            if (!(id in state.transactions) || !(id in state.transactionsFromRules)) {
                return state;
            }

            // See bulkUpdateTransactions for why we're using cloned state.
            // Technically, I was unable to replicate the proxy errors when updating a single transaction,
            // but I figured it was better safe than sorry to operate on cloned state here as well.
            const newState = deepClone(state);

            newState.transactions[id] = new ImportableTransaction({
                ...newState.transactions[id],
                ...action.payload
            });

            newState.transactionsFromRules[id] = new ImportableTransaction({
                ...newState.transactionsFromRules[id],
                ...action.payload
            });

            return newState;
        },
        bulkUpdateTransactions: (
            state: TransactionsImportSliceState,
            action: PayloadAction<{
                ids: Array<Id>;
                property: BulkEditableTransactionProperty;
                newValue: string;
            }>
        ) => {
            // I was getting proxy errors (from Immer) when trying to modify the state directly.
            // As a result, we have to operate on a (deep) copy of the state for this to work correctly.
            const newState = deepClone(state);

            const {ids, property, newValue} = action.payload;

            let value: boolean | number | string = newValue;

            if (property === "amount") {
                // Since the newValue comes in as a string, we have to convert it to a number
                // (cents) for `amount`.
                value = ValueConversion.convertDollarsToCents(newValue);
            } else if (property === "includeInImport") {
                // Since the newValue comes in as a string, we have to convert it to a boolean for
                // `includeInImport`. It can be "false" or "true".
                value = newValue === "true";
            }

            for (const id of ids) {
                applyBulkTransactionUpdate(newState.transactions, id, property, value);
                applyBulkTransactionUpdate(newState.transactionsFromRules, id, property, value);
            }

            return newState;
        },
        setCleanTransactions: (
            state: TransactionsImportSliceState,
            action: PayloadAction<Record<Id, TransactionData>>
        ) => {
            state.cleanTransactions = action.payload;
        },

        /* Saga Only Actions */
        parseFile: (state: TransactionsImportSliceState, _action: PayloadAction<File>) => state
    },
    // Need to _not_ reset the state when navigating away to any other `/import` URL.
    // In particular, this means not resetting state when using the `TransactionsImportEditForm`.
    // Otherwise, the entire state gets cleared when trying to edit a single transaction
    // during the Adjust Transactions step.
    extraReducers: routerResetCaseReducers(initialState, [
        DerivedAppScreenUrls.TRANSACTIONS_IMPORT,
        // Don't clear the state when using any of the modal forms, since they are supposed to just
        // slide over the current scene without any problems.
        // This is more important for the Account and Rule forms, since users might want to
        // create accounts/rules while adjusting their transactions.
        // The Transaction form is included just for consistency.
        ...ModalsThatDontResetImport
    ]),
    selectors
});

/* Requests Slice */

export const transactionsImportRequestsSlice = createRequestSlices(
    mounts.transactionsImportRequests,
    ["createImportProfile", "import"]
);

/* Helper Functions */

const applyBulkTransactionUpdate = (
    transactionsById: Record<Id, ImportableTransactionData>,
    id: Id,
    property: string,
    value: string | number | boolean
) => {
    const newValues = {[property]: value};

    // Ignore transactions that don't already exist.
    if (id in transactionsById) {
        const existingTransaction = transactionsById[id];

        if (property === "type") {
            // Need to make sure the account IDs get swapped around correctly.
            ImportableTransaction.swapAccountsForNewType(
                existingTransaction,
                value as TransactionType
            );
        }

        transactionsById[id] = new ImportableTransaction({
            ...existingTransaction,
            ...newValues
        });
    }
};
