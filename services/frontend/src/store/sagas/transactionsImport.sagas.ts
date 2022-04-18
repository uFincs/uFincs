import {PayloadAction} from "@reduxjs/toolkit";
import {push} from "connected-react-router";
import {all, call, delay, fork, put, race, select, take, takeEvery} from "redux-saga/effects";
import {
    ImportProfile,
    ImportProfileMapping,
    ImportRuleData,
    ImportableTransactionData,
    Transaction,
    TransactionData,
    ImportableTransaction,
    ImportProfileMappingField
} from "models/";
import {CsvParser, ImportRulesApplier, ValueConversion} from "services/";
import {
    accountsSlice,
    crossSliceSelectors,
    importProfilesRequestsSlice,
    importRulesRequestsSlice,
    importRulesSlice,
    toastsSlice,
    transactionsImportSlice,
    transactionsImportRequestsSlice,
    transactionsRequestsSlice,
    transactionsSlice
} from "store/";
import {ErrorToastData, SuccessToastData, WarningToastData} from "structures/";
import {arrayToObject} from "utils/helperFunctions";
import objectReduce from "utils/objectReduce";
import {Id} from "utils/types";
import ScreenUrls from "values/screenUrls";
import {STEP_INDICES} from "values/transactionsImportSteps";

export function* parseFile({payload}: PayloadAction<File>) {
    // The payload is a File object: https://developer.mozilla.org/en-US/docs/Web/API/File
    const file = payload;

    try {
        const fileContents = yield call(CsvParser.parseFile, file);

        yield put(transactionsImportSlice.actions.setFileName(file.name));
        yield put(transactionsImportSlice.actions.setFileContents(fileContents));
    } catch (e) {
        const errorToast = new ErrorToastData({message: e.message});
        yield put(toastsSlice.actions.add(errorToast));
    }
}

export function* createImportProfile() {
    const name: string = yield select(transactionsImportSlice.selectors.selectNewImportProfileName);

    const fields: Array<ImportProfileMappingField> = yield select(
        transactionsImportSlice.selectors.selectNewImportProfileFields
    );

    const importProfile = new ImportProfile({name});

    const mappings = fields.map(
        (field, index) =>
            new ImportProfileMapping({
                importProfileId: importProfile.id,
                from: `${index}`,
                to: field
            })
    );

    // Need to set importProfileMappings so that they get created in the backend
    // by the importProfiles service, and get added to the store by the saga.
    importProfile.importProfileMappings = mappings;

    // Need to set importProfileMappingIds so that the store version of the
    // importProfile has the relationship to the mappings.
    // Cause we don't expect importProfileMappings to be set in the store.
    importProfile.importProfileMappingIds = mappings.map(({id}) => id);

    yield put(importProfilesRequestsSlice.create.actions.request(importProfile));
    yield take(importProfilesRequestsSlice.create.actions.success);

    yield put(transactionsImportSlice.actions.setImportProfileId(importProfile.id));
    yield put(transactionsImportSlice.actions.startMoveToAdjustTransactionsStep());
}

export function* parseCsvIntoTransactions() {
    // Need a delay to allow the loading state to render before the all the heavy processing
    // causes the event loop to block.
    yield delay(500);

    // Grab all the necessary store state.
    const fileContents = yield select(transactionsImportSlice.selectors.selectFileContents);
    const importProfile = yield select(crossSliceSelectors.transactionsImport.selectProfile);
    const account = yield select(crossSliceSelectors.transactionsImport.selectAccount);
    const existingTransactions = yield select(transactionsSlice.selectors.selectTransactions);

    // Parse the CSV file into transaction objects.
    const parsedTransactions: Array<ImportableTransaction> = yield call(
        importProfile.convertCsvToTransactions.bind(importProfile),
        fileContents,
        account
    );

    // Mark any possible duplicate transactions.
    yield call(markDuplicates, parsedTransactions, Object.values(existingTransactions));

    // Apply the rules to the parsed transactions.
    yield call(applyRules, parsedTransactions);

    // Convert the raw transaction to an object for storage in the store.
    const transactions = arrayToObject(parsedTransactions);
    yield put(transactionsImportSlice.actions.setTransactions(transactions));

    // I've found that another short delay here helps give time for the storing of large numbers of
    // transactions into the store, such that once we invoke the below action to actually transition
    // to the Adjust Transactions step, there's less visual jank when rendering the transactions
    // table/list.
    yield delay(500);

    // Finish the move to the Adjust Transactions step.
    yield put(transactionsImportSlice.actions.finishMoveToAdjustTransactionsStep());
}

