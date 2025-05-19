declare global {
    interface Window {
        Cypress: object;

        BRANCH: string;
        BACKEND_HOST: string;
        BACKEND_PORT: string;
        BACKEND_PROTOCOL: string;
        MARKETING_HOST: string;
        MARKETING_PORT: string;
        MARKETING_PROTOCOL: string;
        SOFTWARE_TAG: string;

        trustedTypes?: {
            createPolicy: (
                name: string,
                options: {
                    createHTML?: (string: string) => any;
                    createScript?: (string: string) => any;
                    createScriptURL?: (string: string) => any;
                }
            ) => void;
        };
    }
}

const IS_PRODUCTION = import.meta.env.PROD;

if (
    window.BACKEND_HOST === undefined ||
    window.BACKEND_HOST === "__BACKEND_HOST__" ||
    window.BACKEND_HOST === ""
) {
    // Use window.location.hostname instead of just 'localhost' so that it still works
    // when running the server locally, but also when connecting to it from another device
    // (e.g. for mobile testing).
    window.BACKEND_HOST = import.meta.env.REACT_APP_BACKEND_HOST || window.location.hostname;
}

if (
    window.BACKEND_PORT === undefined ||
    window.BACKEND_PORT === "__BACKEND_PORT__" ||
    window.BACKEND_PORT === ""
) {
    window.BACKEND_PORT = import.meta.env.REACT_APP_BACKEND_PORT || "5000";
}

if (window.BACKEND_PROTOCOL === undefined || window.BACKEND_PROTOCOL === "__BACKEND_PROTOCOL__") {
    window.BACKEND_PROTOCOL = import.meta.env.REACT_APP_BACKEND_PROTOCOL || "http";
}

if (
    window.MARKETING_HOST === undefined ||
    window.MARKETING_HOST === "__MARKETING_HOST__" ||
    window.MARKETING_HOST === ""
) {
    // Use window.location.hostname instead of just 'localhost' so that it still works
    // when running the server locally, but also when connecting to it from another device
    // (e.g. for mobile testing).
    window.MARKETING_HOST = import.meta.env.REACT_APP_MARKETING_HOST || window.location.hostname;
}

if (
    window.MARKETING_PORT === undefined ||
    window.MARKETING_PORT === "__MARKETING_PORT__" ||
    window.MARKETING_PORT === ""
) {
    window.MARKETING_PORT = import.meta.env.REACT_APP_MARKETING_PORT || "3002";
}

if (
    window.MARKETING_PROTOCOL === undefined ||
    window.MARKETING_PROTOCOL === "__MARKETING_PROTOCOL__"
) {
    window.MARKETING_PROTOCOL = import.meta.env.REACT_APP_MARKETING_PROTOCOL || "http";
}

if (
    window.SOFTWARE_TAG === undefined ||
    window.SOFTWARE_TAG === "__SOFTWARE_TAG__" ||
    window.SOFTWARE_TAG === ""
) {
    window.SOFTWARE_TAG = import.meta.env.REACT_APP_SOFTWARE_TAG || "localhost";
}

let BACKEND_URL = `${window.BACKEND_PROTOCOL}://${window.BACKEND_HOST}`;

if (window.BACKEND_PORT !== "80" && window.BACKEND_PORT !== "443") {
    BACKEND_URL = `${BACKEND_URL}:${window.BACKEND_PORT}`;
}

let MARKETING_URL = `${window.MARKETING_PROTOCOL}://${window.MARKETING_HOST}`;

if (window.MARKETING_PORT !== "80" && window.MARKETING_PORT !== "443") {
    MARKETING_URL = `${MARKETING_URL}:${window.MARKETING_PORT}`;
}

const BACKEND_HEALTHCHECK_ROUTE = `${BACKEND_URL}/healthcheck`;
const BACKEND_DATABASE_SERVICE = "backend-database";

const SOFTWARE_TAG = window.SOFTWARE_TAG;

const STRIPE_KEY = (() => {
    if (window.BRANCH === undefined || window.BRANCH === "__BRANCH__" || window.BRANCH === "") {
        window.BRANCH = import.meta.env.REACT_APP_BRANCH || "localhost";
    }

    if (window.BRANCH === "master") {
        // This is the prod Stripe key. It should only be used in prod (i.e. the master branch).
        // eslint-disable-next-line
        return "pk_live_51IPd3fAp2ZfinMgzTa2EQZ4YqG08s0kB8k6zLsMwfFven1L9qpfNFtGOxD5B4StH6W48Al1UX9g8ypixF7IN1rKJ00d61hQMGS";
    } else {
        // This is the Stripe key for the test account. It should be used in dev and all staging environments.
        // eslint-disable-next-line
        return "pk_test_51IPdzoHRrHYb3hYtytBQE6svreY0cPiNHxEizAAE7hOVIWIIlUK5eTgsfnsC5X4OyGQhZ5GFYY3BC9UWc5J6yfXa00I7uJx230";
    }
})();

export {
    BACKEND_URL,
    BACKEND_DATABASE_SERVICE,
    BACKEND_HEALTHCHECK_ROUTE,
    MARKETING_URL,
    IS_PRODUCTION,
    SOFTWARE_TAG,
    STRIPE_KEY
};
