import {REHYDRATE} from "redux-persist";
import {cancel, fork, race, select, take} from "redux-saga/effects";
import {offlineRequestManagerSlice, userSlice} from "store/";

/** Wraps the connectivityCheckSaga from the OfflineRequestManagerSaga so that it gets disabled whenever
 *  the app is running in no-account mode. This way, no-account users don't constantly ping the healthcheck
 *  when they have no reason to.
 *
 *  Note: We don't want to disable this when running in read-only mode because we still need to process
 *  the fetch effects. * */
function* connectivityCheckSaga() {
    let task = yield fork(offlineRequestManagerSlice.connectivityCheckSaga);

    while (true) {
        yield race({
            setUser: take(userSlice.actions.setUser),
            setNoAccount: take(userSlice.actions.setNoAccount),
            rehydrate: take(REHYDRATE)
        });

        const noAccount = yield select(userSlice.selectors.selectNoAccount);

        if (task && noAccount) {
            yield cancel(task);
            task = null;
        } else if (!task && !noAccount) {
            task = yield fork(offlineRequestManagerSlice.connectivityCheckSaga);
        }
    }
}

function* offlineRequestManagerSaga() {
    yield fork(offlineRequestManagerSlice.processQueueSaga);
    yield fork(connectivityCheckSaga);
}

export default offlineRequestManagerSaga;
