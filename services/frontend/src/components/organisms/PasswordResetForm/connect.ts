import {createMatchSelector} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {authRequestsSlice, State} from "store/";
import userFriendlyErrorMessages from "utils/userFriendlyErrorMessages";
import ScreenUrls from "values/screenUrls";

export interface PasswordResetFormData {
    password: string;
    confirmPassword: string;
}

interface IntermediateStateProps {
    /** The error message of the submitted request. */
    error?: string;

    /** Whether or not the submitted request is progress and the form should be loading. */
    loading?: boolean;

    /** [intermediate] The reset token taken from the URL.
     *  Intermediate because it just gets passed straight to `onSubmit`
     *  instead of going into the component. */
    token?: string;
}

interface StateProps extends Omit<IntermediateStateProps, "token"> {}

interface IntermediateDispatchProps {
    /** [intermediate] Handler for when the form submits. */
    onSubmit: (data: PasswordResetFormData, token: string | undefined) => void;
}

interface DispatchProps {
    /** Handler for when the form submits. */
    onSubmit: (data: PasswordResetFormData) => void;
}

const errorMessageMap = (error: string) => {
    const lowercaseError = error.toLowerCase();

    if (lowercaseError.includes("token") || lowercaseError.includes("no record found")) {
        return "Password reset token expired or invalid";
    } else {
        return userFriendlyErrorMessages(error);
    }
};

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (): ((state: State) => IntermediateStateProps) => {
    const matchSelector = createMatchSelector<any, {token: string}>(ScreenUrls.PASSWORD_RESET);

    return (state: State): IntermediateStateProps => {
        const match = matchSelector(state);
        const errorMessage = authRequestsSlice.passwordReset.selectors.selectErrorMessage(state);

        return {
            error: errorMessageMap(errorMessage),
            loading: authRequestsSlice.passwordReset.selectors.selectLoading(state),
            token: match?.params?.token
        };
    };
};

const mapDispatchToProps = (dispatch: Dispatch): IntermediateDispatchProps => ({
    onSubmit: (data, token) =>
        dispatch(
            authRequestsSlice.passwordReset.actions.request({
                password: data.password,
                token
            })
        )
});

const mergeProps = (
    stateProps: IntermediateStateProps,
    dispatchProps: IntermediateDispatchProps
): ConnectedProps => {
    const {token, ...otherStateProps} = stateProps;

    const finalOnSubmit = (data: PasswordResetFormData) => {
        dispatchProps.onSubmit(data, token);
    };

    return {
        ...otherStateProps,
        onSubmit: finalOnSubmit
    };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps);
