import {useState, useEffect} from "react";

// Inspired by https://github.com/rehooks/window-scroll-position.

/* Checker for passive event support */

let supportsPassive = false;

try {
    const opts = Object.defineProperty({}, "passive", {
        get: () => {
            supportsPassive = true;
            return "";
        }
    });

    window.addEventListener("testPassive", () => {}, opts);
    window.removeEventListener("testPassive", () => {}, opts);
} catch (e) {} // eslint-disable-line

/* The actual hook code */

interface Options {
    isActive: boolean;
}

/** Hook for getting the current page's scroll position. */
const useScrollPosition = ({isActive = true}: Options): number => {
    const [position, setPosition] = useState(window.pageYOffset);

    useEffect(() => {
        const handleScroll = () => setPosition(window.pageYOffset);

        if (isActive) {
            window.addEventListener(
                "scroll",
                handleScroll,
                supportsPassive ? {passive: true} : false
            );
        } else {
            window.removeEventListener("scroll", handleScroll);
        }

        return () => window.removeEventListener("scroll", handleScroll);
    }, [isActive]);

    if (position !== window.pageYOffset) {
        // Accounts for when the effect was previously inactive, but the user has already scrolled.
        // Position would just be 0 when the effect becomes active, but the YOffset isn't 0.
        return window.pageYOffset;
    } else {
        return position;
    }
};

export default useScrollPosition;
