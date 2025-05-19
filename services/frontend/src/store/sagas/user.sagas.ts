import {createAction, PayloadAction} from "@reduxjs/toolkit";
import {all, call, fork, put, select, take, takeEvery} from "redux-saga/effects";
import api from "api/";
import {
    ImportProfile,
    ImportRule,
    ImportRuleAction,
    ImportRuleCondition,
    Preference
} from "models/";
import {BackupService} from "services/";
import {BackupDataFormat, BackupFileFormat} from "services/BackupService";
import {
    accountsSlice,
    crossSliceSelectors,
    importProfilesSlice,
    importProfileMappingsSlice,
    importRulesSlice,
    importRuleActionsSlice,
    importRuleConditionsSlice,
    fileDownloadSlice,
    preferencesSlice,
    recurringTransactionsSlice,
    toastsSlice,
    transactionsSlice,
    userOfflineRequestsSlice,
    userRequestsSlice,
    userSlice
} from "store/";
import mounts from "store/mountpoints";
import {rollbackWrapper} from "store/sagas/utils";
import {ErrorToastData, SuccessToastData} from "structures/";
import objectReduce from "utils/objectReduce";
import {EncryptionSchema} from "vendor/redux-e2e-encryption";

function* createBackup() {
    const data = yield select(crossSliceSelectors.user.selectDataForBackup);
    const file = BackupService.createBackupFile(data, {encrypted: false});

    yield put(fileDownloadSlice.actions.setFile(file));
}

function* createEncryptedBackup() {
    let data: BackupDataFormat = yield select(crossSliceSelectors.user.selectDataForBackup);
    data = yield call(encryptOrDecryptData, "encrypt", data);

    const file = BackupService.createBackupFile(data, {encrypted: true});

    yield put(fileDownloadSlice.actions.setFile(file));
}

function* restoreBackupCommit({payload}: PayloadAction<File>) {
    // If the user didn't pick a file, then we should obviously not do anything here.
    if (!payload) {
        return;
    }

    const noAccount = yield select(userSlice.selectors.selectNoAccount);

    // Save the current state for the rollback, in case this restore somehow goes downhill.
    const rollbackData = yield select(crossSliceSelectors.user.selectDataForBackup);

    try {
        const result: BackupFileFormat = yield call(BackupService.parseBackupFile, payload);
        let {data, encrypted, version} = result;

        if (encrypted && noAccount) {
            const toast = new ErrorToastData({
                message: "Cannot restore encrypted backup to a different account"
            });

            yield put(toastsSlice.actions.add(toast));

            return;
        } else if (encrypted) {
            data = yield call(encryptOrDecryptData, "decrypt", data);

            // Rewrite the IDs after decryption has been done, otherwise some encrypted ID values
            // (namely, ImportRuleAction values) will be wrong.
            const decryptedResult: BackupFileFormat = yield call(
                BackupService.rewriteIdsAfterDecryption,
                data,
                version
            );

            data = decryptedResult.data;
        }

        data = yield call(BackupService.validateData, data, version);

        const {
            accounts,
            importProfiles,
            importProfileMappings,
            importRules = {},
            importRuleActions = {},
            importRuleConditions = {},
            preferences,
            recurringTransactions = {},
            transactions
        } = data;

        yield put(accountsSlice.actions.set(accounts));
        yield put(recurringTransactionsSlice.actions.set(recurringTransactions));
        yield put(transactionsSlice.actions.set(transactions));

        yield put(importProfilesSlice.actions.set(importProfiles));
        yield put(importProfileMappingsSlice.actions.set(importProfileMappings));

        yield put(importRulesSlice.actions.set(importRules));
        yield put(importRuleActionsSlice.actions.set(importRuleActions));
        yield put(importRuleConditionsSlice.actions.set(importRuleConditions));

        if (preferences) {
            yield put(preferencesSlice.actions.patch(preferences));
        }

        yield put(
            toastsSlice.actions.add(
                new SuccessToastData({message: `Restored from ${payload.name}!`})
            )
        );

        return {
            payload: {
                ...result,
                data
            },
            rollbackData
        };
    } catch (e) {
        // Errors can happen for multiple reasons:
        // - The initial parse of the file fails
        // - The data decryption fails
        // - The data in the parsed/decrypted file is invalid
        // - etc

        yield put(toastsSlice.actions.add(new ErrorToastData({message: e.message})));
        throw e;
    }
}

