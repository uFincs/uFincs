/* Imports */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const express = require("express");
const helmet = require("helmet");
const {errorLogger, successLogger} = require("./requestLogger");
const {STRIPE_PROD_KEY, STRIPE_TEST_KEY} = require("./stripeKeys");

/* Helper Functions */

const escapeString = (unsafe) => {
    if (!unsafe) {
        return "";
    }

    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
};

const getStripeKey = () => (process.env.NAMESPACE === "master" ? STRIPE_PROD_KEY : STRIPE_TEST_KEY);

// Want to escape the environment variables just to hedge against a server takeover where an attacker
// specifically tries to do an XSS attack through the environment variables.
//
// Could they do much worse things with a server takeover? Obviously. But better safe than sorry...
const BACKEND_HOST = escapeString(process.env.BACKEND_HOST);
const BACKEND_PORT = escapeString(process.env.BACKEND_PORT);
const BACKEND_PROTOCOL = BACKEND_HOST ? "https" : "http";

const MARKETING_HOST = escapeString(process.env.MARKETING_HOST);
const MARKETING_PORT = escapeString(process.env.MARKETING_PORT);
const MARKETING_PROTOCOL = MARKETING_HOST ? "https" : "http";

const SOFTWARE_TAG = escapeString(process.env.SOFTWARE_TAG);
const STRIPE_KEY = escapeString(getStripeKey());

// This is a really basic cache for the rendered index file. It contains the replacements for the Backend
// configuration. A hash is also calculated on the script source so that we can put the hash in the CSP
// headers.
//
// The cache busting mechanism is the fact that the server gets restarted whenever a new image is deployed
// to the cluster, so we don't really have to worry about that.
const {renderedApp, scriptHash} = (() => {
    const filePath = path.resolve(__dirname, "..", "build", "index.html");

    try {
        let htmlData = fs.readFileSync(filePath, "utf8");

        htmlData = htmlData
            .replace("__BACKEND_HOST__", `${BACKEND_HOST}`)
            .replace("__BACKEND_PORT__", `${BACKEND_PORT}`)
            .replace("__BACKEND_PROTOCOL__", `${BACKEND_PROTOCOL}`)
            .replace("__MARKETING_HOST__", `${MARKETING_HOST}`)
            .replace("__MARKETING_PORT__", `${MARKETING_PORT}`)
            .replace("__MARKETING_PROTOCOL__", `${MARKETING_PROTOCOL}`)
            .replace("__SOFTWARE_TAG__", `${SOFTWARE_TAG}`)
            .replace("__STRIPE_KEY__", `${STRIPE_KEY}`);

        const $ = cheerio.load(htmlData);
        const scriptSource = $("#script-backend-config").get()[0].children[0].data;
        const scriptHash = crypto.createHash("sha256").update(scriptSource).digest("base64");

        return {renderedApp: htmlData, scriptHash};
    } catch (err) {
        console.error("Error reading in index.html", err);
        return {renderedApp: "", scriptHash: ""};
    }
})();

// This just adds on the script hash to the CSP headers, as well as making sure index.html doesn't
// get cached. If it gets cached (particularly by Nginx) then new versions of the app won't propagate
// until the cache expires, since index.html doesn't have a hash file name, but has the script tags
// that _do_ have hash file names.
const renderApp = (req, res) => {
    const cspHeaders = res
        .get("Content-Security-Policy")
        .replace("__BACKEND_CONFIG_HASH__", scriptHash);

    res.set("Content-Security-Policy", cspHeaders);
    res.send(renderedApp);
};

const removeCaching = (req, res, next) => {
    res.set("Cache-Control", "no-cache");
    next();
};

/* Express Configuration */

const app = express();

// The Stripe URLs are required since, ya know, we need to use the Stripe library on the frontend,
// and it only works by pulling the scripts directly from Stripe.
//
// The list of URLs we need to add can be found here, under the "Content Security Policy" section:
// https://stripe.com/docs/security/guide#additional-security-considerations
//
// We need all of the directives for Stripe.js and Checkout. Unfortunately... there goes the
// 'complete lockdown' plan.

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                "default-src": ["'none'"],
                "base-uri": ["'none'"],
                "block-all-mixed-content": [],
                "child-src": ["'self'"],
                "connect-src": [
                    "'self'",
                    `${BACKEND_HOST || "localhost:5000"}`,
                    "https://api.stripe.com",
                    "https://checkout.stripe.com"
                ],
                "font-src": ["'self'"],
                "form-action": ["'none'"],
                "frame-ancestors": ["'none'"],
                "frame-src": [
                    "https://js.stripe.com",
                    "https://hooks.stripe.com",
                    "https://checkout.stripe.com"
                ],
                "img-src": ["'self'", "https://*.stripe.com"],
                "manifest-src": ["'self'"],
                "media-src": ["'none'"],
                "object-src": ["'none'"],
                "require-trusted-types-for": ["'script'"],
                "script-src": [
                    "'self'",
                    "'sha256-__BACKEND_CONFIG_HASH__'",
                    "https://js.stripe.com",
                    "https://checkout.stripe.com"
                ],
                "style-src": ["'self'"],
                "trusted-types": ["default"],
                "upgrade-insecure-requests": [],
                "worker-src": ["'self'"]
            }
        }
    })
);

app.use(errorLogger);
app.use(successLogger);

// Render the index.html on the root route as a default.
// Make sure it doesn't have the cache header so that Nginx doesn't cache it.
app.get("/", removeCaching, renderApp);

// Setup a healthcheck endpoint for the monitoring.
app.get("/healthcheck", (req, res) => res.send("1"));

// Need to explicitly render the app when hitting `/index.html` so that it doesn't
// use the static middleware and return the raw index.html file.
//
// This would be bad, since the file wouldn't have been rendered with the environment variables.
//
// One case where this happens is when the Service Worker pre-caches files; it'll hit `/index.html`
// directly, instead of using the root route above.
app.get("/index.html", removeCaching, renderApp);

// Make sure the service worker file doesn't get cached by Nginx,
// otherwise the clients won't update properly.
app.get("/service-worker.js", removeCaching);

// This serves everything out of the `build` folder as a static asset.
app.use(express.static(path.resolve(__dirname, "..", "build"), {maxAge: "1d"}));

// Anything else that wasn't a static asset must have been a route navigation.
// As such, just render the index.html as a catch-all.
app.get("*", removeCaching, renderApp);

module.exports = app;
