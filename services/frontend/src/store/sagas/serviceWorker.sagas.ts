import {eventChannel} from "redux-saga";
import {all, call, put, race, take, takeEvery} from "redux-saga/effects";
import {ServiceWorkerService} from "services/";
import {serviceWorkerSlice, toastsSlice} from "store/";
import {MessageToastData, ServiceWorkerUpdateToastData} from "structures/";

enum ServiceWorkerEvent {
    success = "success",
    update = "update"
}

function* register() {
    const channel = eventChannel((emitter) => {
        ServiceWorkerService.register({
            onSuccess: () => emitter(ServiceWorkerEvent.success),
            onUpdate: () => emitter(ServiceWorkerEvent.update)
        });

        // There's nothing to do to 'unsubscribe'.
        return () => {};
    });

    while (true) {
        const event: ServiceWorkerEvent = yield take(channel);

        if (event === ServiceWorkerEvent.success) {
            const messageToast = new MessageToastData({message: "uFincs will now work offline!"});
            yield put(toastsSlice.actions.add(messageToast));
        } else if (event === ServiceWorkerEvent.update) {
            yield call(issueUpdateToast);
        }
    }
}

function* unregister() {
    yield call(ServiceWorkerService.unregister);
}

function* checkForUpdates() {
    const hasUpdates = yield call(ServiceWorkerService.checkForUpdates);

    if (hasUpdates) {
        yield call(issueUpdateToast);
    } else {
        const messageToast = new MessageToastData({message: "No updates available"});
        yield put(toastsSlice.actions.add(messageToast));
    }
}

function* serviceWorkerSagas() {
    yield all([
        takeEvery(serviceWorkerSlice.actions.register, register),
        takeEvery(serviceWorkerSlice.actions.unregister, unregister),
        takeEvery(serviceWorkerSlice.actions.checkForUpdates, checkForUpdates)
    ]);
}

export default serviceWorkerSagas;

/* Helper Functions */

function* issueUpdateToast() {
    const updateToast = new ServiceWorkerUpdateToastData();
    yield put(toastsSlice.actions.add(updateToast));

    const {update} = yield race({
        close: take(updateToast.onClose),
        update: take(updateToast.onUpdate)
    });

    if (update) {
        yield call(ServiceWorkerService.forceUpdate);
    }
}
