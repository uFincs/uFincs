import {push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {ListItemProps} from "components/molecules/ListItem";
import {accountsSlice, crossSliceSelectors, State} from "store/";
import {Id} from "utils/types";
import {DerivedAppModalUrls, DerivedAppScreenUrls} from "values/screenUrls";

interface StateProps {
    /** Whether or not this should be the active (selected) account. */
    active?: boolean;
}

interface DispatchProps {
    /** Handler for clicking the item itself (for viewing the account). */
    onClick: () => void;

    /** Handler for clicking on the `Delete` action. */
    onDelete: () => void;

    /** Handler for clicking on the `Edit` action. */
    onEdit: () => void;
}

interface OwnProps extends Omit<ListItemProps, "children" | "onClick" | "onDelete" | "onEdit"> {
    /** [intermediate] The ID of the Account to connect to. */
    id: Id;
}

export interface ConnectedProps extends StateProps, DispatchProps, OwnProps {}

const mapStateToProps = (_: State, ownProps: OwnProps): ((state: State) => StateProps) => {
    const {id} = ownProps;

    const matchSelector = crossSliceSelectors.router.createModalCompatibleMatchSelector<{
        id: string;
    }>(DerivedAppScreenUrls.ACCOUNT_DETAILS);

    return (state: State) => {
        const match = matchSelector(state);

        return {
            active: id === match?.params?.id
        };
    };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps): DispatchProps => ({
    onClick: () => dispatch(push(`${DerivedAppScreenUrls.ACCOUNTS}/${ownProps.id}`)),
    onDelete: () => dispatch(accountsSlice.actions.undoableDestroyAccount(ownProps.id)),
    onEdit: () => dispatch(push(`${DerivedAppModalUrls.ACCOUNT_FORM}/${ownProps.id}`))
});

export default connect(mapStateToProps, mapDispatchToProps);
