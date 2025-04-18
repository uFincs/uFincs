import {PayloadAction} from "@reduxjs/toolkit";
import {all, call, fork, put, race, select, take, takeEvery} from "redux-saga/effects";
import api, {apiErrors} from "api/";
import {Transaction, TransactionData} from "models/";
import {accountsSlice, toastsSlice, transactionsSlice, transactionsRequestsSlice} from "store/";
import {rollbackWrapper, showFailureToastSaga} from "store/sagas/utils";
import {MessageToastData, UndoToastData} from "structures/";
import {Id} from "utils/types";

export function* createCommit({payload}: PayloadAction<TransactionData>) {
    const transaction = new Transaction(payload);
    transaction.validate();

    yield put(transactionsSlice.actions.add(transaction));
    yield put(accountsSlice.actions.addTransactionToAccounts(transaction));

    return transaction;
}

export function* createEffect({payload}: PayloadAction<TransactionData>) {
    yield call(api.service("transactions").create, payload);
}

export const createRollback = rollbackWrapper<TransactionData>(function* ({payload}) {
    const {rollbackData: transaction, error} = payload;

    // Don't rollback when transactions accidentally get created multiple times.
    // This can occur, for example, when undoing a transaction deletion, but the deletion
    // effect failed. The undo algo will issue a creation effect that will also fail
    // because the deletion effect never propagated to server, resulting in trying to create
    // a duplicate transaction. However, since the user undid the deletion, we don't
    // want to rollback this re-creation and leave the user without their transaction.
    if (apiErrors.entityAlreadyExists(error)) {
        return;
    }

    yield put(transactionsSlice.actions.delete(transaction.id));
    return `Failed to save transaction "${transaction.description}". Rolled back creation.`;
});

export function* createManyCommit({payload}: PayloadAction<Array<TransactionData>>) {
    const transactions = payload.map((data) => {
        const transaction = new Transaction(data);
        transaction.validate();
        return transaction;
    });

    yield put(transactionsSlice.actions.addMany(transactions));
    yield put(accountsSlice.actions.addTransactionsToAccounts(transactions));

    return transactions;
}

export function* createManyEffect({payload}: PayloadAction<Array<TransactionData>>) {
    yield call(api.service("transactions").create, payload);
}

export const createManyRollback = rollbackWrapper<Array<TransactionData>>(function* ({payload}) {
    const {rollbackData: transactions, error} = payload;

    if (apiErrors.entityAlreadyExists(error)) {
        return;
    }

    for (const transaction of transactions) {
        yield put(transactionsSlice.actions.delete(transaction.id));
    }

    return "Failed to save transactions. Rolled back creation.";
});

export function* updateCommit({payload}: PayloadAction<TransactionData>) {
    const transaction = new Transaction(payload);
    transaction.validate();

    const oldTransaction: Transaction | undefined = yield select(
        transactionsSlice.selectors.selectTransaction(transaction.id)
    );

    // If the accounts of the transaction have changed, need to update the list of transactions
    // associated with both the old and new accounts.
    if (oldTransaction && Transaction.accountsChanged(oldTransaction, transaction)) {
        yield put(accountsSlice.actions.removeTransactionFromAccounts(oldTransaction));
        yield put(accountsSlice.actions.addTransactionToAccounts(transaction));
    }

    yield put(transactionsSlice.actions.update(transaction));

    return {payload: transaction, rollbackData: oldTransaction};
}

export function* updateEffect({payload}: PayloadAction<TransactionData>) {
    const transaction = payload;
    yield call(api.service("transactions").update, transaction.id, transaction);
}

export const updateRollback = rollbackWrapper<TransactionData>(function* ({payload}) {
    const {originalPayload: transaction, rollbackData: oldTransaction} = payload;

    yield put(transactionsSlice.actions.update(oldTransaction));

    // If the accounts of the transaction have changed, need to rollback the changes to the accounts.
    if (oldTransaction && transaction && Transaction.accountsChanged(oldTransaction, transaction)) {
        yield put(accountsSlice.actions.removeTransactionFromAccounts(transaction));
        yield put(accountsSlice.actions.addTransactionToAccounts(oldTransaction));
    }

    return `Failed to save changes to transaction "${oldTransaction.description}". Rolled back changes.`;
});

export function* destroyCommit({payload}: PayloadAction<Id>) {
    const transactionId = payload;
    const transaction = yield select(transactionsSlice.selectors.selectTransaction(transactionId));

    if (!transaction) {
        throw new Error("Deleted transaction does not exist.");
    }

    yield put(accountsSlice.actions.removeTransactionFromAccounts(transaction));
    yield put(transactionsSlice.actions.delete(transactionId));

    return {payload: transactionId, rollbackData: transaction};
}

