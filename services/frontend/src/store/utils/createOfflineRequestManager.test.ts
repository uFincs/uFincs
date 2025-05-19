import {combineReducers} from "redux";
import {call} from "redux-saga/effects";
import {expectSaga, RunResult} from "redux-saga-test-plan";
import {EffectProviders} from "redux-saga-test-plan/providers";
import {noOtherDispatches, silenceConsoleErrors, SAGA_TIMEOUT} from "utils/testHelpers";
import createOfflineRequestManager, {
    OfflineRequestManager,
    QueueableEffect,
    RollbackPayload,
    NativeConnectivityState
} from "./createOfflineRequestManager";
import createOfflineRequestSlices from "./createOfflineRequestSlices";

const mountpoint = "mount";
const manager = createOfflineRequestManager(mountpoint);

const {actions} = OfflineRequestManager;

const dummyError = {message: ""};

describe("actions", () => {
    const necessaryActions = [
        "enqueue",
        "dequeue",
        "incrementAttempts",
        "updateConnectivity",
        "processQueue"
    ] as const;

    it("has all of the necessary actions", () => {
        necessaryActions.forEach((actionName) => {
            expect(actions[actionName]).not.toBe(undefined);
            expect(actions[actionName].type.includes(actionName)).toBe(true);
        });
    });
});

describe("reducer", () => {
    const {reducer, initialState} = manager;

    const effect = new QueueableEffect();

    const baseState = {
        effectsById: {[effect.id]: effect},
        queue: [effect.id],
        fetchQueue: [],
        isOnline: true
    };

    it("can enqueue a new effect", () => {
        expect(reducer(undefined, actions.enqueue(effect))).toEqual(baseState);
    });

    it("enqueues fetch effects to a separate queue so that they always executed last", () => {
        const regularEffect = new QueueableEffect();

        const fetchEffect = new QueueableEffect({
            isFetchEffect: true,
            sliceId: "test"
        });

        const expectedState = {
            effectsById: {[fetchEffect.id]: fetchEffect, [regularEffect.id]: regularEffect},
            queue: [regularEffect.id],
            fetchQueue: [fetchEffect.id],
            isOnline: true
        };

        const firstState = reducer(initialState, actions.enqueue(regularEffect));
        const secondState = reducer(firstState, actions.enqueue(fetchEffect));

        // The fetch effect should be in the effect queue.
        expect(secondState).toEqual(expectedState);

        const fetchEffect2 = new QueueableEffect({
            isFetchEffect: true,
            sliceId: "test"
        });

        // Adding another fetch effect of the same type (i.e. sliceId) should result in no changes.
        expect(reducer(secondState, actions.enqueue(fetchEffect2))).toEqual(expectedState);
    });

    it("can dequeue the head effect", () => {
        expect(reducer(baseState, actions.dequeue())).toEqual(initialState);
    });

    it("dequeues from the fetch queue once the regular queue is depleted", () => {
        const fetchEffect = new QueueableEffect({isFetchEffect: true});

        const fetchOnlyState = {
            ...initialState,
            effectsById: {
                [fetchEffect.id]: fetchEffect
            },
            queue: [],
            fetchQueue: [fetchEffect.id]
        };

        const state = {
            ...initialState,
            effectsById: {
                ...baseState.effectsById,
                ...fetchOnlyState.effectsById
            },
            queue: baseState.queue,
            fetchQueue: fetchOnlyState.fetchQueue
        };

        const firstState = reducer(state, actions.dequeue());

        expect(firstState).toEqual(fetchOnlyState);
        expect(reducer(firstState, actions.dequeue())).toEqual(initialState);
    });

    it("does nothing when dequeuing an empty queue of effects", () => {
        expect(reducer(undefined, actions.dequeue())).toEqual(initialState);
    });

    it("can increment the number of attempts have been made for a failing effect", () => {
        const newState = reducer(baseState, actions.incrementAttempts(effect.id));
        expect(newState.effectsById[effect.id].attempts).toBe(1);
    });

    it("doesn't mutably mutate state from incrementing attempts", () => {
        // Yes, this is just a copy of the above test. Need to make sure the original state isn't directly mutated.
        const newState = reducer(baseState, actions.incrementAttempts(effect.id));
        expect(newState.effectsById[effect.id].attempts).toBe(1);
    });

    it("does nothing when trying to increment the attempts for a non-existent effect", () => {
        expect(reducer(undefined, actions.incrementAttempts(effect.id))).toEqual(initialState);
    });

    it("can update the state of connectivity to the backend", () => {
        const newState = reducer(undefined, actions.updateConnectivity(false));
        expect(newState.isOnline).toBe(false);
    });
});

