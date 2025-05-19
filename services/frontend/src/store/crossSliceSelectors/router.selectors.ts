import {createSelector} from "@reduxjs/toolkit";
import {createMatchSelector} from "connected-react-router";
import {Location} from "history";
import {matchPath, match as Match} from "react-router";
import mounts from "store/mountpoints";
import {routerExtensionSlice} from "store/slices";
import {State} from "store/types";
import {DerivedAppModalUrls} from "values/screenUrls";

const MODAL_URLS = Object.values(DerivedAppModalUrls);

const usePreviousRoute = (isModalRoute: boolean, previousObject: any, currentObject: any) =>
    isModalRoute || previousObject !== currentObject ? previousObject : currentObject;

/* Router Selectors (pure router selectors and selectors for the routerExtension slice) */

const selectLocation = (state: State): Location => state[mounts.router].location;
const selectCurrentRoute = createSelector([selectLocation], (location) => location.pathname);

const selectIsModalRoute = createSelector([selectCurrentRoute], (path) => {
    for (const url of MODAL_URLS) {
        if (matchPath(path, url)) {
            return true;
        }
    }

    return false;
});

// See the `routerExtension.slice.ts` for an explanation of what a 'modal compatible' location is.
const selectModalCompatibleLocation = createSelector(
    [routerExtensionSlice.selectors.selectPreviousLocation, selectLocation, selectIsModalRoute],
    (previousLocation, location, isModalRoute) => {
        // previousLocation can be null on the very first first load before the onLocationChange saga fires.
        if (!previousLocation) {
            return location;
        } else {
            return usePreviousRoute(isModalRoute, previousLocation, location) as typeof location;
        }
    }
);

const selectModalCompatibleCurrentRoute = createSelector(
    [selectModalCompatibleLocation],
    (location) => `${location.pathname}${location.hash}`
);

const createModalCompatibleMatchSelector = <
    MatchParams extends {[K in keyof MatchParams]?: string | undefined}
>(
    url: string
) => {
    // Because the match objects are all dependent on the URL that they are matched against,
    // we can't really store the previous matches in the store like we do with the location.
    //
    // I mean, we _could_ have a state piece for every URL, but that'd be kinda overkill.
    //
    // As such, we kind of cheat here and bypass Redux to get at localStorage directly.
    // And we want to persist the previous matches so that, if the user refreshes the page,
    // it looks like nothing changed.
    let previousMatch: Match<MatchParams> | null = JSON.parse(localStorage.getItem(url) as string);

    const selectMatch = createMatchSelector<any, MatchParams>(url);

    return createSelector([selectMatch, selectIsModalRoute], (match, isModalRoute) => {
        // When previousMatch is empty (i.e. on first load) we need to set it to the current
        // match, otherwise things will blow up.
        //
        // The other condition is the more important one though: whenever we aren't on a modal
        // route, we need to save the match. This way, when we _do_ hit a modal route,
        // the match will be saved as the 'previous' match, and everything that isn't
        // the modal will render underneath the modal as if the route never changed.
        if (!previousMatch || !isModalRoute) {
            previousMatch = match;
            localStorage.setItem(url, JSON.stringify(previousMatch));
        }

        return usePreviousRoute(isModalRoute, previousMatch, match) as Match<MatchParams>;
    });
};

const routerSelectors = {
    selectLocation,
    selectCurrentRoute,
    selectIsModalRoute,
    selectModalCompatibleLocation,
    selectModalCompatibleCurrentRoute,
    createModalCompatibleMatchSelector
};

export default routerSelectors;
