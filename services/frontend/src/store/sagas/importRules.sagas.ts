import {PayloadAction} from "@reduxjs/toolkit";
import {all, call, fork, put, race, select, take, takeEvery} from "redux-saga/effects";
import api, {apiErrors} from "api/";
import {
    ImportRule,
    ImportRuleData,
    ImportRuleAction,
    ImportRuleActionData,
    ImportRuleCondition,
    ImportRuleConditionData
} from "models/";
import {
    crossSliceSelectors,
    importRulesSlice,
    importRulesRequestsSlice,
    importRuleActionsSlice,
    importRuleConditionsSlice,
    toastsSlice
} from "store/";
import {rollbackWrapper, showFailureToastSaga} from "store/sagas/utils";
import {MessageToastData, UndoToastData} from "structures/";
import {arrayToObject} from "utils/helperFunctions";
import {Id} from "utils/types";
import {EncryptionSchema} from "vendor/redux-e2e-encryption";

export function* fetchAllEffect() {
    const result: Array<ImportRuleData> = yield call(api.service("importRules").find);

    const rulesById = result.reduce<Record<Id, ImportRuleData>>((acc, ruleData) => {
        const importRuleActionIds = ruleData.importRuleActions!.map(({id}) => id);
        const importRuleConditionIds = ruleData.importRuleConditions!.map(({id}) => id);

        const rule = {...ruleData, importRuleActionIds, importRuleConditionIds};
        rule.importRuleActions = []; // Zero out the actions for storage in the store.
        rule.importRuleConditions = []; // Zero out the conditions for storage in the store.

        acc[rule.id] = rule;

        return acc;
    }, {});

    const {actionsById, conditionsById} = result.reduce<{
        actionsById: Record<Id, ImportRuleActionData>;
        conditionsById: Record<Id, ImportRuleConditionData>;
    }>(
        (actionsAndConditions, ruleData) => {
            actionsAndConditions = ruleData.importRuleActions!.reduce((result, actionData) => {
                result.actionsById[actionData.id] = actionData;
                return result;
            }, actionsAndConditions);

            actionsAndConditions = ruleData.importRuleConditions!.reduce(
                (result, conditionData) => {
                    result.conditionsById[conditionData.id] = conditionData;
                    return result;
                },
                actionsAndConditions
            );

            return actionsAndConditions;
        },
        {actionsById: {}, conditionsById: {}}
    );

    yield put(
        EncryptionSchema.wrapActionForDecryption(
            importRulesSlice.actions.set(rulesById),
            EncryptionSchema.mapOf("importRule")
        )
    );

    yield put(
        EncryptionSchema.wrapActionForDecryption(
            importRuleActionsSlice.actions.set(actionsById),
            EncryptionSchema.mapOf("importRuleAction")
        )
    );

    yield put(
        EncryptionSchema.wrapActionForDecryption(
            importRuleConditionsSlice.actions.set(conditionsById),
            EncryptionSchema.mapOf("importRuleCondition")
        )
    );

    // Wait until the decryption is done before continuing on.
    //
    // Refer to the `fetchAllEffect` in `accounts.sagas` for more details.
    yield all([
        take(importRulesSlice.actions.set),
        take(importRuleActionsSlice.actions.set),
        take(importRuleConditionsSlice.actions.set)
    ]);
}

export function* createCommit({payload}: PayloadAction<ImportRuleData>) {
    const rule = new ImportRule(payload);
    rule.validate();

    yield put(importRulesSlice.actions.add(rule));
    yield put(importRuleActionsSlice.actions.addMany(rule.importRuleActions));
    yield put(importRuleConditionsSlice.actions.addMany(rule.importRuleConditions));

    return rule;
}

export function* createEffect({payload}: PayloadAction<ImportRuleData>) {
    const rule = payload;
    yield call(api.service("importRules").create, rule);
}

export const createRollback = rollbackWrapper<ImportRuleData>(function* ({payload}) {
    const {rollbackData: rule, error} = payload;

    if (apiErrors.entityAlreadyExists(error)) {
        return;
    }

    yield put(importRulesSlice.actions.delete(rule.id));

    for (const action of rule.importRuleActions || []) {
        yield put(importRuleActionsSlice.actions.delete(action.id));
    }

    for (const condition of rule.importRuleConditions || []) {
        yield put(importRuleConditionsSlice.actions.delete(condition.id));
    }

    return `Failed to save import rule with ID ${rule.id}. Rolled back creation.`;
});

