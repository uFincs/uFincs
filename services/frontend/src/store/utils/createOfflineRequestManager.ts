import {
    createAction,
    createReducer,
    createSelector,
    AnyAction,
    PayloadActionCreator,
    Reducer,
    Selector,
    PayloadAction
} from "@reduxjs/toolkit";
import {eventChannel, EventChannel} from "redux-saga";
import {call, delay, put, take, race, select} from "redux-saga/effects";
import {v4 as uuidv4} from "uuid";
import api, {ApiError} from "api/";
import {BACKEND_HEALTHCHECK_ROUTE} from "config";
import {State} from "store/types";
import isNetworkError from "utils/isNetworkError";
import {GenericObject, Id} from "utils/types";
import {SerializedOfflineRequestSliceActions} from "./createOfflineRequestSlices";

export interface OfflineRequestManagerState {
    effectsById: Record<Id, QueueableEffect>;
    queue: Array<Id>;
    fetchQueue: Array<Id>;
    isOnline: boolean;
}

export enum NativeConnectivityState {
    Offline,
    Online
}

// The base amount of time between polling the backend for connectivity.
// It follows an exponential backoff schedule.
const CONNECTIVITY_BASE_POLL_TIME = 5; // 5 seconds.

// 5 seconds seems like a good enough test that, if failed,
// would seem to indicate that the connection is at least very unstable,
// and the system should shift to offline mode.
const CONNECTIVITY_TIMEOUT = 5 * 1000; // 5 seconds.

// The base amount of time before an effect request times out.
// It follows an exponential backoff schedule.
const REQUEST_BASE_TIMEOUT = 10; // 10 seconds.

// 3 retries of an effect before triggering a rollback.
const REQUEST_MAX_ATTEMPTS = 3;

// The exponential backoff algo.  'baseValue' is in seconds, not milliseconds.
// That's why CONNECTIVITY_BASE_POLL_TIME and REQUEST_BASE_TIMEOUT are in seconds.
const exponentialBackoff = (baseValue: number, attempts: number = 0): number =>
    baseValue * 2 ** attempts * 1000;

class OfflineRequestManagerActions {
    enqueue: PayloadActionCreator<any>;
    dequeue: PayloadActionCreator<void>;
    incrementAttempts: PayloadActionCreator<Id>;
    updateConnectivity: PayloadActionCreator<boolean>;
    processQueue: PayloadActionCreator<void>;

    static baseActionType = "offlineRequestManager";

    constructor() {
        this.enqueue = createAction(`${OfflineRequestManagerActions.baseActionType}/enqueue`);
        this.dequeue = createAction(`${OfflineRequestManagerActions.baseActionType}/dequeue`);

        this.incrementAttempts = createAction(
            `${OfflineRequestManagerActions.baseActionType}/incrementAttempts`
        );

        this.updateConnectivity = createAction(
            `${OfflineRequestManagerActions.baseActionType}/updateConnectivity`
        );

        this.processQueue = createAction(
            `${OfflineRequestManagerActions.baseActionType}/processQueue`
        );
    }
}

export class OfflineRequestManager {
    name: string;

    connectivityBasePollTime: number;
    connectivityTimeout: number;
    requestBaseTimeout: number;
    requestMaxAttempts: number;

    reducer: Reducer<OfflineRequestManagerState, AnyAction>;
    selectors: OfflineRequestManagerSelectors;

    processQueueSaga: () => Generator;
    connectivityCheckSaga: () => Generator;

    _nativeConnectivityEventChannel: EventChannel<NativeConnectivityState>;

    static actions = new OfflineRequestManagerActions();

    // The queue is a JavaScript array queue. That is,
    // the 'head' of the queue is at the end of the array (the last element)
    // and the most recent element is at the beginning of the array (the first element).
    // As such, `.unshift()` is used to enqueue and `.pop()` is used to dequeue.
    initialState: OfflineRequestManagerState = {
        effectsById: {},
        queue: [],
        fetchQueue: [],
        isOnline: true
    };

    constructor({
        mountpoint,
        connectivityBasePollTime = CONNECTIVITY_BASE_POLL_TIME,
        connectivityTimeout = CONNECTIVITY_TIMEOUT,
        requestBaseTimeout = REQUEST_BASE_TIMEOUT,
        requestMaxAttempts = REQUEST_MAX_ATTEMPTS
    }: Partial<OfflineRequestManager> & {mountpoint: string}) {
        this.name = mountpoint;

        this.connectivityBasePollTime = connectivityBasePollTime;
        this.connectivityTimeout = connectivityTimeout;
        this.requestBaseTimeout = requestBaseTimeout;
        this.requestMaxAttempts = requestMaxAttempts;

        this.reducer = this._generateReducer();
        this.selectors = new OfflineRequestManagerSelectors({mountpoint});

        // The only reason we're putting the _nativeConnectivityEventChannel as a
        // property on the object is to more easily reference it during testing.
        this._nativeConnectivityEventChannel = this._generateNativeConnectivityEventChannel();

        this.processQueueSaga = this._generateProcessQueueSaga();
        this.connectivityCheckSaga = this._generateConnectivityCheckSaga();
    }

