export const isFirefoxBrowser = () =>
    typeof navigator !== "undefined" && navigator?.userAgent?.includes("Firefox");

export const isSafariBrowser = () =>
    typeof navigator !== "undefined" &&
    navigator?.userAgent?.includes("Safari") &&
    !navigator?.userAgent?.includes("Chrome");