function* restoreBackupEffect({payload}: PayloadAction<BackupFileFormat>) {
    const {data} = payload;
    yield call(restoreEffectLogic, data);
}

const restoreBackupRollback = rollbackWrapper<BackupDataFormat>(function* ({payload}) {
    const {rollbackData} = payload;

    yield call(restoreEffectLogic, rollbackData);
    return "Failed to restore backup. Rolled back to before backup.";
});

function* userSaga() {
    yield fork(userOfflineRequestsSlice.restoreBackup.watchCommitSaga(restoreBackupCommit));
    yield fork(userOfflineRequestsSlice.restoreBackup.watchEffectSaga(restoreBackupEffect));
    yield fork(userOfflineRequestsSlice.restoreBackup.watchRollbackSaga(restoreBackupRollback));

    yield all([
        takeEvery(userRequestsSlice.createBackup.actions.request, createBackup),
        takeEvery(userRequestsSlice.createEncryptedBackup.actions.request, createEncryptedBackup)
    ]);
}

export default userSaga;

/* Helper Functions */

/** This is the main logic for the restoreBackupEffect saga. However, since it's needed by both the
 *  effect and the rollback processes, it's just been extracted as a helper function. */
export function* restoreEffectLogic(data: BackupDataFormat) {
    const userId: string = yield select(userSlice.selectors.selectUserId);

    // Since the data is always coming out of the commit fully decrypted, we need to always
    // encrypt it before sending it to the server, regardless of the file's encrypt flag.
    data = yield call(encryptOrDecryptData, "encrypt", data);

    const {
        accounts,
        importProfiles,
        importProfileMappings,
        importRules = {},
        importRuleActions = {},
        importRuleConditions = {},
        preferences,
        recurringTransactions = {},
        transactions
    } = data;

    // Can't use `populateImportProfile` here since it'd end up instantiating an encrypted instance,
    // which'll throw an error since an encrypted date is an invalid date.
    const profilesWithMappings = objectReduce(importProfiles, (profileData) => {
        profileData.importProfileMappings = ImportProfile._mergeWithMappings(
            profileData.importProfileMappingIds,
            importProfileMappings
        );

        return profileData;
    });

    // Same as above, can't use `populateImportRule` due to encrypted data.
    const rulesWithProperties = objectReduce(importRules, (ruleData) => {
        // For both of these, we're kind of cheating by forcefully casting the results to
        // the model types rather than the data type.
        //
        // We have to do this because the rule expects the model versions, but it really doesn't matter
        // since the only difference is whether or not `validate()` is present, which doesn't
        // matter in this context.
        //
        // The reason we have to do with the rule actions/conditions but not the profile mappings is
        // because we don't have a `validate()` method on `ImportProfileMapping`.
        ruleData.importRuleActions = ImportRule._mergeWithActions(
            ruleData.importRuleActionIds,
            importRuleActions
        ) as Array<ImportRuleAction>;

        ruleData.importRuleConditions = ImportRule._mergeWithConditions(
            ruleData.importRuleConditionIds,
            importRuleConditions
        ) as Array<ImportRuleCondition>;

        return ruleData;
    });

    yield call(api.service("users").remove, userId, {
        query: {
            onlyDeleteUserData: true
        }
    });

    // For obvious reasons (aka foreign key constraints), the accounts and recurring transactions have
    // to be created before the transactions.
    yield call(api.service("accounts").create, Object.values(accounts));
    yield call(api.service("recurringTransactions").create, Object.values(recurringTransactions));

    yield call(api.service("transactions").create, Object.values(transactions));
    yield call(api.service("importProfiles").create, Object.values(profilesWithMappings));
    yield call(api.service("importRules").create, Object.values(rulesWithProperties));

    if (preferences) {
        // Because user data deletion deletes the entire preference row, we can't patch it.
        // So we have to create a brand new row again.
        const preferencesRow = new Preference({userId, ...preferences});
        yield call(api.service("preferences").create, preferencesRow);
    }
}

