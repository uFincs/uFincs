import {connect} from "react-redux";
import {RouteComponentProps} from "react-router-dom";
import {Dispatch} from "redux";
import {AuthFormData} from "components/molecules/AuthForm";
import {authRequestsSlice, State, userSlice} from "store/";
import userFriendlyErrorMessages from "utils/userFriendlyErrorMessages";

interface IntermediateStateProps {
    /** Whether or not the current auth form has an error. */
    error?: string;

    /** Whether or not the current auth form is loading. */
    loading?: boolean;

    /** [intermediate] Whether or not the user is already in no-account mode. */
    noAccount?: boolean;
}

interface StateProps extends Omit<IntermediateStateProps, "noAccount"> {}

interface IntermediateDispatchProps {
    /** Handler for logging in. */
    onLogin: (data: AuthFormData) => void;

    /** Handler for signing up. */
    onSignUp: (data: AuthFormData) => void;

    /** [intermediate] Handler for logging in without an account. */
    onLoginWithoutAccount: (noAccount: boolean) => void;
}

interface DispatchProps extends Omit<IntermediateDispatchProps, "onLoginWithoutAccount"> {
    /** Handler for logging in without an account. */
    onLoginWithoutAccount: () => void;
}

interface OwnProps extends Partial<RouteComponentProps> {}

export interface ConnectedProps extends StateProps, DispatchProps, OwnProps {}

const errorMessageMap = (error: string) => {
    switch (error) {
        case "Invalid login":
            return "Wrong email or password";
        case "Validation error":
            // This happens on sign up.
            return "This user already exists";
        case "Missing credentials":
            return "Wrong email or password";
        default:
            return userFriendlyErrorMessages(error);
    }
};

const mapStateToProps = (state: State): IntermediateStateProps => {
    const loginLoading = authRequestsSlice.login.selectors.selectLoading(state);
    const loadingErrorMessage = authRequestsSlice.login.selectors.selectErrorMessage(state);

    const signUpLoading = authRequestsSlice.signUp.selectors.selectLoading(state);
    const signUpErrorMessage = authRequestsSlice.signUp.selectors.selectErrorMessage(state);

    return {
        loading: loginLoading || signUpLoading,
        error: errorMessageMap(loadingErrorMessage) || errorMessageMap(signUpErrorMessage),
        noAccount: userSlice.selectors.selectNoAccount(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): IntermediateDispatchProps => ({
    onLogin: (data: AuthFormData) => dispatch(authRequestsSlice.login.actions.request(data)),
    onSignUp: (data: AuthFormData) => dispatch(authRequestsSlice.signUp.actions.request(data)),
    onLoginWithoutAccount: (noAccount: boolean) => {
        // If we're already in no-account mode, no need to trigger it again.
        // Otherwise, things happen and you actually end up getting kicked out of the app.
        //
        // And because of how all the redirection logic works, we have to do this check here
        // rather than in, say, the `authLoginWithoutAccount` saga.
        if (!noAccount) {
            dispatch(authRequestsSlice.loginWithoutAccount.actions.request());
        }
    }
});

const mergeProps = (
    stateProps: IntermediateStateProps,
    dispatchProps: IntermediateDispatchProps,
    // Need to pass through Own Props because of the router match props.
    ownProps: OwnProps
): ConnectedProps => {
    const {noAccount, ...otherStateProps} = stateProps;
    const {onLoginWithoutAccount, ...otherDispatchProps} = dispatchProps;

    const finalOnLoginWithoutAccount = () => {
        onLoginWithoutAccount(noAccount || false);
    };

    return {
        ...otherStateProps,
        ...otherDispatchProps,
        ...ownProps,
        onLoginWithoutAccount: finalOnLoginWithoutAccount
    };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps);