    /* Small wrapper around creating the enqueue action for third-parties to consume. */
    static enqueue(queueableEffect: Partial<QueueableEffect>) {
        return OfflineRequestManager.actions.enqueue(new QueueableEffect(queueableEffect));
    }

    _generateReducer() {
        const {actions} = OfflineRequestManager;

        return createReducer(this.initialState, (builder) =>
            builder
                .addCase(actions.enqueue, (state, action: PayloadAction<QueueableEffect>) => {
                    const {payload: effect} = action;

                    if (effect?.isFetchEffect) {
                        // Fetch effects always have to happen last, after all other queued effects.
                        // Additionally, fetch effects shouldn't be triggered multiple times, cause
                        // that's pointless.

                        // So first we check if there's any existing fetch effects of the same kind.
                        const existingEffect = Object.values(state.effectsById).find(
                            (x) => x.sliceId === effect.sliceId
                        );

                        if (!existingEffect) {
                            state.effectsById[effect.id] = effect;
                            state.fetchQueue.unshift(effect.id);
                        }
                    } else {
                        state.effectsById[effect.id] = effect;
                        state.queue.unshift(effect.id);
                    }
                })
                .addCase(actions.dequeue, (state) => {
                    let id: string | undefined = "";

                    if (state.queue.length > 0) {
                        id = state.queue.pop();
                    } else {
                        id = state.fetchQueue.pop();
                    }

                    if (id && id in state.effectsById) {
                        delete state.effectsById[id];
                    }
                })
                .addCase(actions.incrementAttempts, (state, action) => {
                    const {payload: id} = action;

                    if (id in state.effectsById) {
                        // Need to copy the effect object to not deep-mutate state.
                        const effectCopy = {...state.effectsById[id]};
                        effectCopy.attempts += 1;

                        state.effectsById[id] = effectCopy;
                    }
                })
                .addCase(actions.updateConnectivity, (state, action) => {
                    state.isOnline = action.payload;
                })
        );
    }

    _generateProcessQueueSaga() {
        const {actions} = OfflineRequestManager;
        const {selectors, requestBaseTimeout, requestMaxAttempts} = this;

        const queueProcessor = function* () {
            let effectFailed = false;

            // Loop as long as there are effects to process and no effect has failed.
            for (
                let headEffect = (yield select(selectors.selectQueueHead)) as QueueableEffect;
                headEffect && !effectFailed;
                headEffect = (yield select(selectors.selectQueueHead)) as QueueableEffect
            ) {
                const requestTimeout = exponentialBackoff(requestBaseTimeout, headEffect.attempts);

                // Start execution of the effect.
                yield put({...headEffect.actions.effectStart, payload: headEffect.payload});

                const {successfulEffect, failedEffect} = yield race({
                    successfulEffect: take(headEffect.actions.effectSuccess.type),
                    failedEffect: take(headEffect.actions.effectFailure.type),
                    timedOutEffect: delay(requestTimeout)
                });

                if (successfulEffect) {
                    // Remove the effect once it has successfully executed.
                    yield put(actions.dequeue());
                } else if (headEffect.attempts < requestMaxAttempts - 1) {
                    // Don't count network error failures against the attempt count.
                    if (!isNetworkError(failedEffect?.payload?.message || "")) {
                        // Attempt failed.
                        // Try again later.
                        yield put(actions.incrementAttempts(headEffect.id));
                    }

                    // Stop processing once an effect needs to be retried.
                    effectFailed = true;
                } else {
                    // Failed all attempts; time to rollback.
                    const error = failedEffect?.payload;

                    yield put({
                        ...headEffect.actions.rollbackStart,
                        payload: new RollbackPayload({...headEffect, error})
                    });

                    const {successfulRollback} = yield race({
                        successfulRollback: take(headEffect.actions.rollbackSuccess.type),
                        failedRollback: take(headEffect.actions.rollbackFailure.type),
                        timedOutRollback: delay(requestTimeout)
                    });

                    // Regardless of success, remove this effect from the queue
                    // so that we can stop dealing with it and move onto other effects.
                    yield put(actions.dequeue());

                    if (!successfulRollback) {
                        // I mean, what else are we going to do if a _rollback_ fails?!
                        // I would think a regular app would just crash, but we can't exactly do that...
                        // So all we can really do is hope that whatever mangled state the app is in
                        // can be restored by grabbing the latest data from the backend.
                        throw new Error("Failed to rollback; try refreshing.");
                    }
                }
            }
        };

        return function* () {
            while (true) {
                // Only allow one instance of the queue processor to be running at any one time.
                // That is, use 'take' over 'takeEvery'.
                // We also don't want 'takeLatest' since that could interrupt an already running process.
                yield take(actions.processQueue);
                yield call(queueProcessor);
            }
        };
    }

