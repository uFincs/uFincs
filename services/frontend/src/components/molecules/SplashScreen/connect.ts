import {connect} from "react-redux";
import {appSlice, State} from "store/";

interface StateProps {
    /** Whether or not the splash screen should be displayed. */
    isOpen?: boolean;
}

export interface ConnectedProps extends StateProps {}

const mapStateToProps = (state: State): StateProps => ({
    isOpen: appSlice.selectors.selectAppBootLoading(state)
});

export default connect(mapStateToProps);
