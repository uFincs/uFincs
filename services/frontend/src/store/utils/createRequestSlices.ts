import {
    createAction,
    createReducer,
    createSelector,
    ActionCreatorWithOptionalPayload,
    PayloadAction,
    PayloadActionCreator,
    Reducer,
    Selector,
    AnyAction
} from "@reduxjs/toolkit";
import {Action} from "redux";
import {Saga} from "redux-saga";
import {call, put, take, takeLatest, takeEvery, race} from "redux-saga/effects";
import {State} from "store/types";
import {objectifyError} from "./objectifyError";
import {buildRouterResetReducers} from "./reducerFactories";
import {routerActionTypes} from "./routerUtils";

export type MountPoint = string;
export type RequestType = string;

export interface RequestSliceConstructor {
    mountpoint: MountPoint;
    requestType: RequestType;
}

export interface RequestError {
    message: string;
    [key: string]: any;
}

export interface RequestSliceState {
    loading: boolean;
    error: RequestError | null;
}

type RequestSaga<PayloadType extends any = any> = (
    action: PayloadAction<PayloadType>,
    success: Saga
) => Generator;

interface WatchRequestSagaOptions {
    routeChangeCancellable?: boolean;
    processEvery?: boolean;
}

type WatchRequestSaga = (saga: RequestSaga, options?: WatchRequestSagaOptions) => () => Generator;

/*  Why this file exists:
 *
 *      In the general case, managing async requests usually requires at least
 *      3 states: 'request started', 'request succeeded', and 'request failed'.
 *      'clear' is used to reset the state back to its default values for situations
 *      other than 'request succeeded' eg. 'request cancelled'.
 *
 *      In terms of actual data, these 3 states usually mean that a 'loading' variable
 *      and an 'error' variable need to be stored somewhere for the UI to react to.
 *      This 'state' is either usually stored in Redux or in local React component state.
 *
 *      Since we want to be able to model the high-level state all in Redux land
 *      (so that it is independent of the view layer), then we need to specifically
 *      manage 'request state' in Redux.
 *
 *      Following from this, it makes sense that since we'll likely have many requests,
 *      we'll need a common pattern to encapsulate the async request flow, otherwise
 *      there'll be a hundred and one slightly different implementations of how to call the API.
 *
 *      To that end, this file has a 'request slice' factory takes in a 'requestType' string
 *      and creates a set of actions, reducers, and selectors that are all consistently
 *      named based on that 'requestType' string.
 *
 *      However, we also need to manage the transitions between each of the request's states.
 *      This is what the 'request saga' is for: it delegates the actual request logic
 *      to another saga that can be bound after the creation of the 'request slice', but it augments
 *      the request logic with handling of the 'success' and 'failed' states. This way, the
 *      actual request logic is kept as simple as possible, and code duplication is minimized.
 *
 *      As such, only the `request` action is ever dispatched by the 'end user'
 *      (i.e. a React component).
 */

export class RequestSlice {
    name: string;
    actions: RequestSliceActions;
    reducer: Reducer<RequestSliceState, AnyAction>;
    selectors: RequestSliceSelectors;
    watchRequestSaga: WatchRequestSaga;

    initialState: RequestSliceState = {loading: false, error: null};

    /*  Creates a request slice with all of the actions, reducer, selectors, and saga wrapper
     *  necessary to model the state and make use of a single async request in Redux.
     *
     *  @param {string} mountpoint      Where the slice gets mounted in the Redux store
     *  @param {string} requestType     The type of request being performed by this request slice
     *
     *  The request slice has the following interface:
     *
     *      {
     *          name: "${requestType}",
     *          reducer: (state, action) => state,
     *          actions: {
     *              `request`: (payload) => action,
     *              `success`: () => action,
     *              `failure`: (error) => action,
     *              `clear`: () => action
     *          },
     *          selectors: {
     *              selectState: (state) => state,
     *              selectLoading: (state) => state.loading,
     *              selectError: (state) => state.error
     *          },
     *          watchRequestSaga: (saga) => saga
     *      }
     */
    constructor({mountpoint, requestType}: RequestSliceConstructor) {
        this.name = mountpoint;
        this.actions = new RequestSliceActions({mountpoint, requestType});
        this.reducer = this._generateReducer(this.actions);
        this.selectors = new RequestSliceSelectors({mountpoint, requestType});
        this.watchRequestSaga = this._generateWatchRequestSaga(this.actions);
    }

