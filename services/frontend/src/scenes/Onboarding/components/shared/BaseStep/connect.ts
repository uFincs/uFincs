import {connect} from "react-redux";
import {Dispatch} from "redux";
import {AccountData, AccountType, BulkEditableAccountProperty} from "models/";
import {onboardingSlice, State} from "store/";
import {Id} from "utils/types";

interface StateProps {
    /** The set of accounts for this step. */
    accounts: Array<AccountData>;

    /** The map indicating which accounts are selected. */
    selectedAccounts: Record<Id, boolean>;
}

interface DispatchProps {
    /** Handler for adding a new account. */
    onAddAccount: () => void;

    /** Handler for when one of the accounts becomes selected/deselected. */
    onSelectAccount: (id: Id, selected: boolean) => void;

    /** Handler for when one of the account's values changes. */
    onValueChange: (
        type: AccountType,
        id: Id,
        property: BulkEditableAccountProperty,
        value: string
    ) => void;
}

interface OwnProps {
    /** The type of the accounts that are shown in this step. */
    type: AccountType;
}

export interface ConnectedProps extends StateProps, DispatchProps, OwnProps {}

const mapStateToProps = (_: State, ownProps: OwnProps): ((state: State) => StateProps) => {
    const accountsSelector = onboardingSlice.selectors.selectAccountsByType(ownProps.type);

    return (state: State): StateProps => ({
        accounts: accountsSelector(state),
        selectedAccounts: onboardingSlice.selectors.selectSelectedIds(state)
    });
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps): DispatchProps => ({
    onAddAccount: () => dispatch(onboardingSlice.actions.newAccount(ownProps.type)),
    onSelectAccount: (id, selected) =>
        dispatch(onboardingSlice.actions.setAccountSelected({id, selected})),
    onValueChange: (type, id, property, value) =>
        dispatch(onboardingSlice.actions.updateAccount({id, type, property, newValue: value}))
});

export default connect(mapStateToProps, mapDispatchToProps);
