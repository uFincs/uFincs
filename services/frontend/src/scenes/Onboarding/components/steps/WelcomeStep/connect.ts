import {connect} from "react-redux";
import {Dispatch} from "redux";
import {onboardingRequestsSlice} from "store/";

interface DispatchProps {
    /** Callback for putting the user in demo data mode. */
    onUseDemoData: () => void;
}

export interface ConnectedProps extends DispatchProps {}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onUseDemoData: () => dispatch(onboardingRequestsSlice.useDemoData.actions.request())
});

export default connect(null, mapDispatchToProps);
