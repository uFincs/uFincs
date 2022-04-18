import {createAction, PayloadAction, ActionCreatorWithPreparedPayload} from "@reduxjs/toolkit";
import {Saga} from "redux-saga";
import {call, put, takeLatest, takeEvery} from "redux-saga/effects";
import {ApiError} from "api/";
import {OfflineRequestManager, RollbackPayload} from "./createOfflineRequestManager";
import {
    generateRequestsReducer,
    RequestSlice,
    MountPoint,
    RequestError,
    RequestSliceConstructor,
    RequestSliceActions,
    RequestSliceSet,
    RequestType
} from "./createRequestSlices";
import {objectifyError} from "./objectifyError";

type OfflineRequestSaga<PayloadType = any> = (
    action: PayloadAction<PayloadType>,
    Success?: Saga
) => Generator;

type ActionMeta = Record<string, string>;

interface ActionMetaTags {
    effectStart?: ActionMeta;
    effectSuccess?: ActionMeta;
    effectFailure?: ActionMeta;
    rollbackStart?: ActionMeta;
    rollbackSuccess?: ActionMeta;
    rollbackFailure?: ActionMeta;
}

interface OfflineRequestSliceConstructor extends RequestSliceConstructor {
    actionMetaTags?: ActionMetaTags;
}

interface WatchSagaOptions {
    processEvery?: boolean;
    isFetchEffect?: boolean;
}

type WatchSaga = (
    saga?: OfflineRequestSaga | undefined,
    options?: WatchSagaOptions
) => () => Generator;

class OfflineRequestSlice extends RequestSlice {
    actions: OfflineRequestSliceActions;

    watchCommitSaga: WatchSaga;
    watchEffectSaga: WatchSaga;
    watchRollbackSaga: WatchSaga;

    constructor({mountpoint, requestType, actionMetaTags}: OfflineRequestSliceConstructor) {
        super({mountpoint, requestType});

        // Replace the RequestSliceActions with the custom OfflineRequestSliceActions.
        this.actions = new OfflineRequestSliceActions({mountpoint, requestType, actionMetaTags});

        // Create the new watch sagas for the three phases: commit, effect, and rollback.
        this.watchCommitSaga = this._generateWatchCommitSaga(this.actions);
        this.watchEffectSaga = this._generateWatchEffectSaga(this.actions);
        this.watchRollbackSaga = this._generateWatchRollbackSaga(this.actions);
    }

    _generateWatchCommitSaga(actions: OfflineRequestSliceActions) {
        const commitSagaWrapper = (
            saga: OfflineRequestSaga | undefined = undefined,
            isFetchEffect: boolean = false
        ) =>
            function* (action: PayloadAction<any>) {
                // Allows registering the commit wrapper without a saga.
                // This is used for enabling requests that have an effect but no commit
                // (e.g. a request that fetches data first).
                if (!saga) {
                    yield put(
                        OfflineRequestManager.enqueue({
                            payload: action.payload,
                            rollbackData: null,
                            actions: actions.getEffectAndRollbackActions(),
                            isFetchEffect,
                            sliceId: actions.baseActionType
                        })
                    );

                    yield put(actions.success());
                } else {
                    let successCalled = false;

                    const success = function* () {
                        successCalled = true;
                        yield put(actions.success());
                    };

                    try {
                        // The commit saga can either return nothing, the payload,
                        // or the payload and rollback data.
                        const result = yield call(saga, action, success);
                        let payload,
                            rollbackData = null;

                        if (!result) {
                            // If the saga returns nothing, assume the payload wasn't
                            // processed in any way and just use the raw action payload.
                            payload = action.payload;
                        } else {
                            // If the saga returned an object containing the 'payload' key,
                            // take that as the payload; otherwise, take the whole return
                            // value as the payload.
                            payload = result?.payload ? result.payload : result;

                            // Finally, if the saga returned rollback data (data that the
                            // rollback saga would need to properly rollback the state) as
                            // a key in an object, make sure to take it.
                            //
                            // Otherwise, the rollback data is just the same as the payload.
                            rollbackData = result?.rollbackData ? result.rollbackData : payload;
                        }

                        yield put(
                            OfflineRequestManager.enqueue({
                                payload,
                                rollbackData,
                                actions: actions.getEffectAndRollbackActions(),
                                isFetchEffect,
                                sliceId: actions.baseActionType
                            })
                        );

                        // Call success if the saga didn't already invoke it
                        if (!successCalled) {
                            yield call(success);
                        }

                        // Reset the flag for the next request
                        successCalled = false; // eslint-disable-line require-atomic-updates
                    } catch (e) {
                        yield put(actions.failure(objectifyError(e)));
                    }
                }
            };

        return this._generateWatchSagaWrapper(actions.request.type, commitSagaWrapper);
    }

    _generateWatchEffectSaga(actions: OfflineRequestSliceActions) {
        const effectSagaWrapper = (saga: OfflineRequestSaga) =>
            function* (action: PayloadAction<any, string, never, boolean>) {
                if (!saga) {
                    return;
                }

                if (action.error) {
                    // Remember, by convention for FSA, the payload is the error object when error is set.
                    // For reference: https://github.com/redux-utilities/flux-standard-action#error.
                    yield put(actions.effectFailure(action.payload));
                    return;
                }

                try {
                    yield call(saga, action);
                    yield put(actions.effectSuccess());
                } catch (e) {
                    yield put(actions.effectFailure(objectifyError(e)));
                }
            };

        return this._generateWatchSagaWrapper(actions.effectStart.type, effectSagaWrapper);
    }

