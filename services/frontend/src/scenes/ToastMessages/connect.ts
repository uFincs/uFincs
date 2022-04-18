import {PayloadActionCreator, Dispatch} from "@reduxjs/toolkit";
import {connect} from "react-redux";
import {toastsSlice, State} from "store/";
import {ToastData} from "structures/";

interface StateProps {
    /** The set of toast data from the store. */
    toasts: Array<ToastData>;
}

interface DispatchProps {
    /** Handler for dispatching the actions from the toasts. */
    onToastAction: (action: PayloadActionCreator<void>) => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    toasts: toastsSlice.selectors.selectToasts(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onToastAction: (action) => dispatch(action())
});

export default connect(mapStateToProps, mapDispatchToProps);
