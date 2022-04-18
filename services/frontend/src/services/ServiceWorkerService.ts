const IS_LOCALHOST = Boolean(
    window.location.hostname === "localhost" ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === "[::1]" ||
        // 127.0.0.0/8 are considered localhost for IPv4.
        window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

const NODE_ENV = process.env.NODE_ENV;
const PUBLIC_URL = process.env.PUBLIC_URL;

const SERVICE_WORKER_URL = `${PUBLIC_URL}/service-worker.js`;

interface Config {
    onSuccess?: (registration: ServiceWorkerRegistration) => void;
    onUpdate?: (registration: ServiceWorkerRegistration) => void;
}

export default class ServiceWorkerService {
    /** Registers the service worker and sets up the onSuccess/onUpdate handlers that can be used
     *  for toast notifications. */
    public static async register(config?: Config) {
        if (NODE_ENV !== "production" || !("serviceWorker" in navigator)) {
            return;
        }

        const publicUrl = new URL(PUBLIC_URL, window.location.href);

        if (publicUrl.origin !== window.location.origin) {
            // Our service worker won't work if PUBLIC_URL is on a different origin
            // from what our page is served on. This might happen if a CDN is used to
            // serve assets; see https://github.com/facebook/create-react-app/issues/2374
            return;
        }

        if (IS_LOCALHOST) {
            // This is running on localhost. Let's check if a service worker still exists or not.
            await ServiceWorkerService._checkValidServiceWorker(SERVICE_WORKER_URL, config);

            // Add some additional logging to localhost, pointing developers to the
            // service worker/PWA documentation.
            await navigator.serviceWorker.ready;

            console.log(
                "This web app is being served cache-first by a service " +
                    "worker. To learn more, visit https://cra.link/PWA"
            );
        } else {
            // Is not localhost. Just register service worker.
            await ServiceWorkerService._registerValidSW(SERVICE_WORKER_URL, config);
        }
    }

    /** Unregisters the service worker to bust the file cache. */
    public static async unregister() {
        if (!("serviceWorker" in navigator)) {
            return;
        }

        try {
            const registration = await navigator.serviceWorker.ready;
            registration.unregister();
        } catch (e) {
            console.error(e.message);
        }
    }

    /** Forces a service worker update to go through (i.e. "to skip waiting"). */
    public static async forceUpdate() {
        if (!("serviceWorker" in navigator)) {
            return;
        }

        const registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL);
        registration.waiting?.postMessage({type: "SKIP_WAITING"});

        window.location.reload();
    }

    /** Makes the service worker manually check for any new updates
     *  (updates automatically happen on page refresh or after a certain period of time).  */
    public static async checkForUpdates(): Promise<boolean> {
        if (!("serviceWorker" in navigator)) {
            return false;
        }

        try {
            const registration = await navigator.serviceWorker.register(SERVICE_WORKER_URL);
            await registration.update();

            // Need to check for `installing` _and_ `waiting`, because they'll be populated at
            // different times. When the first update happens, and there is an update, `installing` will
            // be populated with the installing service worker _but not_ `waiting`.
            //
            // Once the service worker is done installing, however, `installing` will be null and `waiting`
            // will be populated. As such, on subsequent 'Check for Updates', we'll see that `waiting`
            // is populated and issue an update toast.
            //
            // Note: During the first update, an update toast will actually be issued twice: once
            // because this function will return true and trigger an update toast, and again because
            // of the state change that causes `onUpdate` to fire in`_registerValidSW`.
            // However, the toasts will be de-duplicated by the toasts slice, so this is fine.
            //
            // But, you're probably thinking "ok, so just don't fire a toast here when `installing` gets
            // set". Well, remember, if we don't return true (i.e. we return false), then the 'No updates'
            // toast will be fired. And we definitely don't want to show a 'No updates' and 'Updates' toast
            // at the same time.
            //
            // So we either would have to add toast slice level logic to make sure a 'No updates' and
            // 'Updates' toast aren't queued at the same time, or we could just fire the 'Updates' toast
            // twice and let the toast slice handle de-duplication with its existing logic. Obviously,
            // I went for the latter.
            return !!registration.installing || !!registration.waiting;
        } catch {
            // This will happen if the user tries to check for updates while offline.
            return false;
        }
    }

    /** The core service worker registration logic that just adds some extra logging on localhost. */
    private static async _registerValidSW(swUrl: string, config?: Config) {
        try {
            const registration = await navigator.serviceWorker.register(swUrl);

            registration.onupdatefound = () => {
                const installingWorker = registration.installing;

                if (!installingWorker) {
                    return;
                }

                installingWorker.onstatechange = () => {
                    if (installingWorker.state !== "installed") {
                        return;
                    }

                    if (navigator.serviceWorker.controller) {
                        // At this point, the updated precached content has been fetched,
                        // but the previous service worker (i.e. controller) will still serve the older
                        // content until all client tabs are closed.
                        console.log(
                            "New content is available and will be used when all " +
                                "tabs for this page are closed. See https://cra.link/PWA."
                        );

                        config?.onUpdate?.(registration);
                    } else {
                        // At this point, everything has been precached.
                        // It's the perfect time to display a
                        // "Content is cached for offline use." message.
                        console.log("Content is cached for offline use.");

                        config?.onSuccess?.(registration);
                    }
                };
            };
        } catch (e) {
            console.error("Error during service worker registration:", e);
        }
    }

    /** Some more localhost specific logic just for debugging purposes. */
    private static async _checkValidServiceWorker(swUrl: string, config?: Config) {
        try {
            // Check if the service worker can be found. If it can't reload the page.
            const response = await fetch(swUrl, {headers: {"Service-Worker": "script"}});

            // Ensure service worker exists, and that we really are getting a JS file.
            const contentType = response.headers.get("content-type");

            if (response.status === 404 || !contentType?.includes("javascript")) {
                // No service worker found. Probably a different app. Reload the page.
                await ServiceWorkerService.unregister();
                window.location.reload();
            } else {
                // Service worker found. Proceed as normal.
                await ServiceWorkerService._registerValidSW(swUrl, config);
            }
        } catch {
            console.log("No internet connection found. App is running in offline mode.");
        }
    }
}