    _generateReducer(actions: RequestSliceActions) {
        return createReducer(this.initialState, (builder) =>
            // Reset request state whenever the route changes.
            buildRouterResetReducers<RequestSliceState>(builder, this.initialState)
                .addCase(actions.request, (state) => {
                    state.loading = true;
                    state.error = null;
                })
                .addCase(actions.success, () => this.initialState)
                .addCase(actions.failure, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                })
                .addCase(actions.clear, () => this.initialState)
        );
    }

    _generateWatchRequestSaga(actions: RequestSliceActions): WatchRequestSaga {
        const requestSaga = this._generateRequestSaga(actions);

        // This is just the 'watch' runner for the requestSaga.
        // It takes in and wraps the saga that actually performs the request logic.
        // It can be used by forking; e.g. `yield fork(requestSlice.watchRequestSaga(saga))`.
        return <PayloadType>(
            saga: RequestSaga<PayloadType>,
            {
                routeChangeCancellable = false,
                processEvery = true
            }: Partial<WatchRequestSagaOptions> = {}
        ) =>
            function* () {
                const effect = processEvery ? takeEvery : takeLatest;

                yield effect(
                    actions.request,
                    requestSaga<PayloadType>(saga, routeChangeCancellable)
                );
            };
    }

    _generateRequestSaga(actions: RequestSliceActions) {
        // This requestSaga is used to wrap the saga that'll be performing the async request(s)
        // or other side effects for this particular request slice.
        //
        // It handles try/catching any errors, and dispatching success/failure actions as necessary,
        // so that the wrapped saga only has to concern itself with the core logic of handling the
        // async request(s)/side effects.
        //
        // Note that unlike regular sagas, wrapped request sagas are passed an extra parameter: `success`.
        // The `success` function can be (but does not have to be) invoked by the saga to indicate that the
        // async request/side effect has been completed successfully, before going on and doing other actions.
        //
        // If the `success` function is not invoked, it will be invoked automatically at the completion
        // of the wrapped saga, assuming no errors were thrown.
        return <PayloadType>(
            saga: RequestSaga<PayloadType>,
            routeChangeCancellable: boolean = false
        ) =>
            function* (action: PayloadAction<PayloadType>) {
                let successCalled = false;

                const success = function* () {
                    successCalled = true;
                    yield put(actions.success());
                };

                try {
                    if (routeChangeCancellable) {
                        yield race({
                            request: call(saga, action, success),
                            cancel: take(routerActionTypes) // Cancel the request whenever the user navigates away
                        });
                    } else {
                        yield call(saga, action, success);
                    }

                    // Call success if the saga didn't already invoke it
                    if (!successCalled) {
                        yield call(success);
                    }

                    // Reset the flag for the next request
                    successCalled = false; // eslint-disable-line require-atomic-updates
                } catch (e) {
                    yield put(actions.failure(objectifyError(e)));
                }
            };
    }
}

export class RequestSliceActions {
    baseActionType: string;
    request: ActionCreatorWithOptionalPayload<any>;
    success: PayloadActionCreator<void>;
    failure: PayloadActionCreator<RequestError>;
    clear: PayloadActionCreator<void>;

    static baseActionTypeRegex = /\w*\/\w*\//;

    constructor({mountpoint, requestType}: RequestSliceConstructor) {
        this.baseActionType = `${mountpoint}/${requestType}`;

        this.request = createAction<any>(`${this.baseActionType}/request`);
        this.success = createAction<void>(`${this.baseActionType}/success`);
        this.failure = createAction<RequestError>(`${this.baseActionType}/failure`);
        this.clear = createAction<void>(`${this.baseActionType}/clear`);
    }

    static isAction(action: Action<any>): boolean {
        return RequestSliceActions.baseActionTypeRegex.test(action.type);
    }

    static isRequestAction(action: Action<any>): boolean {
        return RequestSliceActions._isTypeAction(action, "request");
    }