    _generateWatchRollbackSaga(actions: OfflineRequestSliceActions) {
        const rollbackSagaWrapper = (saga: OfflineRequestSaga | undefined) =>
            function* (action: PayloadAction<any>) {
                // The wrapped saga will receive one argument (the action) which looks like this:
                //  {
                //      type: "",
                //      payload: {
                //          originalPayload,
                //          rollbackData,
                //          error
                //      }
                //  }
                //
                //  `originalPayload` and `rollbackData` are values returned from the effect saga.
                //  `error` is the error object generated by the effect saga (after it has failed all retries).

                if (!saga) {
                    return;
                }

                try {
                    yield call(saga, action);
                    yield put(actions.rollbackSuccess());
                } catch (e) {
                    yield put(actions.rollbackFailure(objectifyError(e)));
                }
            };

        return this._generateWatchSagaWrapper(actions.rollbackStart.type, rollbackSagaWrapper);
    }

    _generateWatchSagaWrapper(actionToWatch: string, sagaWrapper: Function): WatchSaga {
        return (
            saga: OfflineRequestSaga | undefined = undefined,
            {processEvery = true, isFetchEffect = false}: Partial<WatchSagaOptions> = {}
        ) =>
            function* () {
                const effect = processEvery ? takeEvery : takeLatest;
                yield effect(actionToWatch, sagaWrapper(saga, isFetchEffect));
            };
    }
}

interface SerializedAction {
    type: string;
    meta?: {[key: string]: string};
}

export interface SerializedOfflineRequestSliceActions {
    effectStart: SerializedAction;
    effectSuccess: SerializedAction;
    effectFailure: SerializedAction;
    rollbackStart: SerializedAction;
    rollbackSuccess: SerializedAction;
    rollbackFailure: SerializedAction;
}

export class OfflineRequestSliceActions extends RequestSliceActions {
    effectStart: ActionCreatorWithPreparedPayload<any, any, string, boolean, any>;
    effectSuccess: ActionCreatorWithPreparedPayload<never, void, string, boolean, any>;
    effectFailure: ActionCreatorWithPreparedPayload<
        any,
        ApiError | RequestError,
        string,
        boolean,
        any
    >;

    rollbackStart: ActionCreatorWithPreparedPayload<any, RollbackPayload, string, boolean, any>;
    rollbackSuccess: ActionCreatorWithPreparedPayload<never, void, string, boolean, any>;
    rollbackFailure: ActionCreatorWithPreparedPayload<
        any,
        ApiError | RequestError,
        string,
        boolean,
        any
    >;

    constructor({mountpoint, requestType, actionMetaTags}: OfflineRequestSliceConstructor) {
        super({mountpoint, requestType});

        // Effect actions
        this.effectStart = createAction(`${this.baseActionType}/effect/start`, (payload) => ({
            payload,
            meta: actionMetaTags?.effectStart
        }));

        this.effectSuccess = createAction(`${this.baseActionType}/effect/success`, () => ({
            payload: undefined,
            meta: actionMetaTags?.effectSuccess
        }));

        this.effectFailure = createAction(`${this.baseActionType}/effect/failure`, (payload) => ({
            payload,
            meta: actionMetaTags?.effectFailure
        }));

        // Rollback actions
        this.rollbackStart = createAction(`${this.baseActionType}/rollback/start`, (payload) => ({
            payload,
            meta: actionMetaTags?.rollbackStart
        }));

        this.rollbackSuccess = createAction(`${this.baseActionType}/rollback/success`, () => ({
            payload: undefined,
            meta: actionMetaTags?.rollbackSuccess
        }));

        this.rollbackFailure = createAction(
            `${this.baseActionType}/rollback/failure`,
            (payload) => ({
                payload,
                meta: actionMetaTags?.rollbackFailure
            })
        );
    }

    getEffectAndRollbackActions(): SerializedOfflineRequestSliceActions {
        // Need to make the actions concrete since we can't exactly go passing
        // action creators (i.e. functions) around as action payloads.
        return {
            effectStart: this.effectStart(),
            effectSuccess: this.effectSuccess(),
            effectFailure: this.effectFailure({}),
            rollbackStart: this.rollbackStart({
                rollbackData: null,
                originalPayload: null,
                error: {}
            }),
            rollbackSuccess: this.rollbackSuccess(),
            rollbackFailure: this.rollbackFailure({})
        };
    }
}

const createOfflineRequestSlices = <T extends RequestType>(
    mountpoint: MountPoint,
    requestTypes: Array<T>,
    requestMetaTags?: Record<T, ActionMetaTags>
) => {
    const requestSlices = requestTypes.reduce<Record<RequestType, OfflineRequestSlice>>(
        (acc, requestType) => {
            acc[requestType] = new OfflineRequestSlice({
                mountpoint,
                requestType,
                actionMetaTags: requestMetaTags?.[requestType]
            });
            return acc;
        },
        {}
    );

    const requestsReducer = generateRequestsReducer(requestTypes, requestSlices);

    return {
        name: mountpoint,
        reducer: requestsReducer,
        ...requestSlices
    } as RequestSliceSet<T, OfflineRequestSlice>;
};

export default createOfflineRequestSlices;
