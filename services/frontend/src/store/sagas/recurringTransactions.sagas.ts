import {PayloadAction} from "@reduxjs/toolkit";
import {all, call, fork, put, race, select, take, takeEvery} from "redux-saga/effects";
import api, {apiErrors} from "api/";
import {RecurringTransaction, RecurringTransactionData} from "models/";
import {DateService} from "services/";
import {
    crossSliceSelectors,
    recurringTransactionsSlice,
    recurringTransactionsRequestsSlice,
    toastsSlice,
    transactionsRequestsSlice
} from "store/";
import {rollbackWrapper, showFailureToastSaga} from "store/sagas/utils";
import {MessageToastData, UndoToastData} from "structures/";
import {Id} from "utils/types";
import {EncryptionSchema} from "vendor/redux-e2e-encryption";

export function* fetchAllEffect() {
    const result: Array<RecurringTransactionData> = yield call(
        api.service("recurringTransactions").find
    );

    const byId = result.reduce<Record<Id, RecurringTransactionData>>(
        (acc, recurringTransactionData) => {
            acc[recurringTransactionData.id] = recurringTransactionData;
            return acc;
        },
        {}
    );

    yield put(
        EncryptionSchema.wrapActionForDecryption(
            recurringTransactionsSlice.actions.set(byId),
            EncryptionSchema.mapOf("recurringTransaction")
        )
    );

    // Wait until the decryption is done before continuing on.
    //
    // Refer to the `fetchAllEffect` in `accounts.sagas` for more details.
    yield take(recurringTransactionsSlice.actions.set);
}

export function* createCommit({payload}: PayloadAction<RecurringTransactionData>) {
    const recurringTransaction = new RecurringTransaction(payload);
    recurringTransaction.validate();

    yield put(recurringTransactionsSlice.actions.add(recurringTransaction));

    return recurringTransaction;
}

// This is kinda jank. Basically, once we changed `realizeRecurringTransactions` to update the
// `lastRealizedDate`, we could no longer call it in `createCommit` because it would try to update
// a recurring transaction before it was created. So we need to wait for `createCommit` to finish
// and _then_ realize it.
export function* realizeAfterCreateCommit({payload}: PayloadAction<RecurringTransactionData>) {
    const recurringTransaction = new RecurringTransaction(payload);

    // Wait for `commitCreate` to finish.
    yield take(recurringTransactionsRequestsSlice.create.actions.success);

    // Realize it so that concrete transactions get created since its start date.
    yield call(realizeRecurringTransactions, [recurringTransaction], {includePast: true});
}

export function* createEffect({payload}: PayloadAction<RecurringTransactionData>) {
    yield call(api.service("recurringTransactions").create, payload);
}

export const createRollback = rollbackWrapper<RecurringTransactionData>(function* ({payload}) {
    const {rollbackData: recurringTransaction, error} = payload;

    if (apiErrors.entityAlreadyExists(error)) {
        return;
    }

    yield put(recurringTransactionsSlice.actions.delete(recurringTransaction.id));
    return `Failed to save recurring transaction "${recurringTransaction.description}". Rolled back creation.`;
});

export function* createManyCommit({payload}: PayloadAction<Array<RecurringTransactionData>>) {
    const recurringTransactions = payload.map((data) => {
        const recurringTransaction = new RecurringTransaction(data);
        recurringTransaction.validate();
        return recurringTransaction;
    });

    yield put(recurringTransactionsSlice.actions.addMany(recurringTransactions));

    // Realize them so that concrete transactions get created since their start dates.
    yield call(realizeRecurringTransactions, recurringTransactions, {includePast: true});

    return recurringTransactions;
}

export function* createManyEffect({payload}: PayloadAction<Array<RecurringTransactionData>>) {
    yield call(api.service("recurringTransactions").create, payload);
}

export const createManyRollback = rollbackWrapper<Array<RecurringTransactionData>>(function* ({
    payload
}) {
    const {rollbackData: recurringTransactions, error} = payload;

    if (apiErrors.entityAlreadyExists(error)) {
        return;
    }

    for (const recurringTransaction of recurringTransactions) {
        yield put(recurringTransactionsSlice.actions.delete(recurringTransaction.id));
    }

    return "Failed to save recurring transactions. Rolled back creation.";
});

