import ScreenUrls, {DerivedAppScreenUrls} from "values/screenUrls";
import {tryingToAccessApp, tryingToAccessAuth, Route, RouteChangePayload} from "./routerUtils";

const generateLocationPayload = (route: Route): RouteChangePayload => ({
    location: {
        pathname: route,
        search: "",
        state: "",
        hash: ""
    }
});
const generateArgsPayload = (route: Route): RouteChangePayload => ({args: [route]});

const testLocationAndArgsPayloads = (
    func: (payload: RouteChangePayload) => boolean,
    route: Route,
    result: boolean
) => {
    const locationPayload = generateLocationPayload(route);
    const argsPayload = generateArgsPayload(route);

    expect(func(locationPayload)).toEqual(result);
    expect(func(argsPayload)).toEqual(result);
};

describe("tryingToAccessApp", () => {
    it("knows when you want to access the app", () => {
        testLocationAndArgsPayloads(tryingToAccessApp, ScreenUrls.APP, true);
    });

    it("knows when you want to access a sub-route of the app", () => {
        testLocationAndArgsPayloads(tryingToAccessApp, DerivedAppScreenUrls.ACCOUNTS, true);
    });

    it("knows when you aren't trying to access the app", () => {
        testLocationAndArgsPayloads(tryingToAccessApp, ScreenUrls.LOGIN, false);
    });
});

describe("tryingToAccessAuth", () => {
    it("knows when you want to access the login page", () => {
        testLocationAndArgsPayloads(tryingToAccessAuth, ScreenUrls.LOGIN, true);
    });

    it("knows when you aren't trying to access the auth page", () => {
        testLocationAndArgsPayloads(tryingToAccessAuth, ScreenUrls.APP, false);
    });
});