export function* updateCommit({payload}: PayloadAction<ImportRuleData>) {
    const rule = new ImportRule(payload);
    rule.validate();

    const oldRule: ImportRule = yield select(
        crossSliceSelectors.importRules.selectImportRule(rule.id)
    );

    yield put(importRulesSlice.actions.update(rule));

    const ruleDiff = ImportRule.diffRules(oldRule, rule);

    const newActions: Record<Id, ImportRuleAction> = arrayToObject(rule.importRuleActions);
    const newConditions: Record<Id, ImportRuleCondition> = arrayToObject(rule.importRuleConditions);

    for (const id of ruleDiff.actions.created) {
        yield put(importRuleActionsSlice.actions.add(newActions[id]));
    }

    for (const id of ruleDiff.actions.updated) {
        yield put(importRuleActionsSlice.actions.update(newActions[id]));
    }

    for (const id of ruleDiff.actions.deleted) {
        yield put(importRuleActionsSlice.actions.delete(id));
    }

    for (const id of ruleDiff.conditions.created) {
        yield put(importRuleConditionsSlice.actions.add(newConditions[id]));
    }

    for (const id of ruleDiff.conditions.updated) {
        yield put(importRuleConditionsSlice.actions.update(newConditions[id]));
    }

    for (const id of ruleDiff.conditions.deleted) {
        yield put(importRuleConditionsSlice.actions.delete(id));
    }

    return {payload: rule, rollbackData: oldRule};
}

export function* updateEffect({payload}: PayloadAction<ImportRuleData>) {
    const rule = payload;
    yield call(api.service("importRules").update, rule.id, rule);
}

export const updateRollback = rollbackWrapper<ImportRuleData>(function* ({payload}) {
    const {originalPayload: rule, rollbackData: oldRule} = payload;

    yield put(importRulesSlice.actions.update(oldRule));

    const ruleDiff = ImportRule.diffRules(oldRule, rule);

    const oldActions: Record<Id, ImportRuleAction> = arrayToObject(oldRule.importRuleActions);

    const oldConditions: Record<Id, ImportRuleCondition> = arrayToObject(
        oldRule.importRuleConditions
    );

    for (const id of ruleDiff.actions.created) {
        yield put(importRuleActionsSlice.actions.delete(id));
    }

    for (const id of ruleDiff.actions.updated) {
        yield put(importRuleActionsSlice.actions.update(oldActions[id]));
    }

    for (const id of ruleDiff.actions.deleted) {
        yield put(importRuleActionsSlice.actions.add(oldActions[id]));
    }

    for (const id of ruleDiff.conditions.created) {
        yield put(importRuleConditionsSlice.actions.delete(id));
    }

    for (const id of ruleDiff.conditions.updated) {
        yield put(importRuleConditionsSlice.actions.update(oldConditions[id]));
    }

    for (const id of ruleDiff.conditions.deleted) {
        yield put(importRuleConditionsSlice.actions.add(oldConditions[id]));
    }

    return `Failed to save changes to import rule with ID "${oldRule.id}". Rolled back changes.`;
});

export function* destroyCommit({payload}: PayloadAction<Id>) {
    const ruleId = payload;
    const rule: ImportRule = yield select(crossSliceSelectors.importRules.selectImportRule(ruleId));

    if (!rule) {
        throw new Error("Deleted import rule does not exist.");
    }

    // Destroy the actions/conditions first.
    for (const actionId of rule.importRuleActionIds) {
        yield put(importRuleActionsSlice.actions.delete(actionId));
    }

    for (const conditionId of rule.importRuleConditionIds) {
        yield put(importRuleConditionsSlice.actions.delete(conditionId));
    }

    // Remove the rule from the store.
    yield put(importRulesSlice.actions.delete(ruleId));

    return {payload: ruleId, rollbackData: rule};
}

export function* destroyEffect({payload}: PayloadAction<Id>) {
    const ruleId = payload;

    // Note: The Backend handles deleting the actions/conditions internally.
    yield call(api.service("importRules").remove, ruleId);
}

export const destroyRollback = rollbackWrapper<ImportRuleData>(function* ({payload}) {
    const {rollbackData: rule} = payload;

    const existingRule = yield select((state) =>
        importRulesSlice.selectors.selectImportRule(state, rule.id)
    );

    if (existingRule) {
        return;
    }

    yield put(importRulesSlice.actions.add(rule));
    yield put(importRuleActionsSlice.actions.addMany(rule.importRuleActions!));
    yield put(importRuleConditionsSlice.actions.addMany(rule.importRuleConditions!));

    return `Failed to save deleting import rule with ID "${rule.id}". Rolled back deletion.`;
});

