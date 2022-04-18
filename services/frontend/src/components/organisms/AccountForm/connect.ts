import {createMatchSelector, push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {Account} from "models/";
import {accountsRequestsSlice, crossSliceSelectors, State} from "store/";
import {DerivedAppModalUrls} from "values/screenUrls";

interface StateProps {
    /** The account that is being edited. */
    accountForEditing?: Account;

    /** Whether or not the form should be editing or creating an account.
     *  Need this flag separate from accountForEditing to handle the case where the user
     *  tries to edit an account that doesn't exist (i.e. the ID in the url is wrong). */
    isEditing: boolean;
}

interface IntermediateDispatchProps {
    /** Callback for the editing mode fallback to redirect to the creation form. */
    onNewAccount: () => void;

    /** [intermediate] Callback to submit the form.
     *  `isEditing` is a flag to specify either updating or creating on submission. */
    onSubmit: (account: Account, isEditing: boolean) => void;
}

interface DispatchProps extends IntermediateDispatchProps {
    /** Callback to submit the form. */
    onSubmit: (account: Account) => void;
}

// Because we're using mergeProps, we need to explicitly specify and pass through OwnProps
// here instead of in AccountFormProps.
interface OwnProps {
    /** Custom class name. */
    className?: string;

    /** Callback to close the form. */
    onClose: () => void;
}

export interface ConnectedProps extends StateProps, DispatchProps, OwnProps {}

const mapStateToProps = (): ((state: State) => StateProps) => {
    const matchSelector = createMatchSelector<any, {id: string}>(
        DerivedAppModalUrls.ACCOUNT_FORM_EDITING
    );

    return (state: State): StateProps => {
        const match = matchSelector(state);
        const accounts = crossSliceSelectors.accounts.selectAccountsById(state);

        const id = match?.params?.id;
        const accountForEditing = id ? accounts[id] : undefined;

        return {
            accountForEditing,
            isEditing: !!id
        };
    };
};

const mapDispatchToProps = (dispatch: Dispatch): IntermediateDispatchProps => ({
    onNewAccount: () => dispatch(push(DerivedAppModalUrls.ACCOUNT_FORM)),
    onSubmit: (account: Account, isEditing: boolean) => {
        account.convertOpeningBalanceToCents();
        account.convertInterestToMillipercents();

        if (isEditing) {
            dispatch(accountsRequestsSlice.update.actions.request(account));
        } else {
            dispatch(accountsRequestsSlice.create.actions.request(account));
        }
    }
});

const mergeProps = (
    stateProps: StateProps,
    dispatchProps: IntermediateDispatchProps,
    ownProps: OwnProps
): ConnectedProps => {
    const {onSubmit, ...otherDispatchProps} = dispatchProps;

    // Need isEditing to determine whether or not to create or update the account
    // when submitting the form.
    const finalOnSubmit = (account: Account) => {
        onSubmit(account, stateProps.isEditing);
    };

    return {
        ...stateProps,
        ...otherDispatchProps,
        ...ownProps,
        onSubmit: finalOnSubmit
    };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps);
