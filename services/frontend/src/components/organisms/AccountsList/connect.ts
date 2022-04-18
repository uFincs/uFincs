import {push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {Id} from "utils/types";
import {DerivedAppModalUrls, DerivedAppScreenUrls} from "values/screenUrls";

interface DispatchProps {
    /** Allows navigating to an account by its ID, for the keyboard navigation. */
    navigateToAccount: (id: Id) => void;

    /** Handler for adding a new account when there are no accounts at all. */
    onAddAccount: () => void;
}

export interface ConnectedProps extends DispatchProps {}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    navigateToAccount: (id: Id) => dispatch(push(`${DerivedAppScreenUrls.ACCOUNTS}/${id}`)),
    onAddAccount: () => dispatch(push(DerivedAppModalUrls.ACCOUNT_FORM))
});

export default connect(null, mapDispatchToProps);
