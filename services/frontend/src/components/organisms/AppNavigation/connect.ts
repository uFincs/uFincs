import {push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {crossSliceSelectors, State} from "store/";
import ScreenUrls, {DerivedAppScreenUrls} from "values/screenUrls";

interface StateProps {
    /** The index of the currently active nav item. */
    active: number;
}

interface DispatchProps {
    /** Handler for the special case where a navigation needs to be triggered programatically,
     *  as opposed to the user clicking on the nav item and triggering the anchor link.
     *
     *  This is necessary for handling some of the keyboard navigation facilitated by the `TabBar`. */
    onNavigate: (url: string) => void;

    /** Handler for navigating the user to the no-account sign up page. */
    onNoAccountSignUp: () => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

export const mapScreenUrlToIndex = (url: string) => {
    if (url.includes(DerivedAppScreenUrls.ACCOUNTS)) {
        // This handles the 'account details' case, where the ID is in the url.
        return 1;
    } else if (url.includes(DerivedAppScreenUrls.TRANSACTIONS)) {
        // This handles the transactions scene case, when the page number is in the url.
        return 2;
    } else if (url.includes(DerivedAppScreenUrls.SETTINGS)) {
        // This handles all of the sub pages in the Settings scene.
        return 3;
    }

    switch (url) {
        case ScreenUrls.APP:
        // Falls through.
        case DerivedAppScreenUrls.DASHBOARD:
            return 0;
        case DerivedAppScreenUrls.ACCOUNTS:
            return 1;
        case DerivedAppScreenUrls.TRANSACTIONS:
            return 2;
        case DerivedAppScreenUrls.SETTINGS:
            return 3;
        default:
            return -1;
    }
};

const mapStateToProps = (state: State): StateProps => ({
    active: mapScreenUrlToIndex(crossSliceSelectors.router.selectModalCompatibleCurrentRoute(state))
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onNavigate: (url: string) => dispatch(push(url)),
    onNoAccountSignUp: () => dispatch(push(DerivedAppScreenUrls.NO_ACCOUNT_SIGN_UP))
});

export default connect(mapStateToProps, mapDispatchToProps);
