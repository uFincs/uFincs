import {PayloadAction} from "@reduxjs/toolkit";
import {call, fork, put} from "redux-saga/effects";
import {BillingService} from "services/";
import {PlanId} from "services/BillingService";
import {billingRequestsSlice, toastsSlice} from "store/";
import {ErrorToastData} from "structures/";

function* billingCheckout({payload}: PayloadAction<PlanId>) {
    const planId = payload;

    yield call(BillingService.init);

    try {
        yield call(BillingService.createCheckoutSession, planId);
    } catch (e) {
        // Note: If creating the checkout session throws an error, that likely means one of two things:
        // the user already has a subscription on Stripe, but didn't yet have one in our system, or
        // the Backend is misconfigured somehow (e.g. wrong Stripe product IDs).
        // In any case, log it, show the user an error, and fix it later.
        console.error(e);

        const toast = new ErrorToastData({
            message:
                "Encountered a problem while trying to checkout. Please try again later or email support@ufincs.com."
        });

        yield put(toastsSlice.actions.add(toast));
    }
}

function* billingGotoCustomerPortal() {
    yield call(BillingService.createCustomerPortalSession);
}

function* billingSaga() {
    yield fork(
        billingRequestsSlice.checkout.watchRequestSaga(billingCheckout, {
            routeChangeCancellable: true,
            processEvery: false
        })
    );

    yield fork(
        billingRequestsSlice.gotoCustomerPortal.watchRequestSaga(billingGotoCustomerPortal, {
            routeChangeCancellable: true,
            processEvery: false
        })
    );
}

export default billingSaga;
