import {createMatchSelector, push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {Account, AccountType, ImportRule} from "models/";
import {crossSliceSelectors, importRulesRequestsSlice, State} from "store/";
import {DerivedAppModalUrls} from "values/screenUrls";

interface StateProps {
    /** The map of all accounts by their type. Used for the Account option input. */
    accountsByType: Record<AccountType, Array<Account>>;

    /** The import rule that is being edited. */
    importRuleForEditing?: ImportRule;

    /** Whether or not the form should be editing or creating a transaction. */
    isEditing: boolean;
}

interface IntermediateDispatchProps {
    /** Callback for the editing mode fallback to redirect to the creation form. */
    onNewRule: () => void;

    /** [intermediate] Callback to submit the form.
     *  `isEditing` is a flag to specify either updating or creating on submission. */
    onSubmit: (importRule: ImportRule, isEditing: boolean) => void;
}

interface DispatchProps extends IntermediateDispatchProps {
    /** Callback to submit the form. */
    onSubmit: (importRule: ImportRule) => void;
}

interface OwnProps {
    /** Custom class name. */
    className?: string;

    /** Callback to close the form. */
    onClose: () => void;
}

export interface ConnectedProps extends StateProps, DispatchProps, OwnProps {}

const mapStateToProps = (): ((state: State) => StateProps) => {
    const ruleMatchSelector = createMatchSelector<any, {id: string}>(
        DerivedAppModalUrls.IMPORT_RULE_FORM_EDITING
    );

    return (state: State) => {
        const ruleMatch = ruleMatchSelector(state);
        const ruleId = ruleMatch?.params?.id;

        const importRules = crossSliceSelectors.importRules.selectImportRulesById(state);
        const importRuleForEditing = ruleId ? importRules?.[ruleId] : undefined;

        return {
            accountsByType: crossSliceSelectors.accounts.selectAccountsByType(state),
            importRuleForEditing,
            isEditing: !!ruleId
        };
    };
};

const mapDispatchToProps = (dispatch: Dispatch): IntermediateDispatchProps => ({
    onNewRule: () => dispatch(push(DerivedAppModalUrls.IMPORT_RULE_FORM)),
    onSubmit: (importRule: ImportRule, isEditing: boolean) => {
        if (isEditing) {
            dispatch(importRulesRequestsSlice.update.actions.request(importRule));
        } else {
            dispatch(importRulesRequestsSlice.create.actions.request(importRule));
        }
    }
});

const mergeProps = (
    stateProps: StateProps,
    dispatchProps: IntermediateDispatchProps,
    ownProps: OwnProps
): ConnectedProps => {
    const {onSubmit, ...otherDispatchProps} = dispatchProps;

    const finalOnSubmit = (importRule: ImportRule) => {
        onSubmit(importRule, stateProps.isEditing);
    };

    return {
        ...stateProps,
        ...otherDispatchProps,
        ...ownProps,
        onSubmit: finalOnSubmit
    };
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps);