export function* reapplyRulesWhenChanged({payload, type}: PayloadAction<ImportRuleData>) {
    const rule = payload;
    const currentStep: number = yield select(transactionsImportSlice.selectors.selectCurrentStep);

    if (currentStep === STEP_INDICES.ADJUST_TRANSACTIONS) {
        // Need to wait for request commit success, otherwise the rule (when we select it from
        // the store) won't be populated with the actions/conditions.
        //
        // The rule we receive from the payload of the saga is only so that we can get the ID
        // of the rule that was just created (or updated).
        const {failure} = yield race({
            success: take([
                importRulesRequestsSlice.create.actions.success,
                importRulesRequestsSlice.update.actions.success
            ]),
            failure: take([
                importRulesRequestsSlice.create.actions.failure,
                importRulesRequestsSlice.update.actions.failure
            ])
        });

        // We don't care to do anything on failure, so just return.
        if (failure) {
            return;
        }

        const rawTransactions: Record<Id, ImportableTransactionData> = yield select(
            transactionsImportSlice.selectors.selectRawTransactions
        );

        // Apply the rules to the transactions.
        const activeRuleIds: Array<Id> = yield call(applyRules, Object.values(rawTransactions));

        // If the rule that was created isn't an active rule, let the user know with a toast,
        // so that they know that the rule _was_ created, just that it doesn't apply to any
        // transactions.
        if (type === importRulesSlice.actions.add.type && !activeRuleIds.includes(rule.id)) {
            const warningToast = new WarningToastData({
                message:
                    "Your rule was created but doesn't apply to any of the current transactions.",
                title: "Rule not Active"
            });

            yield put(toastsSlice.actions.add(warningToast));
        }
    }
}

export function* cleanTransactionsForSummary() {
    const currentStep = yield select(transactionsImportSlice.selectors.selectCurrentStep);

    if (currentStep === STEP_INDICES.COMPLETE_IMPORT) {
        const transactions = yield select(transactionsImportSlice.selectors.selectAllTransactions);
        const cleanedTransactions = yield call(cleanTransactions, transactions);

        yield put(transactionsImportSlice.actions.setCleanTransactions(cleanedTransactions));
    }
}

export function* importTransactions() {
    const transactions = yield select(transactionsImportSlice.selectors.selectCleanTransactions);

    // Bulk import the transactions.
    yield put(transactionsRequestsSlice.createMany.actions.request(Object.values(transactions)));

    // Wait for the request to succeed or fail.
    const {failure} = yield race({
        success: take(transactionsRequestsSlice.createMany.actions.success),
        failure: take(transactionsRequestsSlice.createMany.actions.failure)
    });

    if (failure) {
        // Rethrow the error with a toast for the user.
        const message = `Failed to import transactions: ${failure.payload.message}`;
        const errorToast = new ErrorToastData({message});
        yield put(toastsSlice.actions.add(errorToast));

        throw new Error(message);
    } else {
        const successToast = new SuccessToastData({message: "Successfully imported transactions!"});
        yield put(toastsSlice.actions.add(successToast));

        yield put(push(ScreenUrls.APP));
        yield put(transactionsImportSlice.actions.resetState());
    }
}

