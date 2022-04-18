import {connect} from "react-redux";
import {Dispatch} from "redux";
import {AuthFormData} from "components/molecules/AuthForm";
import {authRequestsSlice, State} from "store/";
import userFriendlyErrorMessages from "utils/userFriendlyErrorMessages";

interface StateProps {
    error?: string;
    loading?: boolean;
}

interface DispatchProps {
    onSignUp: (data: AuthFormData) => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const errorMessageMap = (error: string) => {
    switch (error) {
        case "Validation error":
            return "This user already exists";
        default:
            return userFriendlyErrorMessages(error);
    }
};

const mapStateToProps = (state: State): StateProps => {
    const loading = authRequestsSlice.signUpFromNoAccount.selectors.selectLoading(state);
    const error = authRequestsSlice.signUpFromNoAccount.selectors.selectErrorMessage(state);

    return {
        loading,
        error: errorMessageMap(error)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onSignUp: (data: AuthFormData) =>
        dispatch(authRequestsSlice.signUpFromNoAccount.actions.request(data))
});

export default connect(mapStateToProps, mapDispatchToProps);