export function* updateCommit({payload}: PayloadAction<RecurringTransactionData>) {
    const recurringTransaction = new RecurringTransaction(payload);

    const oldRecurringTransaction = yield select(
        recurringTransactionsSlice.selectors.selectRecurringTransaction(recurringTransaction.id)
    );

    recurringTransaction.validate();

    yield put(recurringTransactionsSlice.actions.update(recurringTransaction));

    return {payload: recurringTransaction, rollbackData: oldRecurringTransaction};
}

export function* updateEffect({payload}: PayloadAction<RecurringTransactionData>) {
    const recurringTransaction = payload;

    yield call(
        api.service("recurringTransactions").update,
        recurringTransaction.id,
        recurringTransaction
    );
}

export const updateRollback = rollbackWrapper<RecurringTransactionData>(function* ({payload}) {
    const {rollbackData: oldRecurringTransaction} = payload;

    yield put(recurringTransactionsSlice.actions.update(oldRecurringTransaction));

    return (
        "Failed to save changes to recurring transaction " +
        `"${oldRecurringTransaction.description}". Rolled back changes.`
    );
});

export function* destroyCommit({payload}: PayloadAction<Id>) {
    const transactionId = payload;

    const recurringTransaction = yield select(
        recurringTransactionsSlice.selectors.selectRecurringTransaction(transactionId)
    );

    if (!recurringTransaction) {
        throw new Error("Deleted recurring transaction does not exist.");
    }

    yield put(recurringTransactionsSlice.actions.delete(transactionId));

    return {payload: transactionId, rollbackData: recurringTransaction};
}

export function* destroyEffect({payload}: PayloadAction<Id>) {
    const transactionId = payload;
    yield call(api.service("recurringTransactions").remove, transactionId);
}

export const destroyRollback = rollbackWrapper<Id, RecurringTransactionData>(function* ({payload}) {
    const {rollbackData: recurringTransaction} = payload;

    const existingTransaction = yield select(
        recurringTransactionsSlice.selectors.selectRecurringTransaction(recurringTransaction.id)
    );

    if (existingTransaction) {
        return;
    }

    yield put(recurringTransactionsSlice.actions.add(recurringTransaction));

    return `Failed to save deleting recurring transaction "${recurringTransaction.description}". Rolled back deletion.`;
});

export function* undoableDestroy({payload}: PayloadAction<Id>) {
    const id = payload;

    const recurringTransaction = yield select(
        recurringTransactionsSlice.selectors.selectRecurringTransaction(id)
    );

    const transactions = yield select(
        crossSliceSelectors.transactions.selectTransactionsForRecurringTransaction(id)
    );

    // Delete the transaction.
    yield put(recurringTransactionsRequestsSlice.destroy.actions.request(id));

    const {failure} = yield race({
        success: take(recurringTransactionsRequestsSlice.destroy.actions.success),
        failure: take(recurringTransactionsRequestsSlice.destroy.actions.failure)
    });

    if (failure) {
        // Failure is handled by the showFailureToastSaga registered for destroy's commit failure state.
        return;
    }

    // Show the Undo toast.
    const undoToast = new UndoToastData({
        message: `Deleted recurring transaction "${recurringTransaction.description}"`
    });

    yield put(toastsSlice.actions.add(undoToast));

    // Wait for the Undo toast to resolve.
    const {undo} = yield race({
        close: take(undoToast.onClose),
        undo: take(undoToast.onUndo)
    });

    if (undo) {
        // Recreate the recurring transaction.
        yield put(recurringTransactionsRequestsSlice.create.actions.request(recurringTransaction));

        // Wait for creation success.
        yield take(recurringTransactionsRequestsSlice.create.actions.success);

        // Re-add the recurring transaction ID to its related transactions, since it got removed on
        // the backend from the transactions as part of the "ON DELETE SET NULL" directive on the key.
        //
        // If we don't do this, then the ID will be lost from the transactions and there's an edge
        // case where the duplicate transactions could be created (specifically, if a recurring transaction
        // can be realized today, and it already has been realized, it'll be realized again if the
        // ID is missing from the old transaction).
        for (const transaction of transactions) {
            yield put(transactionsRequestsSlice.update.actions.request(transaction));
            yield take(transactionsRequestsSlice.update.actions.success);
        }

        // Show the success toast.
        const messageToast = new MessageToastData({message: "Undo successful"});
        yield put(toastsSlice.actions.add(messageToast));
    }
}

