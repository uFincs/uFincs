type EnvValue = "production" | "development";

const ENV = (process.env.NODE_ENV || "development") as EnvValue;
const IS_PRODUCTION = ENV === "production";
const IS_MASTER = process.env.NAMESPACE === "master";

const FRONTEND_HOST = process.env.FRONTEND_HOST || "localhost";
const FRONTEND_PORT = process.env.FRONTEND_PORT || "3000";
const FRONTEND_PROTOCOL = process.env.NODE_ENV === "production" ? "https" : "http";

let FRONTEND_URL = `${FRONTEND_PROTOCOL}://${FRONTEND_HOST}`;

if (FRONTEND_PORT !== "80" && FRONTEND_PORT !== "443") {
    FRONTEND_URL = `${FRONTEND_URL}:${FRONTEND_PORT}`;
}

// Capacitor apps have different 'origins' than a web based app.
// See https://ionicframework.com/docs/troubleshooting/cors for reference.
const CAPACITOR_ANDROID_URL = "http://localhost";
const CAPACITOR_IOS_URL = "capacitor://localhost";
const CAPACITOR_ELECTRON_URL = "capacitor-electron://-";

const CORS_URLS = [FRONTEND_URL, CAPACITOR_ANDROID_URL, CAPACITOR_IOS_URL, CAPACITOR_ELECTRON_URL];

export {CORS_URLS, ENV, FRONTEND_URL, IS_MASTER, IS_PRODUCTION};
