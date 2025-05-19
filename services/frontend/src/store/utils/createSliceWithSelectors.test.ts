import createSliceWithSelectors from "./createSliceWithSelectors";

const initialState = {};

describe("createSliceWithSelectors", () => {
    const slice = createSliceWithSelectors({
        name: "test",
        initialState,
        reducers: {
            set: (_state, action) => action.payload
        },
        selectors: {
            get: (state: any) => state
        }
    });

    describe("actions", () => {
        it("has the declared actions", () => {
            expect("set" in slice.actions).toBe(true);
        });
    });

    describe("reducer", () => {
        const {reducer} = slice;

        it("works", () => {
            const newState = reducer(initialState, {
                ...slice.actions.set({stuff: "thing"})
            });

            expect(newState).toEqual({stuff: "thing"});
        });

        it("ignores actions that have errors", () => {
            const newState = reducer(initialState, {
                ...slice.actions.set({message: "error"}),
                error: true
            });

            expect(newState).toEqual(initialState);
        });
    });

    describe("selectors", () => {
        it("has the declared selectors", () => {
            expect("get" in slice.selectors).toBe(true);
        });
    });
});
