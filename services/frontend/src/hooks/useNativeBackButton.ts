import {App} from "@capacitor/app";
import {History} from "history";
import {useEffect, useRef} from "react";
import {useHistory} from "react-router";
import {NativePlatformsService} from "services/";

/** A hook for enabling the native back button (on Android) to be used to navigate back through the
 *  history of the app, or close it if there's no more back history. */
const useNativeBackButton = () => {
    const history = useHistory();
    const lastUrlRef = useRef<string>(deriveUrl(history));

    useEffect(() => {
        if (NativePlatformsService.isMobilePlatform()) {
            App.addListener("backButton", () => {
                history.goBack();

                const newUrl = deriveUrl(history);

                // If, after going back a page, we're still on the same page, then we should just
                // exit the app. This is to try and approximate "the history being empty", since
                // we (seemingly) can't check it directly (note: `history.length` seems unreliable).
                //
                // I don't actually know if there's a better way to approximate this native behaviour,
                // but it seems to (mostly) work. AKA, it's kinda still buggy (the redirection that
                // happens for the Account and Transaction scenes seems to sometimes mess it up),
                // but it's better than nothing at all.
                if (lastUrlRef.current === newUrl) {
                    App.exitApp();
                } else {
                    lastUrlRef.current = newUrl;
                }
            });
        }

        return () => {
            if (NativePlatformsService.isMobilePlatform()) {
                App.removeAllListeners();
            }
        };
    }, [history]);
};

export default useNativeBackButton;

/* Helper Functions */

const deriveUrl = (history: History) => {
    return `${history.location.pathname}${history.location.hash}`;
};
