import {push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {ListItemProps} from "components/molecules/ListItem";
import {ImportRuleActionData, ImportRuleConditionData} from "models/";
import {crossSliceSelectors, importRulesSlice, State} from "store/";
import {Id} from "utils/types";
import {DerivedAppModalUrls} from "values/screenUrls";

interface StateProps {
    /** The set of actions to display. */
    actions: Array<ImportRuleActionData>;

    /** The set of conditions to display. */
    conditions: Array<ImportRuleConditionData>;

    /** The timestamp of when the rule was last updated.
     *
     *  Note: This is actually only needed by `TransactionsTableRow`, but we map it here
     *  for convenience's sake. */
    updatedAt: string;
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
    /** [intermediate] The ID of the Import Rule to connect to. */
    id: Id;
}

export interface ConnectedProps extends StateProps, DispatchProps, OwnProps {}

const mapStateToProps = (_: State, ownProps: OwnProps): ((state: State) => StateProps) => {
    const {id} = ownProps;

    const selectRule = crossSliceSelectors.importRules.selectImportRule(id);

    return (state: State) => {
        const rule = selectRule(state);

        return {
            actions: rule.importRuleActions,
            conditions: rule.importRuleConditions,
            updatedAt: rule.updatedAt
        };
    };
};

const mapDispatchToProps = (dispatch: Dispatch, ownProps: OwnProps): DispatchProps => ({
    onClick: () => dispatch(push(`${DerivedAppModalUrls.IMPORT_RULE_FORM}/${ownProps.id}`)),
    onDelete: () => dispatch(importRulesSlice.actions.undoableDestroyImportRule(ownProps.id)),
    onEdit: () => dispatch(push(`${DerivedAppModalUrls.IMPORT_RULE_FORM}/${ownProps.id}`))
});

export default connect(mapStateToProps, mapDispatchToProps);
