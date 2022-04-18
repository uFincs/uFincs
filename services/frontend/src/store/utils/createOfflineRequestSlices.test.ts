import {PayloadActionCreator} from "@reduxjs/toolkit";
import {Saga} from "redux-saga";
import {expectSaga} from "redux-saga-test-plan";
import {call} from "redux-saga-test-plan/matchers";
import {noOtherDispatches, SAGA_TIMEOUT} from "utils/testHelpers";
import {OfflineRequestManager} from "./createOfflineRequestManager";
import createOfflineRequestSlices from "./createOfflineRequestSlices";
import {objectifyError} from "./objectifyError";

const mountpoint = "mount";

const metaTags = {
    test: {
        effectStart: {
            encrypt: mountpoint
        }
    },
    test2: {},
    test3: {}
};

const slices = createOfflineRequestSlices(mountpoint, ["test", "test2", "test3"], metaTags);

describe("OfflineRequestSliceSet", () => {
    it("has all of the given request types", () => {
        expect(slices.test).toBeDefined();
        expect(slices.test2).toBeDefined();
        expect(slices.test3).toBeDefined();
    });
});

describe("OfflineRequestSlice", () => {
    const slice = slices.test;
    const {actions} = slice;

    describe("actions", () => {
        const necessaryActions = [
            // Actions from RequestSliceActions
            "request",
            "success",
            "failure",
            "clear",
            // Effect actions
            "effectStart",
            "effectSuccess",
            "effectFailure",
            // Rollback actions
            "rollbackStart",
            "rollbackSuccess",
            "rollbackFailure"
        ] as const;

        it("has all of the necessary actions", () => {
            necessaryActions.forEach((actionName) => {
                expect(actions[actionName]).not.toBe(undefined);
            });
        });

        it("can add meta tags to the actions", () => {
            expect(actions.effectStart().meta).toBe(metaTags.test.effectStart);
        });
    });

    describe("sagas", () => {
        const dummyPayload = {some: "data"};

        const generateDummySagas = (
            watchSagaWrapper: Function,
            successAction: PayloadActionCreator<any>
        ) => {
            const actionStart = successAction(dummyPayload);

            const wrappedSuccessSaga = function* ({payload}: {payload: any}) {
                expect(payload).toBe(dummyPayload);
            };

            const error = new Error("failure");
            const errorObject = objectifyError(error);

            const wrappedFailureSaga = function* () {
                throw error;
            };

            const successSaga = watchSagaWrapper(wrappedSuccessSaga);
            const failureSaga = watchSagaWrapper(wrappedFailureSaga);

            return {
                actionStart,
                wrappedSuccessSaga,
                wrappedFailureSaga,
                errorObject,
                successSaga,
                failureSaga
            };
        };

        describe("watchCommitSaga", () => {
            const {actionStart, successSaga, failureSaga} = generateDummySagas(
                slice.watchCommitSaga,
                actions.request
            );

            it("immediately queues the effect when no saga is provided", () => {
                const noSaga = slice.watchCommitSaga();

                return expectSaga(noSaga)
                    .dispatch(actions.request())
                    .put(actions.success())
                    .silentRun(SAGA_TIMEOUT)
                    .then(enqueuePayloadMatch({payload: {}, rollbackData: null}))
                    .then(noOtherDispatches);
            });

            it("enqueues the effect if the wrapped saga is successful", () => {
                return expectSaga(successSaga)
                    .dispatch(actionStart)
                    .put.actionType(OfflineRequestManager.enqueue({}).type)
                    .put(actions.success())
                    .silentRun(SAGA_TIMEOUT);
            });

            it("can dispatch success programmatically", () => {
                const wrappedSuccessSaga = function* (_: any, success?: Saga) {
                    yield call(success!);
                };

                return (
                    expectSaga(slice.watchCommitSaga(wrappedSuccessSaga))
                        .dispatch(actionStart)
                        .put(actions.success())
                        .put.actionType(OfflineRequestManager.enqueue({}).type)
                        // Make sure success isn't fired a second time.
                        .not.put(actions.success())
                        .silentRun(SAGA_TIMEOUT)
                );
            });

            it("dispatches failure when it throws an error", () => {
                return expectSaga(failureSaga)
                    .dispatch(actionStart)
                    .not.put.actionType(OfflineRequestManager.enqueue({}).type)
                    .put.actionType(actions.failure.type)
                    .silentRun(SAGA_TIMEOUT);
            });

            describe("effect payload", () => {
                const generateSaga = (dummyPayload: any, shouldReturn: boolean = true) => {
                    const wrappedSaga = function* ({payload}: {payload: any}) {
                        expect(payload).toBe(dummyPayload);

                        if (shouldReturn) {
                            return payload;
                        }
                    };

                    return slice.watchCommitSaga(wrappedSaga);
                };

                it("takes the original payload when no value is returned", () => {
                    const saga = generateSaga(dummyPayload, false);

                    return expectSaga(saga)
                        .dispatch(actions.request(dummyPayload))
                        .put(actions.success())
                        .silentRun(SAGA_TIMEOUT)
                        .then(enqueuePayloadMatch({payload: dummyPayload}))
                        .then(noOtherDispatches);
                });

                it("takes the whole return value if no explicit 'payload' property is provided", () => {
                    const saga = generateSaga(dummyPayload);

                    return expectSaga(saga)
                        .dispatch(actions.request(dummyPayload))
                        .put(actions.success())
                        .silentRun(SAGA_TIMEOUT)
                        .then(enqueuePayloadMatch({payload: dummyPayload}))
                        .then(noOtherDispatches);
                });

                it("can take from an explicit 'payload' property", () => {
                    const explicitPayload = {payload: "data"};
                    const saga = generateSaga(explicitPayload);

                    return expectSaga(saga)
                        .dispatch(actions.request(explicitPayload))
                        .put(actions.success())
                        .silentRun(SAGA_TIMEOUT)
                        .then(enqueuePayloadMatch({payload: "data"}))
                        .then(noOtherDispatches);
                });

                it("sets the 'rollbackData' to the payload when no explicit 'rollbackData' is provided", () => {
                    const saga = generateSaga(dummyPayload);

                    return expectSaga(saga)
                        .dispatch(actions.request(dummyPayload))
                        .put(actions.success())
                        .silentRun(SAGA_TIMEOUT)
                        .then(enqueuePayloadMatch({rollbackData: dummyPayload}))
                        .then(noOtherDispatches);
                });

                it("can take from an explicit 'rollbackData' property", () => {
                    const explicitRollback = {rollbackData: "data"};
                    const saga = generateSaga(explicitRollback);

                    return expectSaga(saga)
                        .dispatch(actions.request(explicitRollback))
                        .put(actions.success())
                        .silentRun(SAGA_TIMEOUT)
                        .then(enqueuePayloadMatch({rollbackData: "data"}))
                        .then(noOtherDispatches);
                });
            });
        });

        describe("watchEffectSaga", () => {
            const {actionStart, wrappedSuccessSaga, errorObject, successSaga, failureSaga} =
                generateDummySagas(slice.watchEffectSaga, actions.effectStart);

            it("calls the saga being wrapped when receiving the effectStart action", () => {
                return expectSaga(successSaga)
                    .dispatch(actionStart)
                    .call(wrappedSuccessSaga, actionStart)
                    .silentRun(SAGA_TIMEOUT);
            });

            it("dispatches the effectSuccess action if the wrapped saga is doesn't throw an error", () => {
                return expectSaga(successSaga)
                    .dispatch(actionStart)
                    .put(actions.effectSuccess())
                    .silentRun(SAGA_TIMEOUT);
            });

            it("dispatches the effectFailure action if the wrapped saga does throw an error", () => {
                return expectSaga(failureSaga)
                    .dispatch(actionStart)
                    .put(actions.effectFailure(errorObject))
                    .silentRun(SAGA_TIMEOUT);
            });

            it("dispatches the effectFailure action when the received action has an error", () => {
                return expectSaga(successSaga)
                    .dispatch({...actionStart, error: true})
                    .put(actions.effectFailure(dummyPayload))
                    .silentRun(SAGA_TIMEOUT);
            });
        });

        describe("watchRollbackSaga", () => {
            const {actionStart, wrappedSuccessSaga, errorObject, successSaga, failureSaga} =
                generateDummySagas(slice.watchRollbackSaga, actions.rollbackStart);

            it("calls the saga being wrapped when receiving the rollbackStart action", () => {
                return expectSaga(successSaga)
                    .dispatch(actionStart)
                    .call(wrappedSuccessSaga, actionStart)
                    .silentRun(SAGA_TIMEOUT);
            });

            it("dispatches the rollbackSuccess action if the wrapped saga is doesn't throw an error", () => {
                return expectSaga(successSaga)
                    .dispatch(actionStart)
                    .put(actions.rollbackSuccess())
                    .silentRun(SAGA_TIMEOUT);
            });

            it("dispatches the rollbackFailure action if the wrapped saga does throw an error", () => {
                return expectSaga(failureSaga)
                    .dispatch(actionStart)
                    .put(actions.rollbackFailure(errorObject))
                    .silentRun(SAGA_TIMEOUT);
            });
        });
    });
});

/* Helper Functions */

// Since the QueueableEffect assigns a random ID each time, we need
// to manually assert on the other attributes of the payload instead
// of using the built-in 'put' assert.
const enqueuePayloadMatch = (expectedPayload: any) => (results: any) => {
    const {effects} = results;
    expect(effects.put.length).not.toBe(0);

    const enqueueAction = effects.put[0].payload.action;

    expect(enqueueAction.type).toBe(OfflineRequestManager.enqueue({}).type);
    expect(enqueueAction.payload).toMatchObject(expectedPayload);

    effects.put.shift();
    return results;
};
