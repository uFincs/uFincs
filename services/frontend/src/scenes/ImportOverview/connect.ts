import {push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {ImportRule} from "models/";
import {crossSliceSelectors, State} from "store/";
import {DerivedAppModalUrls} from "values/screenUrls";

interface StateProps {
    /** The set of import rules to display. */
    importRules: Array<ImportRule>;
}

interface DispatchProps {
    /** Handler for adding a new rule. */
    onAddRule: () => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    importRules: crossSliceSelectors.importRules.selectImportRules(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onAddRule: () => dispatch(push(DerivedAppModalUrls.IMPORT_RULE_FORM))
});

export default connect(mapStateToProps, mapDispatchToProps);