export function* handleConcreteRealizations() {
    const recurringTransactions: Array<RecurringTransactionData> = yield select(
        recurringTransactionsSlice.selectors.selectRecurringTransactionsList
    );

    yield call(realizeRecurringTransactions, recurringTransactions);
}

function* transactionsSaga() {
    yield fork(
        recurringTransactionsRequestsSlice.fetchAll.watchCommitSaga(undefined, {
            isFetchEffect: true
        })
    );

    yield fork(recurringTransactionsRequestsSlice.fetchAll.watchEffectSaga(fetchAllEffect));

    yield fork(recurringTransactionsRequestsSlice.create.watchCommitSaga(createCommit));
    yield fork(recurringTransactionsRequestsSlice.create.watchEffectSaga(createEffect));
    yield fork(recurringTransactionsRequestsSlice.create.watchRollbackSaga(createRollback));

    yield fork(recurringTransactionsRequestsSlice.createMany.watchCommitSaga(createManyCommit));
    yield fork(recurringTransactionsRequestsSlice.createMany.watchEffectSaga(createManyEffect));
    yield fork(recurringTransactionsRequestsSlice.createMany.watchRollbackSaga(createManyRollback));

    yield fork(recurringTransactionsRequestsSlice.update.watchCommitSaga(updateCommit));
    yield fork(recurringTransactionsRequestsSlice.update.watchEffectSaga(updateEffect));
    yield fork(recurringTransactionsRequestsSlice.update.watchRollbackSaga(updateRollback));

    yield fork(recurringTransactionsRequestsSlice.destroy.watchCommitSaga(destroyCommit));
    yield fork(recurringTransactionsRequestsSlice.destroy.watchEffectSaga(destroyEffect));
    yield fork(recurringTransactionsRequestsSlice.destroy.watchRollbackSaga(destroyRollback));

    yield all([
        takeEvery(
            recurringTransactionsRequestsSlice.create.actions.request,
            realizeAfterCreateCommit
        ),
        takeEvery(
            recurringTransactionsSlice.actions.undoableDestroyRecurringTransaction,
            undoableDestroy
        ),
        takeEvery(
            recurringTransactionsSlice.actions.triggerConcreteRealizations,
            handleConcreteRealizations
        ),
        takeEvery(
            recurringTransactionsRequestsSlice.create.actions.failure,
            showFailureToastSaga(recurringTransactionsRequestsSlice.create.actions.clear)
        ),
        takeEvery(
            recurringTransactionsRequestsSlice.createMany.actions.failure,
            showFailureToastSaga(recurringTransactionsRequestsSlice.createMany.actions.clear)
        ),
        takeEvery(
            recurringTransactionsRequestsSlice.update.actions.failure,
            showFailureToastSaga(recurringTransactionsRequestsSlice.update.actions.clear)
        ),
        takeEvery(
            recurringTransactionsRequestsSlice.destroy.actions.failure,
            showFailureToastSaga(recurringTransactionsRequestsSlice.destroy.actions.clear)
        )
    ]);
}

export default transactionsSaga;

/** This is the actual logic for realizing recurring transactions into concrete transactions. */
export function* realizeRecurringTransactions(
    recurringTransactions: Array<RecurringTransactionData>,
    {includePast = false} = {}
) {
    // Grab all the transactions that already exist...
    const transactionsByRecurringTransaction = yield select(
        crossSliceSelectors.transactions.selectTransactionsByRecurringTransactionId
    );

    const newTransactions = RecurringTransaction.realizeMany(
        recurringTransactions,
        transactionsByRecurringTransaction,
        {includePast}
    );

    const today = yield call(DateService.getTodayAsUTCString);

    // Update the lastRealizedDate for each recurring transaction to today.
    // It doesn't matter whether or not they were actually realized; just gotta keep them up-to-date.
    for (const recurringTransaction of recurringTransactions) {
        if (
            !(
                recurringTransaction.lastRealizedDate &&
                DateService.convertToUTCString(recurringTransaction.lastRealizedDate) === today
            )
        ) {
            yield put(
                recurringTransactionsRequestsSlice.update.actions.request({
                    ...recurringTransaction,
                    lastRealizedDate: today
                })
            );
        }
    }

    if (newTransactions.length > 0) {
        // Actually create the transactions.
        yield put(transactionsRequestsSlice.createMany.actions.request(newTransactions));
    }
}
