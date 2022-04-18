import {PayloadAction, PayloadActionCreator} from "@reduxjs/toolkit";
import {put, take} from "redux-saga/effects";
import {toastsSlice} from "store/";
import {RequestError} from "store/types";
import {ErrorToastData} from "structures/";

/* A wrapper for generating a saga to handle failures from request slice sagas.
 * Handles issuing the toast indicating that a failure happened, along with the error message.
 */
const failureSaga = (clearAction: PayloadActionCreator<void>) =>
    function* ({payload}: PayloadAction<RequestError>) {
        const {message} = payload;

        const errorToast = new ErrorToastData({message});
        yield put(toastsSlice.actions.add(errorToast));

        yield take(errorToast.onClose);

        yield put(clearAction());
    };

export default failureSaga;
