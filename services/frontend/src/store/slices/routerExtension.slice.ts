import {createSelector, PayloadAction} from "@reduxjs/toolkit";
import {Location} from "history";
import mounts from "store/mountpoints";
import {State} from "store/types";
import {createSliceWithSelectors} from "store/utils";

/* This slice handles any extensions to the router state that we need.
 *
 * Currently, this includes storing the 'previous' location so that we can generate
 * 'modal compatible' routes. We're using a technique detailed here:
 * https://blog.logrocket.com/building-a-modal-module-for-react-with-react-router/
 *
 * Essentially, in order to render a modal dialog (like the Sidebar forms) over top of the
 * current page using a react-router `Route`, we need to be able to reference what route
 * came _before_ the modal's route -- this is the `previousLocation` stored here.
 *
 * Then, any component that depends on the location for rendering (e.g. the AppRouter's `Switch`),
 * can be fed this `previousLocation` whenever a modal dialog is being shown to the user
 * so that it can be faked into displaying whatever it was already displaying.
 *
 * This is what we mean by 'modal compatible': a view of the current [location] that can
 * change to point to the previous [location] whenever a modal is being presented to the user.
 *
 * The reason we want to store the `previousLocation` in the Redux store is so we get
 * persistence of it between page refreshes. That way, even if the user refreshes the page
 * with the modal open, the page underneath the modal is still kept the same.
 *
 * Note that there is a wrinkle here: we're only storing the previous _location_ object
 * in the store, but there are some components that rely on the _match_ object for rendering.
 *
 * Because `match` objects are tied to the URL that they are matching, those components are
 * served by a separate `createModalCompatibleMatchSelector` function in `router.selectors.ts`.
 * It handles persistence directly through `localStorage` because it was easier to do that
 * than building out dynamic or hardcoded store state for every URL.
 */

/* State */

interface RouterExtensionState {
    previousLocation: Location | null;
}

const initialState: RouterExtensionState = {
    previousLocation: null
};

/* Selectors */

const selectState = (state: State): RouterExtensionState => state[mounts.routerExtension];

const selectPreviousLocation = createSelector([selectState], (state) => state.previousLocation);

const selectors = {
    selectState,
    selectPreviousLocation
};

/* Slice */

export const routerExtensionSlice = createSliceWithSelectors({
    name: mounts.routerExtension,
    initialState,
    reducers: {
        setPreviousLocation: (state: RouterExtensionState, action: PayloadAction<Location>) => {
            state.previousLocation = action.payload;
        }
    },
    selectors
});
