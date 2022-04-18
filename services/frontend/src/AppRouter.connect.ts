import {Location} from "history";
import {connect} from "react-redux";
import {crossSliceSelectors, userSlice, State} from "store/";

export interface ConnectedProps {
    /** Whether or not the user has already been through the onboarding process. */
    isOnboarded: boolean;

    /** A location object for the react-router Switch that is 'compatible' with how
     *  modals are routed. That is, this location will always be whatever route came before
     *  the user opened a modal, so that the Switch can render, underneath the modal, the last
     *  route. */
    modalCompatibleLocation: Location;
}

const mapStateToProps = (state: State): ConnectedProps => ({
    isOnboarded: userSlice.selectors.selectIsOnboarded(state),
    modalCompatibleLocation: crossSliceSelectors.router.selectModalCompatibleLocation(state)
});

export default connect(mapStateToProps);
