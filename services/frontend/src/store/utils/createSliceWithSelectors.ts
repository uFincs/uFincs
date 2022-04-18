import {
    createSlice,
    CreateSliceOptions,
    Reducer,
    Selector,
    Slice,
    SliceCaseReducers
} from "@reduxjs/toolkit";
import {State} from "store/types";

type ParameterizedSelector = (...args: Array<any>) => Selector<State, any>;
type SelectorWithProps = (state: State, props: any) => any;
type SliceSelector = Selector<State, any> | SelectorWithProps | ParameterizedSelector;

type SliceSelectors = Record<string, SliceSelector>;

// This just extends the @reduxjs/toolkit Slice type and adds on a `selectors` property, like it used to have.
interface SliceWithSelectors<
    SliceState = any,
    CaseReducers extends SliceCaseReducers<SliceState> = SliceCaseReducers<SliceState>,
    Name extends string = string,
    Selectors extends SliceSelectors = SliceSelectors
> extends Slice<SliceState, CaseReducers, Name> {
    selectors: {
        [K in keyof Selectors]: Selectors[K];
    };
}

// This extends the @reduxjs/toolkit CreateSliceOptions type and adds on a `selectors` property,
// so that we can create our 'slice with selectors' using a single options object.
interface CreateSliceWithSelectorsOptions<
    SliceState = any,
    CaseReducers extends SliceCaseReducers<SliceState> = SliceCaseReducers<SliceState>,
    Name extends string = string,
    Selectors extends SliceSelectors = SliceSelectors
> extends CreateSliceOptions<SliceState, CaseReducers, Name> {
    selectors: Selectors;
}

// Brings back the 'selectors' that were removed from Slice objects in redux-starter-kit 0.7.0.
const createSliceWithSelectors = <
    SliceState = State,
    CaseReducers extends SliceCaseReducers<SliceState> = SliceCaseReducers<SliceState>,
    Name extends string = string,
    Selectors extends SliceSelectors = SliceSelectors
>(
    sliceOptions: CreateSliceWithSelectorsOptions<SliceState, CaseReducers, Name, Selectors>
): SliceWithSelectors<SliceState, CaseReducers, Name, Selectors> => {
    const slice = createSlice<SliceState, CaseReducers, Name>(sliceOptions);
    const {reducer} = slice;

    const reducerThatIgnoresErrors: Reducer<SliceState> = (state, action) => {
        // Whenever an action has an error, we want to ignore it at the reducer level.
        // All of these error actions should be handled up at a higher level (e.g. saga level),
        // but we don't want their error payloads to pollute the store state.
        if (action?.error) {
            return state as SliceState;
        } else {
            return reducer(state, action);
        }
    };

    slice.reducer = reducerThatIgnoresErrors;

    return {
        ...slice,
        selectors: sliceOptions.selectors
    };
};

export default createSliceWithSelectors;
