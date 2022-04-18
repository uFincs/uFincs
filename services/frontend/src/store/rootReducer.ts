import {connectRouter} from "connected-react-router";
import {History} from "history";
import {combineReducers, AnyAction, Reducer, CombinedState} from "redux";
import mounts from "./mountpoints";
import {slices} from "./slices";
import {State} from "./types";

const createRootReducer = (history: History) => {
    const reducers: Record<string, Reducer<State, AnyAction>> = (
        Object.keys(slices) as Array<keyof typeof slices>
    ).reduce<Record<string, Reducer<any, AnyAction>>>(
        (acc, key) => {
            const {name: mountpoint, reducer} = slices[key];
            acc[mountpoint] = reducer;

            return acc;
        },
        {
            [mounts.router]: connectRouter(history)
        } as any
    );

    const appReducer = combineReducers(reducers);

    const rootReducer = (state: CombinedState<State> | undefined, action: AnyAction) => {
        // Reset all store state (except for the router) when user logs in or out.
        // or the explicit RESET_STATE action is received.
        //
        // Note: We _must_ listen for the `success` state of the auth requests.
        //
        // We previously listened for `request`, but that ended up causing some _weird_ shit to happen.
        // Primarily, it seemed like clearing the state before a logout operation happened
        // (that is, before the user was redirected out of the app) would cause some really weird edge cases.
        //
        // In particular, when going to the Transactions page and changing the date range to 'All Time',
        // trying to log out would cause the app to basically blow up (it would freeze, the API logout
        // command would neither return nor error (!!), and the user would be left in the app).
        //
        // Moreover, it seems like there needed to be a critical mass of data for this to happen;
        // the bug would happen when testing against a production backup, but not with the normal
        // seeded data.
        //
        // I can only assume that the entire app (hooks and selectors) was trying to re-calculate
        // everything after the state clear and would just crash. I don't know what else it could be.
        //
        // That's what it took for me to realize that we needed to listen for `success` and not `request`.
        // I mean, it just makes sense, in hindsight.
        if (
            state &&
            (action.type === slices.authRequestsSlice.login.actions.success.toString() ||
                action.type === slices.authRequestsSlice.logout.actions.success.toString() ||
                action.type ===
                    slices.authRequestsSlice.loginWithoutAccount.actions.request.toString() ||
                action.type === "RESET_STATE")
        ) {
            state = {
                // Don't reset the feature flags state, since it gets fetched on page load.
                // Don't need them to be reset to defaults when logging in.
                [mounts.featureFlags]: state[mounts.featureFlags],

                [mounts.router]: state[mounts.router],
                [mounts.routerExtension]: state[mounts.routerExtension],

                // Need to not clear the toasts state so that toasts (like 'Please authenticate' toasts)
                // don't get wiped out on (forced) logout, so that the user can actually read them.
                [mounts.toasts]: state[mounts.toasts]
            };
        }

        return appReducer(state, action);
    };

    return rootReducer;
};

export default createRootReducer;
