import {REHYDRATE} from "redux-persist";
import {call, delay, put, race, take} from "redux-saga/effects";
import api from "api/";
import {featureFlagsSlice} from "store/";

function* fetchFeatureFlags() {
    try {
        const featureFlags = yield call(api.service("featureFlags").find);
        yield put(featureFlagsSlice.actions.setFeatureFlags(featureFlags));
    } catch (e) {
        console.error(e, "Failed to fetch feature flags");
    }
}

function* featureFlagsSaga() {
    // We need this to fire fast, but we don't need it to fire so fast that it fires
    // _before_ we rehydrate, causing the fetched feature flags to be overriden immediately.
    //
    // The delay is just a failsafe in case rehydrate never fires for some reason.
    yield race({
        delay: delay(2000),
        rehydrate: take(REHYDRATE)
    });

    // Don't call this during testing.
    //
    // Note: During actual operation, this needs to fire as fast as possible, to set up feature flags
    // that everything else depends on. If the flags aren't set correctly, things could go very wrong.
    if (process.env.NODE_ENV !== "test") {
        yield call(fetchFeatureFlags);
    }
}

export default featureFlagsSaga;
