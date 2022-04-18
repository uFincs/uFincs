import {Saga} from "redux-saga";
import {all, call, delay, fork, put, race, select, take} from "redux-saga/effects";
import api from "api/";
import {AccountData} from "models/";
import {DemoDataService} from "services/";
import {
    accountsRequestsSlice,
    accountsSlice,
    onboardingSlice,
    onboardingRequestsSlice,
    recurringTransactionsSlice,
    toastsSlice,
    transactionsSlice,
    userSlice
} from "store/";
import {ErrorToastData, SuccessToastData} from "structures/";
import {ONBOARDING_SUBMIT, ONBOARDING_SUCCESS_TOAST} from "values/intentionalDelays";

function* finishOnboardingCommit(_: any, success?: Saga) {
    // Wrap the logic up into a single saga so that we can combine the whole thing with a delay (see below).
    const logic = function* () {
        // Create the accounts.
        const accounts: Array<AccountData> = yield select(
            onboardingSlice.selectors.selectSelectedAccountsList
        );

        yield put(accountsRequestsSlice.createMany.actions.request(accounts));

        const {failure} = yield race({
            success: take(accountsRequestsSlice.createMany.actions.success),
            failure: take(accountsRequestsSlice.createMany.actions.failure)
        });

        if (failure) {
            const message = `Failed to finish setup: ${failure.payload.message}`;
            const errorToast = new ErrorToastData({message});
            yield put(toastsSlice.actions.add(errorToast));

            throw new Error(message);
        }
    };

    yield all({
        // The core logic actually happens really fast. However, we want to slow it down so that
        // users think something... _substantial_ is happening.
        logic: call(logic),
        delay: delay(ONBOARDING_SUBMIT)
    });

    // Call success so that the loading state is cleared.
    yield call(success!);

    yield call(showSuccessAndGotoApp, "Accounts created. Welcome to uFincs :)");
}

function* finishOnboardingEffect() {
    yield call(markOnboarded);
}

function* skipOnboardingCommit() {
    yield call(showSuccessAndGotoApp, "Welcome to uFincs :)", "Skipped Setup");
}

function* skipOnboardingEffect() {
    yield call(markOnboarded);
}

function* useDemoDataCommit() {
    const {accounts, recurringTransactions, transactions} = yield call(
        DemoDataService.generateDemoData
    );

    yield put(accountsSlice.actions.set(accounts));
    yield put(transactionsSlice.actions.set(transactions));
    yield put(recurringTransactionsSlice.actions.set(recurringTransactions));

    yield call(showSuccessAndGotoApp, "Welcome to uFincs :)", "Using Demo Data");
}

export default function* onboardingSagas() {
    yield fork(onboardingRequestsSlice.finishOnboarding.watchCommitSaga(finishOnboardingCommit));
    yield fork(onboardingRequestsSlice.finishOnboarding.watchEffectSaga(finishOnboardingEffect));

    yield fork(onboardingRequestsSlice.skipOnboarding.watchCommitSaga(skipOnboardingCommit));
    yield fork(onboardingRequestsSlice.skipOnboarding.watchEffectSaga(skipOnboardingEffect));

    // Note: The demo data 'request' isn't actually a request, since it is only run in no-account mode.
    // As such, it has no `effect` saga.
    yield fork(onboardingRequestsSlice.useDemoData.watchCommitSaga(useDemoDataCommit));
}

/* Helper Functions */

function* markOnboarded() {
    const userId: string = yield select(userSlice.selectors.selectUserId);
    yield call(api.service("users").patch, userId, {isOnboarded: true});
}

function* showSuccessAndGotoApp(message: string, title?: string) {
    yield put(toastsSlice.actions.add(new SuccessToastData({message, title})));

    // Want to wait a little bit to allow the success toast to render, before switching to the app.
    yield delay(ONBOARDING_SUCCESS_TOAST);

    yield call(gotoApp);
}

function* gotoApp() {
    // Mark that the user has onboarded, on the frontend.
    // This will trigger the 'redirection' of the user to the app.
    yield put(userSlice.actions.setIsOnboarded(true));
}
