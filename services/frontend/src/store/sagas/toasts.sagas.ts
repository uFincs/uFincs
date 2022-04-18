import {PayloadAction} from "@reduxjs/toolkit";
import {all, put, race, take, takeEvery} from "redux-saga/effects";
import {toastsSlice} from "store/";
import {
    ErrorToastData,
    MessageToastData,
    ServiceWorkerUpdateToastData,
    SuccessToastData,
    ToastData,
    UndoToastData,
    WarningToastData
} from "structures/";

function* errorToast({payload}: PayloadAction<ErrorToastData>) {
    if (payload.type !== ErrorToastData.TYPE) {
        return;
    }

    yield take(payload.onClose);
    yield put(toastsSlice.actions.delete(payload.id));
}

function* generalToast({payload}: PayloadAction<ToastData>) {
    if (
        payload.type !== MessageToastData.TYPE &&
        payload.type !== SuccessToastData.TYPE &&
        payload.type !== WarningToastData.TYPE
    ) {
        return;
    }

    yield take(payload.onClose);
    yield put(toastsSlice.actions.delete(payload.id));
}

function* serviceWorkerUpdateToast({payload}: PayloadAction<ServiceWorkerUpdateToastData>) {
    if (!payload.type.includes(ServiceWorkerUpdateToastData.TYPE)) {
        return;
    }

    yield race({
        close: take(payload.onClose),
        update: take(payload.onUpdate)
    });

    yield put(toastsSlice.actions.delete(payload.id));
}

function* undoToast({payload}: PayloadAction<UndoToastData>) {
    if (!payload.type.includes(UndoToastData.TYPE)) {
        return;
    }

    yield race({
        close: take(payload.onClose),
        undo: take(payload.onUndo)
    });

    yield put(toastsSlice.actions.delete(payload.id));
}

function* toastsSaga() {
    yield all([
        takeEvery(toastsSlice.actions.add, errorToast),
        takeEvery(toastsSlice.actions.add, generalToast),
        takeEvery(toastsSlice.actions.add, serviceWorkerUpdateToast),
        takeEvery(toastsSlice.actions.add, undoToast)
    ]);
}

export default toastsSaga;