export function* undoableDestroy({payload}: PayloadAction<Id>) {
    const ruleId = payload;
    const rule: ImportRule = yield select(crossSliceSelectors.importRules.selectImportRule(ruleId));

    // Delete the rule and its actions/conditions.
    yield put(importRulesRequestsSlice.destroy.actions.request(ruleId));

    const {failure} = yield race({
        success: take(importRulesRequestsSlice.destroy.actions.success),
        failure: take(importRulesRequestsSlice.destroy.actions.failure)
    });

    if (failure) {
        // Failure is handled by the showFailureToastSaga registered for destroy's commit failure state.
        return;
    }

    // Show the Undo toast.
    const undoToast = new UndoToastData({message: `Deleted ${ImportRule.describeRule(rule)}`});
    yield put(toastsSlice.actions.add(undoToast));

    // Wait for the Undo toast to resolve.
    const {undo} = yield race({
        close: take(undoToast.onClose),
        undo: take(undoToast.onUndo)
    });

    if (undo) {
        // Recreate the rule and its actions/conditions.
        yield put(importRulesRequestsSlice.create.actions.request(rule));
        yield take(importRulesRequestsSlice.create.actions.success);

        // Show the success toast.
        const messageToast = new MessageToastData({message: "Undo successful"});
        yield put(toastsSlice.actions.add(messageToast));
    }
}

// Note: This saga is actually exported for use by `undoableDestroyAccount`. It has no associated
// trigger action; it is called directly.
export function* removeAccountActionsFromRules(accountId: Id) {
    const rules: Array<ImportRule> = yield select(
        crossSliceSelectors.importRules.selectImportRules
    );

    // OK, the goal is to find all of the rules with actions that use the deleted account, remove
    // those actions from the rules, and then update each rule.
    //
    // We need to keep around the old, unchanged rules in case of an undo.
    const oldRules: Array<ImportRule> = [];
    const rulesWithoutActions: Array<ImportRule> = [];

    for (const rule of rules) {
        for (const action of rule.importRuleActions) {
            if (
                action.property === ImportRuleAction.PROPERTY_ACCOUNT &&
                action.value === accountId
            ) {
                oldRules.push(rule);

                const ruleCopy = new ImportRule(rule);
                const actionsWithoutAccount = ruleCopy.importRuleActions.filter(
                    ({id}) => id !== action.id
                );

                ruleCopy.importRuleActions = actionsWithoutAccount;
                ruleCopy.importRuleActionIds = actionsWithoutAccount.map(({id}) => id);

                rulesWithoutActions.push(ruleCopy);
            }
        }
    }

    for (const rule of rulesWithoutActions) {
        yield put(importRulesRequestsSlice.update.actions.request(rule));
    }

    // Return the old rules so that `undoableDestroyAccount` can handle restoring the rules
    // if the user undoes an account deletion.
    return oldRules;
}

function* importRulesSaga() {
    yield fork(
        importRulesRequestsSlice.fetchAll.watchCommitSaga(undefined, {
            isFetchEffect: true
        })
    );
    yield fork(importRulesRequestsSlice.fetchAll.watchEffectSaga(fetchAllEffect));

    yield fork(importRulesRequestsSlice.create.watchCommitSaga(createCommit));
    yield fork(importRulesRequestsSlice.create.watchEffectSaga(createEffect));
    yield fork(importRulesRequestsSlice.create.watchRollbackSaga(createRollback));

    yield fork(importRulesRequestsSlice.update.watchCommitSaga(updateCommit));
    yield fork(importRulesRequestsSlice.update.watchEffectSaga(updateEffect));
    yield fork(importRulesRequestsSlice.update.watchRollbackSaga(updateRollback));

    yield fork(importRulesRequestsSlice.destroy.watchCommitSaga(destroyCommit));
    yield fork(importRulesRequestsSlice.destroy.watchEffectSaga(destroyEffect));
    yield fork(importRulesRequestsSlice.destroy.watchRollbackSaga(destroyRollback));

    yield all([
        takeEvery(importRulesSlice.actions.undoableDestroyImportRule, undoableDestroy),
        takeEvery(
            importRulesRequestsSlice.fetchAll.actions.failure,
            showFailureToastSaga(importRulesRequestsSlice.fetchAll.actions.clear)
        ),
        takeEvery(
            importRulesRequestsSlice.create.actions.failure,
            showFailureToastSaga(importRulesRequestsSlice.create.actions.clear)
        ),
        takeEvery(
            importRulesRequestsSlice.update.actions.failure,
            showFailureToastSaga(importRulesRequestsSlice.update.actions.clear)
        ),
        takeEvery(
            importRulesRequestsSlice.destroy.actions.failure,
            showFailureToastSaga(importRulesRequestsSlice.destroy.actions.clear)
        )
    ]);
}

export default importRulesSaga;
