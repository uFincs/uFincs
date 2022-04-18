import {PayloadAction} from "@reduxjs/toolkit";
import {Saga} from "redux-saga";
import {call, fork, put} from "redux-saga/effects";
import api from "api/";
import {Feedback, FeedbackData} from "models/";
import {feedbackRequestsSlice, modalsSlice, toastsSlice, unhandledErrorsSlice} from "store/slices";
import {SuccessToastData} from "structures/";

function* create({payload}: PayloadAction<FeedbackData>, success: Saga) {
    const feedback = new Feedback(payload);
    feedback.validate();

    yield call(api.service("feedback").create, feedback);

    // This isn't actually called cause it's needed; it's just semantically more correct.
    yield call(success);

    // TECH DEBT/NOTE: Everything past the success call shouldn't _necessarily_ be tied to this
    // kind of creation saga, since we could theoretically create feedback that doesn't come
    // from a dialog (e.g. error reporting feedback), but it doesn't hurt to hide a dialog
    // that's already hidden, so fine for now.

    // Hide the dialog that prompted this.
    yield put(modalsSlice.actions.hideFeedbackModal());

    // Show a success toast.
    const toast = new SuccessToastData({
        message: "Thanks for giving some feedback. We'll be sure to take a look at it soon!"
    });

    yield put(toastsSlice.actions.add(toast));

    // If this was an error feedback, remove the head error.
    // Kinda jank how we check for it, but it works.
    if (feedback.message.includes("Stack trace:")) {
        yield put(unhandledErrorsSlice.actions.removeHead());
    }
}

function* feedbackSaga() {
    yield fork(feedbackRequestsSlice.create.watchRequestSaga(create));
}

export default feedbackSaga;
