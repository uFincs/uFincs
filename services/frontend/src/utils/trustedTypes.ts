import DOMPurify from "dompurify";

// 'Trusted Types' is a CSP (Content Security Policy) introduced as part of Chrome 83.
// Currently, it is _only_ supported by Chrome 83+; not any other browsers.
//
// However, that should be fine, since they'll just ignore this code. They'll just be slightly more
// vulnerable than Chrome users till they implement the policy.
//
// Enabling the use of Trusted Types is handled by the `trusted-types` and `require-trusted-types-for` CSP policies.
//
// The goal of Trusted Types is to prevent DOM-based XSS attacks. This is good for us since mitigating as
// many avenues for XSS attacks is important for the security model of uFincs; if an XSS attack is
// successful against uFincs, then we/the user is basically screwed.

const registerTrustedTypes = () => {
    if (window?.trustedTypes?.createPolicy) {
        // The `default` policy is invoked when no other policy has been invoked and a raw string
        // is being called on one of the injection sinks.
        //
        // ~In our case, we only need to sanitize for Script URLs, since we use them for the Web Workers
        // that power the redux-e2e-encryption middleware. And since we don't have direct access to the
        // code that calls `new Worker(url)` (since it is encapsulated by `workerize-loader`), we have
        // to use the default policy as opposed to a named policy.~
        //
        // Note: The above is no longer true/needed since we stopped using web workers.
        //
        // Note that we don't specify a `createScript` function since we don't expect any injection sinks
        // there, so it will automatically generate errors. We cover `createHTML` with explicit sanitization
        // and `createScriptUrl` with custom filtering to ensure a good amount of protection against DOM-based
        // XSS attack prevention.
        //
        // See https://w3c.github.io/webappsec-trusted-types/dist/spec/#default-policy-hdr for more details
        // on the use of a default policy.
        window.trustedTypes.createPolicy("default", {
            createHTML: (input) => DOMPurify.sanitize(input, {RETURN_TRUSTED_TYPE: false}),
            createScriptURL: (url: string) => {
                const parsedUrl = new URL(url, document.baseURI);

                if (
                    // This first condition ensures that script URLs must originate from our own domain.
                    (document.baseURI.includes(parsedUrl.origin) &&
                        // This second condition requires that the URL contains "worker.js", to ensure
                        // that the URL is intended for a Web Worker.
                        //
                        // This was chosen as a condition because of the fact that the URLs that are
                        // generated for the redux-e2e-encryption workers follow the form `${hash}.worker.js`.
                        // As such, this condition helps to try and narrow down Script URLs to just those
                        // that we are aware of.
                        parsedUrl.pathname.includes("worker.js")) ||
                    // We also want to allow the Stripe scripts, since we kinda have to...
                    parsedUrl.origin === "https://js.stripe.com"
                ) {
                    return url;
                }

                throw new TypeError(`Invalid URL: ${url}`);
            }
        });
    }
};

export default registerTrustedTypes;
