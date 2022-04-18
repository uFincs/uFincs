import {useCallback, useEffect} from "react";
import {useHistory} from "react-router-dom";
import {useOnWindowResize} from "hooks/";
import {AccountData} from "models/";
import {accountDetailsDoubleColumnMatches} from "utils/mediaQueries";
import {DerivedAppScreenUrls} from "values/screenUrls";

// This hook redirects the desktop Accounts scene from the root accounts list (/accounts) to
// the first account in the list (/accounts/:id) right after loading the list.
// The reason to do this is that it'd be poor UX if we just dumped the user onto a blank
// Account Details screen when we could just give them the first account.
export const useRedirectToDetails = (firstAccount: AccountData | undefined) => {
    const history = useHistory();
    const path = history.location.pathname;

    const redirectToAccountDetails = useCallback(() => {
        if (
            path === DerivedAppScreenUrls.ACCOUNTS &&
            accountDetailsDoubleColumnMatches() &&
            firstAccount
        ) {
            history.replace(`${DerivedAppScreenUrls.ACCOUNTS}/${firstAccount.id}`);
        }
    }, [firstAccount, history, path]);

    useEffect(() => {
        // Need to fire once immediately after mounting to get the redirect right away.
        redirectToAccountDetails();
    }, [redirectToAccountDetails]);

    useOnWindowResize(redirectToAccountDetails);
};
