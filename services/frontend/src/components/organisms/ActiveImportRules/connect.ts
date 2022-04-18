import {push} from "connected-react-router";
import {ImportRule} from "models";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {crossSliceSelectors, transactionsImportSlice, State} from "store/";
import {DerivedAppModalUrls} from "values/screenUrls";

interface StateProps {
    /** Whether or not the current rules are enabled. */
    areRulesEnabled: boolean;

    /** The set of currently active import rules. */
    importRules: Array<ImportRule>;
}

interface DispatchProps {
    /** Handler for opening the Import Rule creation form. */
    onAddRule: () => void;

    /** Handler for when the "Are Rules Active?" checkbox is toggled/clicked. */
    onToggleRules: (areEnabled: boolean) => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    areRulesEnabled: transactionsImportSlice.selectors.selectAreRulesEnabled(state),
    importRules: crossSliceSelectors.transactionsImport.selectActiveRules(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onAddRule: () => dispatch(push(DerivedAppModalUrls.IMPORT_RULE_FORM)),
    onToggleRules: (areEnabled: boolean) =>
        dispatch(transactionsImportSlice.actions.setAreRulesEnabled(areEnabled))
});

export default connect(mapStateToProps, mapDispatchToProps);
