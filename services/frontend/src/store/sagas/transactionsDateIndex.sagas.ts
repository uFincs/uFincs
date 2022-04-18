import {PayloadAction} from "@reduxjs/toolkit";
import {all, put, takeEvery} from "redux-saga/effects";
import {TransactionData} from "models/";
import {transactionsSlice, transactionsDateIndexSlice} from "store/";
import {Id} from "utils/types";

export function* indexOnCreate({payload}: PayloadAction<TransactionData | Array<TransactionData>>) {
    if (Array.isArray(payload)) {
        yield put(transactionsDateIndexSlice.actions.addTransactions(payload));
    } else {
        yield put(transactionsDateIndexSlice.actions.addTransaction(payload));
    }
}

export function* indexOnSet({payload}: PayloadAction<Record<Id, TransactionData>>) {
    // This handles the case where decryption failed and the payload is just an error message.
    if (!payload?.message) {
        yield put(transactionsDateIndexSlice.actions.setTransactions(payload));
    }
}

export function* indexOnDelete({payload}: PayloadAction<Id>) {
    yield put(transactionsDateIndexSlice.actions.deleteTransaction(payload));
}

export function* indexOnUpdate({payload}: PayloadAction<TransactionData>) {
    yield put(transactionsDateIndexSlice.actions.updateTransaction(payload));
}

function* transactionsDateIndex() {
    yield all([
        takeEvery(
            [transactionsSlice.actions.add, transactionsSlice.actions.addMany],
            indexOnCreate
        ),
        takeEvery(transactionsSlice.actions.set, indexOnSet),
        takeEvery(transactionsSlice.actions.delete, indexOnDelete),
        takeEvery(transactionsSlice.actions.update, indexOnUpdate)
    ]);
}

export default transactionsDateIndex;
