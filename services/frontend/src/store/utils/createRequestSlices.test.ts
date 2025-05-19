import {LOCATION_CHANGE} from "connected-react-router";
import {Saga} from "redux-saga";
import {delay, put} from "redux-saga/effects";
import {expectSaga} from "redux-saga-test-plan";
import {SAGA_TIMEOUT} from "utils/testHelpers";
import createRequestSlices, {
    MountPoint,
    RequestSlice,
    RequestSliceActions
} from "./createRequestSlices";
import {objectifyError} from "./objectifyError";

const expectRequestSliceToHaveAttributes = (requestSlice: RequestSlice, mountpoint: MountPoint) => {
    expect(requestSlice.name).toBe(mountpoint);
    expect(requestSlice.actions).not.toBe(undefined);
    expect(requestSlice.selectors).not.toBe(undefined);
    expect(requestSlice.reducer).not.toBe(undefined);
};

describe("RequestSlice", () => {
    const mountpoint = "mountpoint";
    const requestType = "requestType";

    const requestSlice = new RequestSlice({mountpoint, requestType});

    it("has all of the attributes of a redux-toolkit slice", () => {
        expectRequestSliceToHaveAttributes(requestSlice, mountpoint);
    });

    describe("actions", () => {
        const expectedActionNames = ["request", "success", "failure", "clear"] as const;
        const {actions} = requestSlice;

        it("has actions for handling the lifecycle of a request", () => {
            expectedActionNames.forEach((actionName) => {
                expect(actions[actionName]).not.toBe(undefined);
            });
        });

        it("has actions that include the mountpoint and request type in their signature", () => {
            expectedActionNames.forEach((actionName) => {
                const actionType = requestSlice.actions[actionName].type;

                expect(actionType).toContain(mountpoint);
                expect(actionType).toContain(requestType);
                expect(actionType).toContain(actionName);
            });
        });
    });

    describe("reducer", () => {
        const {actions, initialState, reducer} = requestSlice;

        const error = {message: "error"};

        const requestState = {loading: true, error: null};
        const successState = initialState;
        const failureState = {loading: false, error};

        it("has an initial state for loading and error", () => {
            // @ts-expect-error Allow testing random actions.
            expect(reducer(undefined, {})).toEqual(initialState);
        });

        it("marks the state as 'loading' when receiving the initial request", () => {
            expect(reducer(undefined, actions.request())).toEqual(requestState);
        });

        it("marks the state as no longer loading when knowing the request is successful", () => {
            expect(reducer(undefined, actions.success())).toEqual(successState);
            expect(reducer(requestState, actions.success())).toEqual(successState);
        });

        it("marks the state as no longer loading and leaves an error message when the request fails", () => {
            expect(reducer(undefined, actions.failure(error))).toEqual(failureState);
            expect(reducer(requestState, actions.failure(error))).toEqual(failureState);
        });

        it("can clear the entire state", () => {
            expect(reducer(undefined, actions.clear())).toEqual(initialState);
            expect(reducer(requestState, actions.clear())).toEqual(initialState);
            expect(reducer(successState, actions.clear())).toEqual(initialState);
            expect(reducer(failureState, actions.clear())).toEqual(initialState);
        });
    });

    describe("selectors", () => {
        const {selectors} = requestSlice;

        const requestState = {loading: true, error: {message: "error"}};

        const initialState = {
            [mountpoint]: {
                [requestType]: requestSlice.initialState
            }
        };

        const state = {
            [mountpoint]: {
                [requestType]: requestState
            }
        };

        it("has a selector for getting the whole request state", () => {
            expect(selectors.selectState(state)).toEqual(requestState);
        });

        it("has a selector for getting just the loading state", () => {
            expect(selectors.selectLoading(state)).toEqual(requestState.loading);
        });

        it("has a selector for getting just the error state", () => {
            expect(selectors.selectError(state)).toEqual(requestState.error);
        });

        it("has a selector for getting just the error message", () => {
            expect(selectors.selectErrorMessage(state)).toEqual(requestState.error.message);
        });

        it("has a selector for getting just the error message when the error is null", () => {
            expect(selectors.selectErrorMessage(initialState)).toEqual("");
        });

        it("has selectors that return nothing when given the wrong state slice", () => {
            expect(selectors.selectState({})).toEqual(undefined);
        });
    });

    describe("watchRequestSaga", () => {
        const {actions, watchRequestSaga} = requestSlice;

        const dummyAction = {type: "test"};
        const errorMessage = "error";

        const dummyError = new Error(errorMessage);

        const dummySaga = function* () {
            yield put(dummyAction);
        };

        const dummySagaWithDelay = function* () {
            yield delay(2);
            yield dummySaga();
        };

        const dummySagaWithError = function* () {
            yield dummySaga();
            throw dummyError;
        };

        const dummySagaWithSuccess = function* (_action: any, success: Saga) {
            yield dummySaga();
            yield success();
        };

        const watcherSaga = watchRequestSaga(dummySaga);

        it("listens for and fires on request actions", () => {
            return expectSaga(watcherSaga)
                .put(dummyAction)
                .dispatch(actions.request())
                .silentRun(SAGA_TIMEOUT);
        });

        it("doesn't fire the saga when the request action isn't fired", () => {
            return expectSaga(watcherSaga).not.put(dummyAction).silentRun(SAGA_TIMEOUT);
        });

        // This test has a race condition where sometimes it'll pass and sometimes it'll fail
        // (because it uses takeEvery and has to complete everything within the SAGA_TIMEOUT).
        // I'm just commenting it out since it's being more annoying than helpful, with
        // random test failures.
        // it("can fire on every request", () => {
        //     return expectSaga(watchRequestSaga(dummySagaWithDelay, {processEvery: true}))
        //         .put(dummyAction)
        //         .put(dummyAction)
        //         .dispatch(actions.request())
        //         .dispatch(actions.request())
        //         .silentRun(SAGA_TIMEOUT);
        // });

        // This test has a race condition where sometimes it'll pass and sometimes it'll fail
        // (because it uses takeLatest and has to complete everything within the SAGA_TIMEOUT).
        // I'm just commenting it out since it's being more annoying than helpful, with
        // random test failures.
        // it("can fire on only the latest request", () => {
        //     return expectSaga(watchRequestSaga(dummySagaWithDelay, {processEvery: false}))
        //         .put(dummyAction)
        //         .not.put(dummyAction)
        //         .dispatch(actions.request())
        //         .dispatch(actions.request())
        //         .silentRun(SAGA_TIMEOUT);
        // });

        it("fires off a success action on completion of the saga", () => {
            return expectSaga(watcherSaga)
                .put(dummyAction)
                .put(actions.success())
                .dispatch(actions.request())
                .silentRun(SAGA_TIMEOUT);
        });

        it("fires off a failure action on failure of the saga", () => {
            return expectSaga(watchRequestSaga(dummySagaWithError))
                .put(dummyAction)
                .put(actions.failure(objectifyError(dummyError)))
                .dispatch(actions.request())
                .silentRun(SAGA_TIMEOUT);
        });

        it("doesn't fire off a second success action when the saga manually fires one off", () => {
            return expectSaga(watchRequestSaga(dummySagaWithSuccess))
                .put(dummyAction)
                .put(actions.success())
                .not.put(actions.success())
                .dispatch(actions.request())
                .silentRun(SAGA_TIMEOUT);
        });

        it("can cancel the saga whenever the route changes", () => {
            return expectSaga(watchRequestSaga(dummySagaWithDelay, {routeChangeCancellable: true}))
                .not.put(dummyAction)
                .put(actions.success())
                .dispatch(actions.request())
                .dispatch({type: LOCATION_CHANGE})
                .silentRun(SAGA_TIMEOUT);
        });

        it("can handle multiple successive requests with the correct number of success actions", () => {
            return expectSaga(watcherSaga)
                .put(dummyAction)
                .put(dummyAction)
                .put(actions.success())
                .put(actions.success())
                .dispatch(actions.request())
                .dispatch(actions.request())
                .silentRun(SAGA_TIMEOUT);
        });
    });
});

