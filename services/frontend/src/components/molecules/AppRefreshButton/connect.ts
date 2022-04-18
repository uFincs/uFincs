import {connect} from "react-redux";
import {Dispatch} from "redux";
import {appSlice} from "store/";

interface DispatchProps {
    onClick: () => void;
}

export interface ConnectedProps extends DispatchProps {}

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onClick: () => dispatch(appSlice.actions.refreshApp())
});

export default connect(null, mapDispatchToProps);
