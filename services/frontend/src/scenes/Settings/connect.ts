import {push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {authRequestsSlice, modalsSlice, serviceWorkerSlice} from "store/";
import {MarketingUrls} from "values/marketingUrls";
import {DerivedAppScreenUrls} from "values/screenUrls";

interface DispatchProps {
    /** Callback for going back to the Settings navigation page (on mobile). */
    onBack: () => void;

    /** Callback for redirecting the user to the Changelog. */
    onChangelog: () => void;

    /** Callback for checking for service worker updates. */
    onCheckForUpdates: () => void;

    /** Callback when clicking on the `Logout` item. */
    onLogout: () => void;

    /** Callback for navigating the user to the no-account sign up page. */
    onNoAccountSignUp: () => void;

    /** Callback for opening the Feedback dialog. */
    onSendFeedback: () => void;
}

export interface ConnectedProps extends DispatchProps {}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onBack: () => dispatch(push(DerivedAppScreenUrls.SETTINGS)),
    onChangelog: () => dispatch(push(MarketingUrls.CHANGELOG)),
    onCheckForUpdates: () => dispatch(serviceWorkerSlice.actions.checkForUpdates()),
    onLogout: () => dispatch(authRequestsSlice.logout.actions.request()),
    onNoAccountSignUp: () => dispatch(push(DerivedAppScreenUrls.NO_ACCOUNT_SIGN_UP)),
    onSendFeedback: () => dispatch(modalsSlice.actions.showFeedbackModal())
});

export default connect(null, mapDispatchToProps);
