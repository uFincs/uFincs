import mounts from "store/mountpoints";
import {State} from "store/types";
import {createSliceWithSelectors} from "store/utils";

/* State */

type ServiceWorkerState = object;

const initialState: ServiceWorkerState = {};

/* Selector */

const selectState = (state: State): ServiceWorkerState => state[mounts.serviceWorker];

const selectors = {
    selectState
};

/* Slice */

export const serviceWorkerSlice = createSliceWithSelectors({
    name: mounts.serviceWorker,
    initialState,
    reducers: {
        /* Saga Only Actions */
        register: (state) => state,
        unregister: (state) => state,
        checkForUpdates: (state) => state
    },
    selectors
});
