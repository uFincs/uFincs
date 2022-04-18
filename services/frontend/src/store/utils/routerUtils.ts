import {
    LocationActionPayload,
    LocationChangePayload,
    CALL_HISTORY_METHOD,
    LOCATION_CHANGE
} from "connected-react-router";
import ScreenUrls, {DerivedAppScreenUrls} from "values/screenUrls";

export type Route = string;

export interface RouteChangePayload
    extends Partial<LocationActionPayload<Array<string>>>,
        Partial<LocationChangePayload> {}

// NOTE: This can't go in store/rootActions because it'll cause cyclical dependencies. No bueno.
export const routerActionTypes = [CALL_HISTORY_METHOD, LOCATION_CHANGE];

const isRouteBlacklisted = (route: Route, routesBlacklist: Array<Route>): boolean =>
    routesBlacklist.reduce<boolean>(
        (acc, blacklistRoute) => acc || route.startsWith(blacklistRoute),
        false
    );

const tryingToAccessRoutes = (payload: RouteChangePayload, routesBlacklist: Array<Route> = []) => {
    // 'location' is for LOCATION_CHANGE type actions
    // 'args' is for CALL_HISTORY_METHOD type actions
    // See https://github.com/supasate/connected-react-router/blob/master/src/actions.js for reference
    const {location, args} = payload;

    if (location) {
        return isRouteBlacklisted(location.pathname, routesBlacklist);
    } else if (args) {
        // `args` is an array where the first element is the path payload and subsequent elements
        // are any `state` that was added to the history. Since we only care about the path,
        // we only operate on the first element.
        return isRouteBlacklisted(args[0] || "", routesBlacklist);
    } else {
        return false;
    }
};

export const tryingToAccessApp = (payload: RouteChangePayload) =>
    tryingToAccessRoutes(payload, [ScreenUrls.APP]);

export const tryingToAccessAuth = (payload: RouteChangePayload) =>
    tryingToAccessRoutes(payload, [ScreenUrls.LOGIN]);

export const tryingToAccessCheckout = (payload: RouteChangePayload) =>
    tryingToAccessRoutes(payload, [ScreenUrls.CHECKOUT]);

export const tryingToAccessNoAccountSignUp = (payload: RouteChangePayload) =>
    tryingToAccessRoutes(payload, [DerivedAppScreenUrls.NO_ACCOUNT_SIGN_UP]);
