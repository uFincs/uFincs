import {ActionReducerMapBuilder, PayloadAction, CaseReducer} from "@reduxjs/toolkit";
import {PayloadObject, State} from "store/types";
import {Id} from "utils/types";
import {routerActionTypes, RouteChangePayload} from "./routerUtils";

interface CrudCaseReducers<S extends State, O extends PayloadObject> {
    set: CaseReducer<S, PayloadAction<S>>;
    add: CaseReducer<S, PayloadAction<O>>;
    addMany: CaseReducer<S, PayloadAction<Array<O>>>;
    delete: CaseReducer<S, PayloadAction<Id>>;
    update: CaseReducer<S, PayloadAction<O>>;
}

/* Creates a set of case reducers for use with something
 * like redux-toolkit's 'createReducer' or 'createSlice'.
 *
 * Should be used for slices that use an indexed state; that is,
 * whose initial state is an empty object, and whose indexed objects
 * have an ID property.
 */
export const crudSliceReducerFactory = <
    S extends State,
    O extends PayloadObject
>(): CrudCaseReducers<S, O> => ({
    set: (_state, action) => action.payload,
    add: (state, action) => {
        // Expects an object with an ID as payload.
        state[action.payload.id] = action.payload;
    },
    addMany: (state, action) => {
        // Expects an array of objects with IDs as payload.
        action.payload.forEach((sliceObject) => {
            state[sliceObject.id] = sliceObject;
        });
    },
    delete: (state, action) => {
        // Expects an ID as payload.
        delete state[action.payload];
    },
    update: (state, action) => {
        // Expects an object with an ID as payload.
        state[action.payload.id] = action.payload;
    }
});

/* Creates a set of case reducers based on the actions that are used
 * by connected-react-router so that a reducer's state can be reset
 * whenever the user navigates (i.e. changes the page).
 *
 * Useful for things like forms or request slices.
 */
export const routerResetCaseReducers = <S>(
    initialState: S,
    urlIgnoreList?: Array<string>
): Record<string, (state: S, action: PayloadAction<RouteChangePayload>) => S> =>
    routerActionTypes.reduce<
        Record<string, (state: S, action: PayloadAction<RouteChangePayload>) => S>
    >((acc, actionType) => {
        acc[actionType] = (state, action) => {
            const currentUrl = action?.payload?.location?.pathname || action?.payload?.args?.[0];
            const isIgnoredUrl = urlIgnoreList?.some((url) => currentUrl?.includes(url));

            return isIgnoredUrl ? state : initialState;
        };

        return acc;
    }, {});

/* Uses the 'builder' interface to generate a set of type safe case reducers.
 * For reference, https://redux-toolkit.js.org/usage/usage-with-typescript#building-type-safe-reducer-argument-objects.
 */
export const buildRouterResetReducers = <S>(builder: ActionReducerMapBuilder<S>, initialState: S) =>
    routerActionTypes.reduce<ActionReducerMapBuilder<S>>(
        (acc, actionType) => acc.addCase(actionType, () => initialState),
        builder
    );