function* transactionsImportSaga() {
    yield fork(
        transactionsImportRequestsSlice.createImportProfile.watchRequestSaga(createImportProfile)
    );

    yield fork(transactionsImportRequestsSlice.import.watchRequestSaga(importTransactions));

    yield all([
        takeEvery(transactionsImportSlice.actions.parseFile, parseFile),
        takeEvery(
            transactionsImportSlice.actions.startMoveToAdjustTransactionsStep,
            parseCsvIntoTransactions
        ),
        takeEvery(
            [
                // Note: The saga actually has to wait for commit success before running, but
                // it needs the payload from the base action to function properly.
                // As such, the saga is initially triggered by base actions to get the payload,
                // but internally waits for commit success to happen.
                importRulesSlice.actions.add,
                importRulesSlice.actions.update
            ],
            reapplyRulesWhenChanged
        ),
        takeEvery(transactionsImportSlice.actions.gotoNextStep, cleanTransactionsForSummary)
    ]);
}

export default transactionsImportSaga;

/* Helper Functions */

// Cleans the transactions for the final summary step by converting the ImportableTransactions
// to just regular transactions and filtering out any transactions marked as not for import.
export const cleanTransactions = (
    transactions: Record<Id, ImportableTransactionData>
): Record<Id, TransactionData> =>
    objectReduce(transactions, (transactionData) => {
        // Filter out all of the transactions marked for not being imported.
        if (!transactionData.includeInImport) {
            return;
        }

        return new Transaction(transactionData);
    });

// Compares the newly parsed transactions against the user's existing transactions
// to see if any are potential duplicates.
//
// Does this by flipping some flags on the new transaction objects, instead of returning
// a whole new list.
export const markDuplicates = (
    parsedTransactions: Array<ImportableTransactionData>,
    existingTransactions: Array<TransactionData>
) => {
    const existingTransactionsIndex = existingTransactions.reduce<Record<string, Id>>(
        (acc, transaction) => {
            acc[generateDuplicationKey(transaction)] = transaction.id;
            return acc;
        },
        {}
    );

    for (const transaction of parsedTransactions) {
        if (generateDuplicationKey(transaction) in existingTransactionsIndex) {
            transaction.isDuplicate = true;
            transaction.includeInImport = false;
        }
    }
};

// Generates a 'duplication key', which is just the concatenation of a transaction's
// date and amount (since those are the two things we use to detect duplication).
//
// This key format allows us to build an index to quickly determine if a new transaction
// shares the same properties as an existing one.
//
// Note that it obviously doesn't matter if multiple existing transactions 'hash' into
// the same key; we're only checking for _any_ existence here...
const generateDuplicationKey = (
    transaction: TransactionData | ImportableTransactionData
): string => {
    let {date, amount} = transaction;

    if (typeof amount === "string") {
        amount = ValueConversion.convertDollarsToCents(amount);
    }

    return `${date}-${Math.abs(amount)}`;
};

// Handles applying the user's rules to the transactions and saving the results to the store.
export function* applyRules(transactions: Array<ImportableTransactionData>) {
    const accountsById = yield select(accountsSlice.selectors.selectAccounts);
    const rules = yield select(crossSliceSelectors.importRules.selectImportRules);

    try {
        const {activeRuleIds, transactions: transactionsFromRules} = yield call(
            ImportRulesApplier.applyRules,
            rules,
            transactions,
            accountsById
        );

        // Save the active rules.
        yield put(transactionsImportSlice.actions.setActiveRuleIds(activeRuleIds));

        // Save the transactions that were applied with the rules.
        //
        // Note: If a user modifies a transaction that was modified by a rule, since user modifications
        // mirror to the raw transactions, there is a possibility that a rule will become 'inactive'
        // when the user adds/updates another rule, since the rule could no longer apply to any
        // transactions.
        //
        // This isn't really a 'bug' per-se, but just something that might confuse a user in the future.
        yield put(transactionsImportSlice.actions.setTransactionsFromRules(transactionsFromRules));

        return activeRuleIds;
    } catch (e) {
        const errorToast = new ErrorToastData({
            message: `Hit an error while applying rules: "${e.message}". Rules have not been applied.`
        });

        yield put(toastsSlice.actions.add(errorToast));

        // Need to still set the `transactionsFromRules` if there's an error, just with
        // the raw transactions. If we don't do this, then, since the rules are enabled by default,
        // nothing will be displayed in the Adjust Transactions step (since it would have been empty).
        yield put(
            transactionsImportSlice.actions.setTransactionsFromRules(arrayToObject(transactions))
        );
    }
}
