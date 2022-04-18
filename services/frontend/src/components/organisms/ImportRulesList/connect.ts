import {push} from "connected-react-router";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {DerivedAppModalUrls} from "values/screenUrls";

interface DispatchProps {
    /** Handler for adding a new rule when there are no rules at all. */
    onAddRule: () => void;
}

export interface ConnectedProps extends DispatchProps {}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onAddRule: () => dispatch(push(DerivedAppModalUrls.IMPORT_RULE_FORM))
});

export default connect(null, mapDispatchToProps);
