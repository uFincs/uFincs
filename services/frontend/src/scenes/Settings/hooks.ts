import {useCallback, useEffect} from "react";
import {useHistory} from "react-router-dom";
import {useNoAccount, useOnWindowResize} from "hooks/";
import {navigationBreakpointMatches} from "utils/mediaQueries";
import {DerivedAppScreenUrls} from "values/screenUrls";

// This hook redirects the desktop Settings scene from the root settings navigation (/settings) to
// the User Account scene (/settings/user) right after loading.
export const useRedirectToUserSettings = () => {
    const history = useHistory();
    const path = history.location.pathname;

    const noAccount = useNoAccount();

    const redirectToUserSettings = useCallback(() => {
        if (path === DerivedAppScreenUrls.SETTINGS && navigationBreakpointMatches()) {
            history.replace(
                noAccount
                    ? DerivedAppScreenUrls.SETTINGS_PREFERENCES
                    : DerivedAppScreenUrls.SETTINGS_USER_ACCOUNT
            );
        }
    }, [history, path, noAccount]);

    useEffect(() => {
        // Need to fire once immediately after mounting to get the redirect right away.
        redirectToUserSettings();
    }, [redirectToUserSettings]);

    useOnWindowResize(redirectToUserSettings);
};