const encryptOrDecryptAction = createAction<any>(`${mounts.user}/restoreProcess/encryptOrDecrypt`);

/** Handles encrypting or decrypting the data set for/from a backup file. */
function* encryptOrDecryptData(method: "encrypt" | "decrypt", data: BackupDataFormat) {
    const actionWrapper: any =
        method === "encrypt"
            ? EncryptionSchema.wrapActionForEncryption
            : EncryptionSchema.wrapActionForDecryption;

    yield put(
        actionWrapper(encryptOrDecryptAction(data.accounts), EncryptionSchema.mapOf("account"))
    );

    const {error: accountError, payload: accounts} = yield take(encryptOrDecryptAction);

    yield put(
        actionWrapper(
            encryptOrDecryptAction(data.importProfiles),
            EncryptionSchema.mapOf("importProfile")
        )
    );

    const {error: profileError, payload: importProfiles} = yield take(encryptOrDecryptAction);

    yield put(
        actionWrapper(
            encryptOrDecryptAction(data.importProfileMappings),
            EncryptionSchema.mapOf("importProfileMapping")
        )
    );

    const {error: mappingError, payload: importProfileMappings} =
        yield take(encryptOrDecryptAction);

    yield put(
        actionWrapper(
            encryptOrDecryptAction(data.importRules),
            EncryptionSchema.mapOf("importRule")
        )
    );

    const {error: ruleError, payload: importRules} = yield take(encryptOrDecryptAction);

    yield put(
        actionWrapper(
            encryptOrDecryptAction(data.importRuleActions),
            EncryptionSchema.mapOf("importRuleAction")
        )
    );

    const {error: ruleActionError, payload: importRuleActions} = yield take(encryptOrDecryptAction);

    yield put(
        actionWrapper(
            encryptOrDecryptAction(data.importRuleConditions),
            EncryptionSchema.mapOf("importRuleCondition")
        )
    );

    const {error: ruleConditionError, payload: importRuleConditions} =
        yield take(encryptOrDecryptAction);

    yield put(
        actionWrapper(
            encryptOrDecryptAction(
                data.preferences || Preference.extractDataFields(new Preference())
            ),
            EncryptionSchema.single("preference")
        )
    );

    const {error: preferenceError, payload: preferences} = yield take(encryptOrDecryptAction);

    yield put(
        actionWrapper(
            encryptOrDecryptAction(data.recurringTransactions || {}),
            EncryptionSchema.mapOf("recurringTransaction")
        )
    );

    const {error: recurringTransactionError, payload: recurringTransactions} =
        yield take(encryptOrDecryptAction);

    yield put(
        actionWrapper(
            encryptOrDecryptAction(data.transactions),
            EncryptionSchema.mapOf("transaction")
        )
    );

    const {error: transactionError, payload: transactions} = yield take(encryptOrDecryptAction);

    if (
        accountError ||
        profileError ||
        mappingError ||
        preferenceError ||
        recurringTransactionError ||
        ruleError ||
        ruleActionError ||
        ruleConditionError ||
        transactionError
    ) {
        if (method === "decrypt") {
            throw new Error(
                "Failed to decrypt backup file. Are you trying to restore to a different account? " +
                    "Because you can't do that."
            );
        } else {
            throw new Error("Failed to encrypt backup file");
        }
    }

    return {
        accounts,
        importProfiles,
        importProfileMappings,
        importRules,
        importRuleActions,
        importRuleConditions,
        preferences,
        recurringTransactions,
        transactions
    };
}