export function* destroyEffect({payload}: PayloadAction<Id>) {
    const transactionId = payload;
    yield call(api.service("transactions").remove, transactionId);
}

export const destroyRollback = rollbackWrapper<Id, TransactionData>(function* ({payload}) {
    const {rollbackData: transaction} = payload;
    const existingTransaction = yield select(
        transactionsSlice.selectors.selectTransaction(transaction.id)
    );

    // If the transaction has somehow already made it's way back to the store,
    // there's no reason to re-create and show the user an error toast.
    // This can happen when the user undoes the deletion and the destroyEffect
    // errored out for some reason or another; the undo algorithm would have already
    // added the transaction back to store.
    if (existingTransaction) {
        return;
    }

    yield put(transactionsSlice.actions.add(transaction));
    yield put(accountsSlice.actions.addTransactionToAccounts(transaction));

    return `Failed to save deleting transaction "${transaction.description}". Rolled back deletion.`;
});

export function* undoableDestroy({payload}: PayloadAction<Id>) {
    const transactionId = payload;
    const transaction = yield select(transactionsSlice.selectors.selectTransaction(transactionId));

    // Delete the transaction.
    yield put(transactionsRequestsSlice.destroy.actions.request(transactionId));

    const {failure} = yield race({
        success: take(transactionsRequestsSlice.destroy.actions.success),
        failure: take(transactionsRequestsSlice.destroy.actions.failure)
    });

    if (failure) {
        // Failure is handled by the showFailureToastSaga registered for destroy's commit failure state.
        return;
    }

    // Show the Undo toast.
    const undoToast = new UndoToastData({
        message: `Deleted transaction "${transaction.description}"`
    });

    yield put(toastsSlice.actions.add(undoToast));

    // Wait for the Undo toast to resolve.
    const {undo} = yield race({
        close: take(undoToast.onClose),
        undo: take(undoToast.onUndo)
    });

    if (undo) {
        // Recreate the transaction.
        yield put(transactionsRequestsSlice.create.actions.request(transaction));

        // Wait for creation success.
        yield take(transactionsRequestsSlice.create.actions.success);

        // Show the success toast.
        const messageToast = new MessageToastData({message: "Undo successful"});
        yield put(toastsSlice.actions.add(messageToast));
    }
}

function* transactionsSaga() {
    yield fork(transactionsRequestsSlice.create.watchCommitSaga(createCommit));
    yield fork(transactionsRequestsSlice.create.watchEffectSaga(createEffect));
    yield fork(transactionsRequestsSlice.create.watchRollbackSaga(createRollback));

    yield fork(transactionsRequestsSlice.createMany.watchCommitSaga(createManyCommit));
    yield fork(transactionsRequestsSlice.createMany.watchEffectSaga(createManyEffect));
    yield fork(transactionsRequestsSlice.createMany.watchRollbackSaga(createManyRollback));

    yield fork(transactionsRequestsSlice.update.watchCommitSaga(updateCommit));
    yield fork(transactionsRequestsSlice.update.watchEffectSaga(updateEffect));
    yield fork(transactionsRequestsSlice.update.watchRollbackSaga(updateRollback));

    yield fork(transactionsRequestsSlice.destroy.watchCommitSaga(destroyCommit));
    yield fork(transactionsRequestsSlice.destroy.watchEffectSaga(destroyEffect));
    yield fork(transactionsRequestsSlice.destroy.watchRollbackSaga(destroyRollback));

    yield all([
        takeEvery(transactionsSlice.actions.undoableDestroyTransaction, undoableDestroy),
        takeEvery(
            transactionsRequestsSlice.create.actions.failure,
            showFailureToastSaga(transactionsRequestsSlice.create.actions.clear)
        ),
        takeEvery(
            transactionsRequestsSlice.createMany.actions.failure,
            showFailureToastSaga(transactionsRequestsSlice.createMany.actions.clear)
        ),
        takeEvery(
            transactionsRequestsSlice.update.actions.failure,
            showFailureToastSaga(transactionsRequestsSlice.update.actions.clear)
        ),
        takeEvery(
            transactionsRequestsSlice.destroy.actions.failure,
            showFailureToastSaga(transactionsRequestsSlice.destroy.actions.clear)
        )
    ]);
}

export default transactionsSaga;
