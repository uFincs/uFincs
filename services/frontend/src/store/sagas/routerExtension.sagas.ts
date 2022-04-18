import {LOCATION_CHANGE} from "connected-react-router";
import {all, put, select, takeEvery} from "redux-saga/effects";
import {crossSliceSelectors, routerExtensionSlice} from "store/";

/** Handles updating the modal compatible `previousLocation` whenever the location changes. */
function* onLocationChange() {
    const location = yield select(crossSliceSelectors.router.selectLocation);
    const previousLocation = yield select(routerExtensionSlice.selectors.selectPreviousLocation);

    const isModalRoute = yield select(crossSliceSelectors.router.selectIsModalRoute);

    // When previousLocation is empty (i.e. on first load) we need to set it to the current
    // location, otherwise things will blow up.
    //
    // The other condition is the more important one though: whenever we aren't on a modal
    // route, we need to save the location. This way, when we _do_ hit a modal route,
    // the location will be saved as the 'previous' location, and everything that isn't
    // the modal will render underneath the modal as if the route never changed.
    if (!previousLocation || !isModalRoute) {
        yield put(routerExtensionSlice.actions.setPreviousLocation(location));
    }
}

function* routerExtensionSaga() {
    yield all([takeEvery(LOCATION_CHANGE, onLocationChange)]);
}

export default routerExtensionSaga;
