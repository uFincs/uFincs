import {connect} from "react-redux";
import {Dispatch} from "redux";
import {StepNavigationFooter} from "components/organisms";
import {onboardingRequestsSlice} from "store/";
import {
    mapDispatchToProps as otherMapDispatchToProps,
    mapStateToProps,
    DispatchProps as BaseDispatchProps,
    OwnProps
} from "./connect";

interface DispatchProps extends BaseDispatchProps {
    /** Handler for skipping the entire onboarding process. */
    onSkip: () => void;
}

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps): DispatchProps => {
    const baseProps = otherMapDispatchToProps(dispatch, ownProps);

    return {
        ...baseProps,
        onSkip: () => dispatch(onboardingRequestsSlice.skipOnboarding.actions.request())
    };
};

const Connected = connect(mapStateToProps, mapDispatchToProps)(StepNavigationFooter);

const WithSkip = (props: any) => <Connected skipLabel="Skip Setup" {...props} />;

export default WithSkip;