    _generateConnectivityCheckSaga() {
        const {actions} = OfflineRequestManager;

        const {
            selectors,
            connectivityBasePollTime,
            connectivityTimeout,
            _nativeConnectivityEventChannel,
            _checkConnectivity
        } = this;

        return function* () {
            let checkCounter = 0;

            while (true) {
                const backoffAmount = exponentialBackoff(connectivityBasePollTime, checkCounter);

                // Bound the number of checks to 7 so that the poll time schedule is:
                // 5, 10, 20, 40, 80, 160, 320, 5, 10 ...
                // These exponentially long poll times should be fine considering a
                // connectivity check happens every time a request happens; we bound
                // it so that the checks don't get _obscenely_ long.
                // We just don't want the app pinging the backend so frequently that
                // bandwidth/log pollution becomes a serious concern.
                checkCounter = (checkCounter + 1) % 7;

                // Wait for either the timeout to elapse, an effect to be queued,
                // or a native event signalling a connectivity change.
                const {nativeEvent} = yield race({
                    poll: delay(backoffAmount),
                    enqueue: take(actions.enqueue),
                    nativeEvent: take(_nativeConnectivityEventChannel)
                });

                if (nativeEvent === NativeConnectivityState.Offline) {
                    // Moved from online to offline.
                    yield put(actions.updateConnectivity(false));
                } else {
                    // Check if we actually have a connection to the backend.
                    // We use this check for whether or not we were previously online just to eliminate
                    // dispatching any redundant connectivity updates when we're offline.
                    // That is, we don't need to know that we're still offline, just that we've
                    // transitioned from one state to another or vice versa.
                    const wasPreviouslyOnline = yield select(selectors.selectIsOnline);
                    const queueLength = yield select(selectors.selectQueueLength);

                    try {
                        const {timeout} = yield race({
                            check: call(_checkConnectivity),
                            timeout: delay(connectivityTimeout)
                        });

                        if (!timeout && queueLength) {
                            if (!wasPreviouslyOnline) {
                                // This is kind of a hack... When a user refreshes the page while they're
                                // offline, the re-authentication will happen but fail. As a result,
                                // `api.settings.authentication` gets filled with a failed promise
                                // where the error is "Network error". However, this causes _all_
                                // service calls after the authentication to _also_ fail with this
                                // error.
                                //
                                // Why? IDK. But what I _do_ know is that deleting this piece of
                                // state and re-authenticating (once the user is online) fixes things.
                                //
                                // As far as I'm aware, this isn't documented anywhere but it took some
                                // real trial and error to figure out.
                                delete api.settings.authentication;
                                yield call(api.reAuthenticate);
                            }

                            // Is online and there are requests to execute.
                            // Yes, strictly speaking the 'processQueue' action is only fired when
                            // 'updateConnectivity(true)' is fired; as such, the processQueueSaga _could_
                            // just listen for 'updateConnectivity(true)' to trigger queue processing.
                            //
                            // However, I think having them separate leads to a more semantic system.
                            // Additionally, it easily allows us in the future to trigger queue processing
                            // arbitrarily instead of tying it into the connectivity updates.
                            yield put(actions.updateConnectivity(true));
                            yield put(actions.processQueue());
                        } else if (wasPreviouslyOnline && timeout) {
                            // Moved from online to offline.
                            yield put(actions.updateConnectivity(false));
                        }
                    } catch (_e) {
                        // Errors can result from the '_checkConnectivity' call failing.
                        if (wasPreviouslyOnline) {
                            // Moved from online to offline.
                            yield put(actions.updateConnectivity(false));
                        }
                    }
                }
            }
        };
    }

    /* This event channel allows us to monitor for changes 'window.navigator.onLine' value.
     * Note that this doesn't seem to work properly in all browsers, but for those that it does,
     * this event at least provides another way to know if we're connected to a network or not.
     */
    _generateNativeConnectivityEventChannel(): EventChannel<NativeConnectivityState> {
        return eventChannel((emitter) => {
            // This could be used in a React Native app in the future, which has
            // a separate API for detecting network connectivity status.
            //
            // Obviously, however, React Native doesn't use 'window' for event listeners,
            // so we have to make sure to only register these event listeners in a browser.
            if (window && window.addEventListener && window.navigator && window.navigator.onLine) {
                const emitOnline = () => emitter(NativeConnectivityState.Online);
                const emitOffline = () => emitter(NativeConnectivityState.Offline);

                window.addEventListener("online", emitOnline);
                window.addEventListener("offline", emitOffline);

                return () => {
                    window.removeEventListener("online", emitOnline);
                    window.removeEventListener("offline", emitOffline);
                };
            } else {
                // Have to return an 'unsubscribe' function from an event channel.
                return () => {};
            }
        });
    }

