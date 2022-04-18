import {connect} from "react-redux";
import {Dispatch} from "redux";
import {transactionsImportSlice, State} from "store/";
import {ImportProfileSection} from "store/slices/transactionsImport.slice";

interface StateProps {
    /** The currently active tab/section. */
    activeTab: ImportProfileSection;

    /** Whether or not there are any existing import profiles.
     *  Used to control whether or not to show the "Use Existing Format" tab. */
    anyExistingProfiles: boolean;
}

interface DispatchProps {
    /** Handler for setting the active tab/section. */
    setActiveTab: (tab: ImportProfileSection) => void;
}

export interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    activeTab: transactionsImportSlice.selectors.selectActiveImportProfileSection(state),
    anyExistingProfiles: transactionsImportSlice.selectors.selectAnyExistingImportProfiles(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    setActiveTab: (tab: ImportProfileSection) =>
        dispatch(transactionsImportSlice.actions.setActiveImportProfileSection(tab))
});

export default connect(mapStateToProps, mapDispatchToProps);