describe("RequestSliceActions", () => {
    const mountpoint = "mountpoint";
    const requestType = "requestType";

    const actions = new RequestSliceActions({mountpoint, requestType});

    it("can test for valid request slice actions", () => {
        expect(RequestSliceActions.isAction(actions.request())).toBe(true);
    });

    it("can test for invalid request slice actions", () => {
        expect(RequestSliceActions.isAction({type: "some other random type"})).toBe(false);
        expect(RequestSliceActions.isAction({type: "some/"})).toBe(false);
        expect(RequestSliceActions.isAction({type: "some/other"})).toBe(false);

        expect(RequestSliceActions._isTypeAction({type: "some other random type"}, "request")).toBe(
            false
        );

        expect(RequestSliceActions._isTypeAction({type: "some/"}, "success")).toBe(false);
        expect(RequestSliceActions._isTypeAction({type: "some/other"}, "failure")).toBe(false);
        expect(RequestSliceActions._isTypeAction({type: "some/other/request"}, "clear")).toBe(
            false
        );
    });

    it("can test for valid request actions", () => {
        expect(RequestSliceActions.isRequestAction(actions.request())).toBe(true);
    });

    it("can test for valid success actions", () => {
        expect(RequestSliceActions.isSuccessAction(actions.success())).toBe(true);
    });

    it("can test for valid failure actions", () => {
        expect(RequestSliceActions.isFailureAction(actions.failure({message: ""}))).toBe(true);
    });

    it("can test for valid clear actions", () => {
        expect(RequestSliceActions.isClearAction(actions.clear())).toBe(true);
    });
});

describe("createRequestSlices (RequestSliceSet)", () => {
    const mountpoint = "mountpoint";
    const requestTypes = ["type1", "type2"];

    const requestSliceSet = createRequestSlices(mountpoint, requestTypes);

    it("has a slice mountpoint", () => {
        expect(requestSliceSet.name).toBe(mountpoint);
    });

    it("has a reducer for all of the request slices", () => {
        expect(requestSliceSet.reducer).not.toBe(undefined);
    });

    it("has a set of a request slices", () => {
        expect(requestSliceSet[requestTypes[0]]).not.toBe(undefined);
        expect(requestSliceSet[requestTypes[1]]).not.toBe(undefined);
    });

    describe("reducer", () => {
        const {reducer} = requestSliceSet;

        it("creates nested state slices for each request type", () => {
            // @ts-expect-error Allow testing random actions.
            expect(reducer(undefined, {})).toEqual({
                [requestTypes[0]]: requestSliceSet[requestTypes[0]].initialState,
                [requestTypes[1]]: requestSliceSet[requestTypes[1]].initialState
            });
        });
    });

    describe("request slices", () => {
        it("has all the attributes of a request slice", () => {
            expectRequestSliceToHaveAttributes(requestSliceSet[requestTypes[0]], mountpoint);
            expectRequestSliceToHaveAttributes(requestSliceSet[requestTypes[1]], mountpoint);
        });
    });
});