    /* The function used to check if the system should be considered 'online' or 'offline'.
     * All that matters from this function to indicate 'online' is that it returns anything.
     *
     * If it throws an error, then the system is considered 'offline'. */
    async _checkConnectivity() {
        const response = await fetch(BACKEND_HEALTHCHECK_ROUTE);

        if (!response.ok) {
            throw new Error("Network offline");
        }
    }
}

class OfflineRequestManagerSelectors {
    selectState: Selector<State, OfflineRequestManagerState>;
    selectEffectsById: Selector<State, Record<Id, QueueableEffect>>;
    selectIsOnline: Selector<State, boolean>;
    selectQueue: Selector<State, Array<Id>>;
    selectQueueLength: Selector<State, number>;
    selectQueueHead: Selector<State, QueueableEffect | null>;

    constructor({mountpoint}: {mountpoint: string}) {
        this.selectState = (state: State) => state?.[mountpoint];

        this.selectEffectsById = createSelector([this.selectState], (state) => state.effectsById);
        this.selectIsOnline = createSelector([this.selectState], (state) => state.isOnline);

        this.selectQueue = createSelector([this.selectState], (state) => [
            ...state.fetchQueue,
            ...state.queue
        ]);

        this.selectQueueLength = createSelector([this.selectQueue], (queue) => queue.length);

        this.selectQueueHead = createSelector(
            [this.selectQueue, this.selectEffectsById],
            (queue, effectsById) => {
                const id = queue[queue.length - 1];
                return id && id in effectsById ? effectsById[id] : null;
            }
        );
    }
}

/* This is the data structure that gets stored in the OfflineRequestManager's 'effectsById'. */
export class QueueableEffect {
    id: Id;
    attempts: number;
    payload: any;
    rollbackData: any;
    actions: SerializedOfflineRequestSliceActions;
    isFetchEffect: boolean;
    sliceId: string;

    constructor({
        id = uuidv4(),
        payload = {},
        rollbackData = {},
        actions,
        isFetchEffect = false,
        sliceId = ""
    }: Partial<QueueableEffect> = {}) {
        this.id = id;
        this.attempts = 0;

        this.payload = payload;
        this.rollbackData = rollbackData;

        // Need to make sure the actions aren't undefined; pass dummy actions in case they are.
        this.actions = actions || {
            effectStart: {
                type: ""
            },
            effectSuccess: {
                type: ""
            },
            effectFailure: {
                type: ""
            },
            rollbackStart: {
                type: ""
            },
            rollbackSuccess: {
                type: ""
            },
            rollbackFailure: {
                type: ""
            }
        };

        // Preventing duplicate queueing is relevant for effects like those that handle fetching
        // (see e.g. accounts' "fetchAll"). When there's a failed effect at the head of the queue,
        // we don't want things like multiple "fetch" effects to stack up since there's no point
        // in firing them multiple times in a row. As such, we can use this flag to prevent them
        // from being queued multiple times.
        //
        // Ths 'sliceId' is to help identify effects in the queue by which slice issued them.
        // Sure, this could have been done by checking the actions, but I figure it's more explicit
        // to just have a separate 'sliceId'. It isn't used for anything else.
        this.isFetchEffect = isFetchEffect;
        this.sliceId = sliceId;
    }
}

/* The data structure that is provided as the '{payload}' for rollback sagas
 * (i.e. sagas registered using an OfflineRequestSlice's "watchRollbackSaga" function). */
export class RollbackPayload<OriginalPayload = any, RollbackData = any> {
    originalPayload: OriginalPayload;
    rollbackData: RollbackData;
    error: ApiError;

    constructor({
        payload,
        rollbackData,
        error = {}
    }: {payload?: any; rollbackData?: any; error?: ApiError} = {}) {
        // Note that 'payload' gets rewritten to 'originalPayload'.
        // The constructor uses 'payload' just so a QueueableEffect object can be passed in.
        this.originalPayload = payload;
        this.rollbackData = rollbackData;
        this.error = error;
    }
}

const createOfflineRequestManager = (mountpoint: string, options: GenericObject = {}) =>
    new OfflineRequestManager({mountpoint, ...options});

export default createOfflineRequestManager;
