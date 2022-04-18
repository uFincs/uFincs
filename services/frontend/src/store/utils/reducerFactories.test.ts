import {createSlice} from "@reduxjs/toolkit";
import {LOCATION_CHANGE} from "connected-react-router";
import {crudSliceReducerFactory, routerResetCaseReducers} from "./reducerFactories";
import {routerActionTypes} from "./routerUtils";

describe("crudSliceReducerFactory", () => {
    const initialState = {};

    const reducers = crudSliceReducerFactory();

    const slice = createSlice({
        name: "Account",
        initialState,
        reducers: {...reducers}
    });

    const {actions, reducer} = slice;

    it("creates a set of case reducers based on a name", () => {
        expect(reducers.set).toBeDefined();
        expect(reducers.add).toBeDefined();
        expect(reducers.addMany).toBeDefined();
        expect(reducers.delete).toBeDefined();
        expect(reducers.update).toBeDefined();
    });

    it("has a reducer for setting the entire state", () => {
        const newState = {a: 1, b: 2};
        const action = actions.set(newState);

        expect(reducer(initialState, action)).toEqual(newState);
        expect(reducer(newState, action)).toEqual(newState);
    });

    it("has a reducer for adding a single object", () => {
        const newObject = {id: "a", b: 1};
        const newState = {a: newObject};

        const action = actions.add(newObject);

        expect(reducer(initialState, action)).toEqual(newState);
        expect(reducer(newState, action)).toEqual(newState);
    });

    it("has a reducer for adding a set of objects", () => {
        const newObjects = [
            {id: "a", b: 1},
            {id: "b", b: 2}
        ];
        const newState = {a: newObjects[0], b: newObjects[1]};

        const action = actions.addMany(newObjects);

        expect(reducer(initialState, action)).toEqual(newState);
        expect(reducer(newState, action)).toEqual(newState);
    });

    it("has a reducer for removing an object", () => {
        const newObject = {id: "a", b: 1};
        const state = {a: newObject};

        const action = actions.delete(newObject.id);

        expect(reducer(initialState, action)).toEqual(initialState);
        expect(reducer(state, action)).toEqual(initialState);
    });

    it("has a reducer for updating an object", () => {
        const newObject = {id: "a", b: 1};
        const state = {a: newObject};

        const updatedObject = {...newObject, b: 2};
        const updatedState = {a: updatedObject};

        const action = actions.update(updatedObject);

        expect(reducer(initialState, action)).toEqual(updatedState);
        expect(reducer(state, action)).toEqual(updatedState);
    });
});

describe("routerResetCaseReducers", () => {
    const initialState = {};
    const notInitialState = {a: 1, b: 2};

    const reducers = routerResetCaseReducers(initialState);

    const {reducer} = createSlice({
        name: "Account",
        initialState,
        reducers: {},
        extraReducers: reducers
    });

    it("creates a set of reducers with all of the router actions", () => {
        for (const type of routerActionTypes) {
            expect(reducers[type]).toBeDefined();
        }
    });

    it("resets the state to the initial state when it receives a router action", () => {
        for (const type of routerActionTypes) {
            const action = {type};
            expect(reducer(notInitialState, action)).toEqual(initialState);
        }
    });

    it("doesn't reset the state when navigating to a URL on the ignore list", () => {
        // This really only applies to the LOCATION_CHANGE action, since it has the location payload.
        const createAction = (pathname: string) => ({
            type: LOCATION_CHANGE,
            payload: {
                location: {
                    pathname
                }
            }
        });

        const {reducer} = createSlice({
            name: "Account",
            initialState,
            reducers: {},
            extraReducers: routerResetCaseReducers(initialState, ["/test"])
        });

        expect(reducer(notInitialState, createAction("/test/hello"))).toEqual(notInitialState);
        expect(reducer(notInitialState, createAction("/tes"))).toEqual(initialState);
    });
});
