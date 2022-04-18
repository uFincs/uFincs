import {NativePlatformsService} from "services/";

export const isFirefoxBrowser = () =>
    typeof navigator !== "undefined" && navigator?.userAgent?.includes("Firefox");

export const isSafariBrowser = () =>
    (typeof navigator !== "undefined" &&
        navigator?.userAgent?.includes("Safari") &&
        !navigator?.userAgent?.includes("Chrome")) ||
    // If we're running as a 'native' app on iOS, then it's really just a Safari web view.
    // But since it doesn't identify itself using the above conditions, we must check directly.
    NativePlatformsService.isIOS();
