import feathers from "@feathersjs/client";
import {API} from "./feathers.types";

export const AUTH_STORAGE_KEY = "ufincs-jwt";

const authConfig = {
    storage: window.localStorage,
    storageKey: AUTH_STORAGE_KEY
};

// Adapted from https://thinkster.io/tutorials/angularjs-jwt-auth/decoding-jwt-payloads.
const decodeJWT = (
    token: string | undefined
): {iat: number; exp: number; aud: string; iss: string; sub: string} => {
    if (!token) {
        return {iat: 0, exp: 0, aud: "", iss: "", sub: ""};
    }

    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace("-", "+").replace("_", "/");

    return JSON.parse(window.atob(base64));
};

// Note: Need to pass in `backendUrl` as a param instead of importing BACKEND_URL
// directly from `config` because... Cypress doesn't like it. I have no idea why,
// but Cypress fails to compile the code when `BACKEND_URL` is imported into this
// file... but doesn't care that's imported into `api.ts` or `billing.ts`.
// ¯\_(ツ)_/¯
const authConfigure = (backendUrl: string) => (api: API) => {
    const authService = feathers.authentication(authConfig);
    api.configure(authService);

    api.getRawToken = () => {
        return window.localStorage.getItem(AUTH_STORAGE_KEY) as string;
    };

    api.setRawToken = (token: string) => {
        window.localStorage.setItem(AUTH_STORAGE_KEY, token);
    };

    api.clearToken = () => {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
    };

    api.getToken = () => {
        return decodeJWT(api.getRawToken());
    };

    api.isAuthenticated = () => {
        const token = api.getToken();

        // For the Frontend's purposes, being authenticated just means have a token that
        // isn't expired. Obviously, we can't exactly test that it's a _valid_ token,
        // since that would require the Backend's secret.
        return !!token && Date.now() < token.exp * 1000;
    };

    api.testPassword = async ({email, password}: {email: string; password: string}) => {
        const rawToken = api.getRawToken();

        try {
            return await api.authenticate({strategy: "local", email, password});
        } catch (e) {
            api.setRawToken(rawToken);
            throw e;
        }
    };

    api.notifyNoAccount = async () => {
        // For some reason, using await here just results in the function like...
        // never finishing? But the request happens?
        //
        // Basically, doing `yield call(api.notifyNotAccount)` has the request
        // happen but it never moves past that in the saga... ???
        fetch(`${backendUrl}/users-no-account`);
    };
};

export default authConfigure;
