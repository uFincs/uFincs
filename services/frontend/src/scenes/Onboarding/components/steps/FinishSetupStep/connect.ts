import {connect} from "react-redux";
import {Dispatch} from "redux";
import {AccountData, AccountType} from "models/";
import {onboardingSlice, onboardingRequestsSlice, State} from "store/";

interface StateProps {
    /** The complete set of accounts (mapped by type) to show as a summary. */
    accountsByType: Record<AccountType, Array<AccountData>>;
}

interface DispatchProps {
    /** Handler that is called on the 'Next' button to finish the import process. */
    finishOnboarding: () => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    accountsByType: onboardingSlice.selectors.selectSelectedAccounts(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    finishOnboarding: () => dispatch(onboardingRequestsSlice.finishOnboarding.actions.request())
});

export default connect(mapStateToProps, mapDispatchToProps);
