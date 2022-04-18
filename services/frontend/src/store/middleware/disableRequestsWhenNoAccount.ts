import {Middleware} from "redux";
import {crossSliceSelectors, userSlice} from "store/";
import {OfflineRequestManager} from "store/utils/createOfflineRequestManager";

/** When the user is using the app in no-account or read-only mode, we want to disable all network requests.
 *
 *  This can more-or-less be accomplished by preventing all of the `enqueue` actions for the
 *  OfflineRequestManager from happening. If the manager has no effects to process, then there
 *  are no network requests that can be made.
 *
 *  Of course, this relies on all requests being wrapped in OfflineRequestSlices, which is more-or-less
 *  true; there are just a couple instances (i.e. auth calls) that aren't, but these can be handled
 *  on a case-by-case basis.
 *
 *  Note: When running in read-only mode, we want to only enable fetch effects. Obviously, because it's
 *  read-only mode. */
const disableRequestsWhenNoAccount: Middleware = (store) => (next) => (action) => {
    const state = store.getState();

    const noAccount = userSlice.selectors.selectNoAccount(state);
    const readOnly = crossSliceSelectors.user.selectReadOnlySubscription(state);

    if (
        action.type === OfflineRequestManager.actions.enqueue.type &&
        (noAccount || (readOnly && !action.payload?.isFetchEffect))
    ) {
        return;
    }

    return next(action);
};

export default disableRequestsWhenNoAccount;