    static isSuccessAction(action: Action<any>): boolean {
        return RequestSliceActions._isTypeAction(action, "success");
    }

    static isFailureAction(action: Action<any>): boolean {
        return RequestSliceActions._isTypeAction(action, "failure");
    }

    static isClearAction(action: Action<any>): boolean {
        return RequestSliceActions._isTypeAction(action, "clear");
    }

    static _isTypeAction(action: Action<any>, type: string): boolean {
        return RegExp(RequestSliceActions.baseActionTypeRegex.source + type).test(action.type);
    }
}

export class RequestSliceSelectors {
    selectState: Selector<State, RequestSliceState>;
    selectLoading: Selector<State, boolean>;
    selectError: Selector<State, RequestError | null>;
    selectErrorMessage: Selector<State, string>;

    constructor({mountpoint, requestType}: RequestSliceConstructor) {
        this.selectState = (state: State): RequestSliceState => state?.[mountpoint]?.[requestType];

        this.selectLoading = createSelector(
            [this.selectState],
            (state: RequestSliceState) => state.loading
        );

        this.selectError = createSelector(
            [this.selectState],
            (state: RequestSliceState) => state.error
        );

        this.selectErrorMessage = createSelector([this.selectState], (state: RequestSliceState) =>
            state.error && state.error?.message ? state.error?.message : ""
        );
    }
}

export type RequestSliceSetState<T extends RequestType> = {
    [K in T]: RequestSliceState;
};

export type RequestSliceSet<T extends RequestType, RS extends RequestSlice> = {
    name: string;
    reducer: Reducer<RequestSliceSetState<T>, AnyAction>;
} & {
    // This is what allows us to have typed dynamic properties on the final object.
    // I'm not quite sure where this 'K in T' syntax is documented, but I came across it here:
    // https://github.com/microsoft/TypeScript/issues/20965#issuecomment-370114910
    //
    // Basically, in order for this to work, we have to define a generic on the function
    // (here, `createRequestSlices`), an array of that generic as an argument
    // (here, `requestTypes`), and then pass the generic to a type that can use it for indexing
    // (here, `RequestSliceSet`).
    //
    // Along with some forced type conversions with `as` to make sure generic objects
    // are typed as `RequestSliceSet`, this allows to return an object where TypeScript
    // knows which properties are on it based on what was passed to `requestTypes`.
    // As a result, it will warn when trying to access a request type that doesn't exist.
    //
    // Note that the `RequestSliceSetState` uses this same trick to ensure that the
    // resulting state is also keyed correctly.
    [K in T]: RS;
};

const createRequestSlices = <T extends RequestType>(
    mountpoint: MountPoint,
    requestTypes: Array<T>
): RequestSliceSet<T, RequestSlice> => {
    const requestSlices = requestTypes.reduce<Record<RequestType, RequestSlice>>(
        (acc, requestType) => {
            acc[requestType] = new RequestSlice({mountpoint, requestType});
            return acc;
        },
        {}
    );

    const requestsReducer = generateRequestsReducer(requestTypes, requestSlices);

    return {
        name: mountpoint,
        reducer: requestsReducer,
        ...requestSlices
    } as RequestSliceSet<T, RequestSlice>;
};

export const generateRequestsReducer =
    <T extends RequestType>(requestTypes: Array<T>, requestSlices: Record<T, RequestSlice>) =>
    (state: RequestSliceSetState<T> = {} as RequestSliceSetState<T>, action: AnyAction) => {
        action = cleanApiError(action);

        return requestTypes.reduce(
            (acc, requestType) => {
                acc[requestType] = requestSlices[requestType].reducer(acc[requestType], action);
                return acc;
            },
            {...state}
        );
    };

const cleanApiError = (action: AnyAction) => {
    // I don't know if this was always here, but it seems like the `hook` property
    // on an API error has a bunch of functions in it -- which aren't serializable
    // to the store. I know they aren't serializable because Immer throws an error
    // when trying to do anything with it.
    //
    // As such, since we don't need anything in the `hook` property, we can just
    // throw it out.
    if (action?.payload?.hook) {
        action.payload.hook = undefined;
    }

    return action;
};

export default createRequestSlices;
