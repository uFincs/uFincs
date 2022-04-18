import {push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {authRequestsSlice, modalsSlice, serviceWorkerSlice} from "store/";
import {DerivedAppScreenUrls} from "values/screenUrls";

export interface ConnectedProps {
    /** Callback for checking for service worker updates. */
    onCheckForUpdates: () => void;

    /** Callback when clicking on the `Logout` item. */
    onLogout: () => void;

    /** Callback when clicking on the `Send Feedback` item. */
    onSendFeedback: () => void;

    /** Callback when clicking on the `Settings` item. */
    onSettings: () => void;
}

const mapDispatchToProps = (dispatch: Dispatch): ConnectedProps => ({
    onCheckForUpdates: () => dispatch(serviceWorkerSlice.actions.checkForUpdates()),
    onLogout: () => dispatch(authRequestsSlice.logout.actions.request()),
    onSendFeedback: () => dispatch(modalsSlice.actions.showFeedbackModal()),
    onSettings: () => dispatch(push(DerivedAppScreenUrls.SETTINGS))
});

export default connect(null, mapDispatchToProps);