describe("selectors", () => {
    const {selectors} = manager;

    const effect = new QueueableEffect();

    const initialState = {
        effectsById: {
            [effect.id]: effect
        },
        queue: [effect.id],
        fetchQueue: [],
        isOnline: true
    };

    const state = {[mountpoint]: initialState};

    it("can get the whole state", () => {
        expect(selectors.selectState(state)).toEqual(initialState);
    });

    it("can get the effects by ID", () => {
        expect(selectors.selectEffectsById(state)).toEqual(initialState.effectsById);
    });

    it("can get the queue of effects", () => {
        expect(selectors.selectQueue(state)).toEqual(initialState.queue);
    });

    it("can get the length of the queue", () => {
        expect(selectors.selectQueueLength(state)).toEqual(initialState.queue.length);
    });

    it("can get the head effect of the queue", () => {
        expect(selectors.selectQueueHead(state)).toEqual(effect);
    });
});

describe("sagas", () => {
    const {reducer, connectivityCheckSaga, processQueueSaga, initialState} = manager;

    const slice = createOfflineRequestSlices("slice", ["test"]);

    const payload = "payload";
    const rollbackData = "rollback data";

    const effect = new QueueableEffect({
        payload,
        rollbackData,
        actions: slice.test.actions.getEffectAndRollbackActions()
    });

    const effect2 = new QueueableEffect({
        payload,
        rollbackData,
        actions: slice.test.actions.getEffectAndRollbackActions()
    });

    const effectFailurePayload = {code: 403};
    const rollbackStartPayload = new RollbackPayload({...effect, error: effectFailurePayload});

    const baseState = {
        effectsById: {
            [effect.id]: effect
        },
        queue: [effect.id],
        fetchQueue: [],
        isOnline: true
    };

    const state = {[mountpoint]: baseState};
    const emptyState = {[mountpoint]: initialState};

    const multiEffectState = {
        [mountpoint]: {
            effectsById: {...baseState.effectsById, [effect2.id]: effect2},
            queue: [effect2.id, ...baseState.queue],
            fetchQueue: [],
            isOnline: true
        }
    };

    const mountedReducer = combineReducers({[mountpoint]: reducer});

    describe("processQueueSaga", () => {
        it("starts processing when a processQueue action is dispatched", () => {
            return expectSaga(processQueueSaga)
                .withState(state)
                .dispatch(actions.processQueue())
                .put(slice.test.actions.effectStart(payload))
                .silentRun(SAGA_TIMEOUT)
                .then(noOtherDispatches);
        });

        it("doesn't do anything when it hasn't received a processQueue action", () => {
            return expectSaga(processQueueSaga)
                .withState(state)
                .not.put(slice.test.actions.effectStart(payload))
                .silentRun(SAGA_TIMEOUT)
                .then(noOtherDispatches);
        });

        it("doesn't do anything when trying to process an empty queue of effects", () => {
            return expectSaga(processQueueSaga)
                .withState(emptyState)
                .dispatch(actions.processQueue())
                .not.put(slice.test.actions.effectStart(payload))
                .silentRun(SAGA_TIMEOUT)
                .then(noOtherDispatches);
        });

        it("runs the head effect and dequeues it if it is successful", () => {
            return expectSaga(processQueueSaga)
                .withReducer(mountedReducer)
                .withState(state)
                .dispatch(actions.processQueue())
                .dispatch(slice.test.actions.effectSuccess())
                .put(slice.test.actions.effectStart(payload))
                .put(actions.dequeue())
                .hasFinalState(emptyState)
                .silentRun(SAGA_TIMEOUT)
                .then(noOtherDispatches);
        });

        it("processes all effects in the queue and dequeues them all if they are successful", () => {
            return expectSaga(processQueueSaga)
                .withReducer(mountedReducer)
                .withState(multiEffectState)
                .dispatch(actions.processQueue())
                .dispatch(slice.test.actions.effectSuccess())
                .dispatch(slice.test.actions.effectSuccess())
                .put(slice.test.actions.effectStart(payload))
                .put(actions.dequeue())
                .put(slice.test.actions.effectStart(payload))
                .put(actions.dequeue())
                .hasFinalState(emptyState)
                .silentRun(SAGA_TIMEOUT)
                .then(noOtherDispatches);
        });

        it("increments the attempts on an effect when the effect fails and stops processing any more", () => {
            return expectSaga(processQueueSaga)
                .withReducer(mountedReducer)
                .withState(state)
                .dispatch(actions.processQueue())
                .dispatch(slice.test.actions.effectFailure(dummyError))
                .put(slice.test.actions.effectStart(payload))
                .put(actions.incrementAttempts(effect.id))
                .silentRun(SAGA_TIMEOUT)
                .then(noOtherDispatches)
                .then(attemptsMatch(effect, 1));
        });

        it("increments the attempts on an effect when the effect times out", () => {
            return expectSaga(processQueueSaga)
                .provide([provideDelay()])
                .withReducer(mountedReducer)
                .withState(state)
                .dispatch(actions.processQueue())
                .put(slice.test.actions.effectStart(payload))
                .put(actions.incrementAttempts(effect.id))
                .silentRun(SAGA_TIMEOUT)
                .then(noOtherDispatches)
                .then(attemptsMatch(effect, 1));
        });

        it("doesn't increment the attempts when the effect fails with a network error", () => {
            return expectSaga(processQueueSaga)
                .withReducer(mountedReducer)
                .withState(state)
                .dispatch(actions.processQueue())
                .dispatch(slice.test.actions.effectFailure({message: "Network Error"}))
                .put(slice.test.actions.effectStart(payload))
                .not.put(actions.incrementAttempts(effect.id))
                .silentRun(SAGA_TIMEOUT)
                .then(noOtherDispatches)
                .then(attemptsMatch(effect, 0));
        });

        it("stops processing effects once the head effect has failed", () => {
            return expectSaga(processQueueSaga)
                .withReducer(mountedReducer)
                .withState(multiEffectState)
                .dispatch(actions.processQueue())
                .dispatch(slice.test.actions.effectFailure(dummyError))
                .put(slice.test.actions.effectStart(payload))
                .put(actions.incrementAttempts(effect.id))
                .silentRun(SAGA_TIMEOUT)
                .then(noOtherDispatches)
                .then(attemptsMatch(effect, 1))
                .then(attemptsMatch(effect2, 0));
        });

        it("triggers a rollback when an effect has failed enough times", () => {
            return (
                expectSaga(processQueueSaga)
                    .withReducer(mountedReducer)
                    .withState(state)
                    // Make the queue be processed 3 times (because REQUEST_MAX_ATTEMPTS = 3)
                    .dispatch(actions.processQueue())
                    .dispatch(slice.test.actions.effectFailure(dummyError))
                    .dispatch(actions.processQueue())
                    .dispatch(slice.test.actions.effectFailure(dummyError))
                    .dispatch(actions.processQueue())
                    .dispatch(slice.test.actions.effectFailure(effectFailurePayload))
                    .dispatch(slice.test.actions.rollbackSuccess())
                    // The 'attempts' is incremented twice
                    .put(slice.test.actions.effectStart(payload))
                    .put(actions.incrementAttempts(effect.id))
                    .put(slice.test.actions.effectStart(payload))
                    .put(actions.incrementAttempts(effect.id))
                    .put(slice.test.actions.effectStart(payload))
                    // Should rollback on the third failed attempt
                    .put(slice.test.actions.rollbackStart(rollbackStartPayload))
                    .put(actions.dequeue())
                    .hasFinalState(emptyState)
                    .silentRun(SAGA_TIMEOUT)
                    .then(noOtherDispatches)
            );
        });

        it("throws an error but still dequeues an effect when rollback fails", () => {
            silenceConsoleErrors();

            return (
                expectSaga(processQueueSaga)
                    .withReducer(mountedReducer)
                    .withState(state)
                    // Make the queue be processed 3 times (because REQUEST_MAX_ATTEMPTS = 3)
                    .dispatch(actions.processQueue())
                    .dispatch(slice.test.actions.effectFailure(dummyError))
                    .dispatch(actions.processQueue())
                    .dispatch(slice.test.actions.effectFailure(dummyError))
                    .dispatch(actions.processQueue())
                    .dispatch(slice.test.actions.effectFailure(effectFailurePayload))
                    .dispatch(slice.test.actions.rollbackFailure(dummyError))
                    .put(actions.dequeue())
                    .hasFinalState(emptyState)
                    .silentRun(SAGA_TIMEOUT)
                    .then(noOtherDispatches)
                    .catch((e) => expect(e.message).toBe("Failed to rollback; try refreshing."))
            );
        });

        it("throws an error when a rollback times out", () => {
            silenceConsoleErrors();

            return (
                expectSaga(processQueueSaga)
                    .provide([provideDelay()])
                    .withReducer(mountedReducer)
                    .withState(state)
                    // Make the queue be processed 3 times (because REQUEST_MAX_ATTEMPTS = 3)
                    .dispatch(actions.processQueue())
                    .dispatch(slice.test.actions.effectFailure(dummyError))
                    .dispatch(actions.processQueue())
                    .dispatch(slice.test.actions.effectFailure(dummyError))
                    .dispatch(actions.processQueue())
                    .dispatch(slice.test.actions.effectFailure(effectFailurePayload))
                    // Since no rollback action is dispatched, it must wait for the delay to resolve.
                    .hasFinalState(emptyState)
                    .silentRun(SAGA_TIMEOUT)
                    .then(noOtherDispatches)
                    .catch((e) => expect(e.message).toBe("Failed to rollback; try refreshing."))
            );
        });
    });

    describe("connectivityCheckSaga", () => {
        it("goes offline when a native offline event occurs", () => {
            return expectSaga(connectivityCheckSaga)
                .provide([provideConnectivityChannelOnce({manager, online: false})])
                .withReducer(mountedReducer)
                .withState(state)
                .put(actions.updateConnectivity(false))
                .not.put(actions.processQueue())
                .silentRun(SAGA_TIMEOUT)
                .then(noOtherDispatches)
                .then(onlineMatch(false));
        });

        it("triggers queue processing when the connectivity check passes and there are effects to process", () => {
            return expectSaga(connectivityCheckSaga)
                .provide([[call(manager._checkConnectivity), true]])
                .withReducer(mountedReducer)
                .withState(emptyState)
                .dispatch(actions.enqueue(effect))
                .put(actions.updateConnectivity(true))
                .put(actions.processQueue())
                .hasFinalState(state)
                .silentRun(SAGA_TIMEOUT)
                .then(noOtherDispatches);
        });

        it("goes offline when the connectivity check times out", () => {
            // Mocks out both the poll delay and the connectivity check timeout
            // at the 'race' level instead of the 'delay' level.
            //
            // Need to do this otherwise the '_checkConnectivity' is actually called,
            // which calls fetch, which (for some reason) stays open and doesn't get cancelled
            // by the timeout winning the race. As a result, jest finishes with the
            // "Jest did not exit one second after the test run has completed" message.
            //
            // This 'race' level mocking only needs to be done for this test because every
            // other test manually mocks out the call to '_checkConnectivity'.
            //
            // And we also do it at the 'race' level so that we don't have to mock fetch itself.
            //
            // Note that if we mock both the '_checkConnectivity' call and the timeout delay,
            // then it is ambiguous which finishes the race first (although I think it has to do
            // with the order they are declared in the race, but I'm not leaving it up to chance).
            //
            // Also note that we use a count so that only the first two races (i.e. those in the first
            // loop of the saga) get mocked. Subsequent races will depend on the actual delay values,
            // which is fine since the SAGA_TIMEOUT will then quick in and finish the test. This
            // is the principle used for all of these 'infinite loop saga' tests.
            const mockTimeouts = (): EffectProviders => {
                let count = 0;

                return {
                    race: (effect, next) => {
                        if (count < 2 && "poll" in effect && effect.poll) {
                            count += 1;
                            return {poll: true};
                        }

                        if (count < 2 && "timeout" in effect && effect.timeout) {
                            count += 1;
                            return {timeout: true};
                        }

                        return next();
                    }
                };
            };

            return expectSaga(connectivityCheckSaga)
                .provide([mockTimeouts()])
                .withReducer(mountedReducer)
                .withState(state)
                .silentRun(SAGA_TIMEOUT)
                .then(onlineMatch(false));
        });

        it("goes offline when the connectivity check errors out", () => {
            return expectSaga(connectivityCheckSaga)
                .provide([
                    // Provide a delay to trigger the 'poll'.
                    provideDelay({provideCount: 1}),
                    // Throw an error for the connectivity check.
                    provideCallError(manager._checkConnectivity)
                ])
                .withReducer(mountedReducer)
                .withState(state)
                .put(actions.updateConnectivity(false))
                .not.put(actions.processQueue())
                .silentRun(SAGA_TIMEOUT)
                .then(noOtherDispatches)
                .then(onlineMatch(false));
        });

        it("doesn't do anything when the system is already online/stays online and no effects are queued", () => {
            return expectSaga(connectivityCheckSaga)
                .provide([
                    // Provide a delay to trigger the 'poll'.
                    provideDelay({provideCount: 1}),
                    [call(manager._checkConnectivity), true]
                ])
                .withReducer(mountedReducer)
                .withState(emptyState)
                .not.put.actionType(actions.updateConnectivity.type)
                .not.put(actions.processQueue())
                .hasFinalState(emptyState)
                .silentRun(SAGA_TIMEOUT)
                .then(noOtherDispatches);
        });

        it("doesn't do anything when the system is already offline and the connectivity check fails", () => {
            const offlineEmptyState = {...emptyState, isOnline: false};

            return expectSaga(connectivityCheckSaga)
                .provide([
                    // Provide a delay to trigger the 'poll'.
                    provideDelay({provideCount: 1}),
                    [call(manager._checkConnectivity), false]
                ])
                .withReducer(mountedReducer)
                .withState(offlineEmptyState)
                .not.put.actionType(actions.updateConnectivity.type)
                .not.put(actions.processQueue())
                .hasFinalState(offlineEmptyState)
                .silentRun(SAGA_TIMEOUT)
                .then(noOtherDispatches);
        });
    });
});

