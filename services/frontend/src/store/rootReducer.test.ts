import {createBrowserHistory} from "history";
import createRootReducer from "./rootReducer";
import {authRequestsSlice, userSlice} from "./slices";

const history = createBrowserHistory({forceRefresh: false});
const rootReducer = createRootReducer(history);

describe("Root Reducer", () => {
    const initialState = rootReducer(undefined, {type: ""});

    // We'll use the user ID state as a marker for cleared state.
    const userId = "123";
    const stateWithStuff = rootReducer(initialState, userSlice.actions.setUserId(userId));

    // Note: Clearing the state doesn't result in the produced state being the exact same
    // as the initial state, because the action that's causing the state to be cleared is
    // still processed.
    //
    // For example, with the login action, it'll set the request's `loading` state to true,
    // but still clear the rest of the state.

    it("clears all (non-router) state when logging in", () => {
        const clearedState = rootReducer(stateWithStuff, authRequestsSlice.login.actions.success());

        expect(userSlice.selectors.selectUserId(clearedState)).toEqual("");
    });

    it("clears all (non-router) state when logging out", () => {
        const clearedState = rootReducer(
            stateWithStuff,
            authRequestsSlice.logout.actions.success()
        );

        expect(userSlice.selectors.selectUserId(clearedState)).toEqual("");
    });

    it("clears all (non-router) state when an explicit RESET_STATE action happens", () => {
        const clearedState = rootReducer(stateWithStuff, {type: "RESET_STATE"});

        expect(userSlice.selectors.selectUserId(clearedState)).toEqual("");
    });

    it("doesn't clear the state when any action other than the above happens", () => {
        const clearedState = rootReducer(
            stateWithStuff,
            userSlice.actions.setUserEmail("test@test.com")
        );

        expect(userSlice.selectors.selectUserId(clearedState)).toEqual(userId);
    });
});
