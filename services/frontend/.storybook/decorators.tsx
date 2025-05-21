import {action as storybookAction} from "@storybook/addon-actions";
import {ConnectedRouter} from "connected-react-router";
import * as React from "react";
import {Provider} from "react-redux";
import {MemoryRouter, Route} from "react-router-dom";
import configureStore, {history} from "../src/store";

/** Custom store enhancer for logging all actions as Storybook 'actions'. */
const storybookEnhancer = (createStore) => (reducer, initialState, enhancer) => {
    const storybookReducer = (state, action) => {
        storybookAction(action.type)(action.payload);
        return reducer(state, action);
    };

    return createStore(storybookReducer, initialState, enhancer);
};

const {store} = configureStore(storybookEnhancer);

export const withConnectedRouter = (story) => (
    <ConnectedRouter history={history}>{story()}</ConnectedRouter>
);

export const withStore = (story) => <Provider store={store}>{story()}</Provider>;

export const withRouter = (story: any) => (
    <MemoryRouter>
        <Route render={story} />
    </MemoryRouter>
);