/* Helper Functions */

// Make sure the number of attempts for the given effect is correct.
const attemptsMatch = (effect: QueueableEffect, attempts: number) => (results: RunResult) => {
    expect(results.storeState[mountpoint].effectsById[effect.id].attempts).toBe(attempts);
    return results;
};

// Make sure the online state is correct.
const onlineMatch = (connectivityState: boolean) => (results: RunResult) => {
    expect(results.storeState[mountpoint].isOnline).toBe(connectivityState);
    return results;
};

// There is no direct provider for 'delay'; it is based on the 'call' effect,
// so we have to check for the correct function name.
// Taken from https://github.com/jfairbank/redux-saga-test-plan/issues/257#issuecomment-503016758.
const provideDelay = ({provideCount = 0} = {}): EffectProviders => {
    // A 'provideCount' of 0 means to provide for all delays.
    let timesFired = 0;

    return {
        call: ({fn}, next) => {
            if ((provideCount === 0 || timesFired < provideCount) && fn.name === "delayP") {
                timesFired += 1;
                return true;
            }

            return next();
        }
    };
};

const provideConnectivityChannelOnce = ({
    manager,
    online = true
}: {
    manager: OfflineRequestManager;
    online: boolean;
}): EffectProviders => {
    let hasFired = false;

    return {
        take: ({channel}, next) => {
            if (channel === manager._nativeConnectivityEventChannel && !hasFired) {
                hasFired = true;
                return online ? NativeConnectivityState.Online : NativeConnectivityState.Offline;
            }

            return next();
        }
    };
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const provideCallError = (fn: Function): EffectProviders => ({
    call: (effect, next) => {
        if (effect.fn === fn) {
            throw new Error("provided error");
        }

        return next();
    }
});
