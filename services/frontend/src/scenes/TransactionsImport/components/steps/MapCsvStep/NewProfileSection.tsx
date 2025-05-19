import {Dispatch} from "@reduxjs/toolkit";
import * as React from "react";
import {connect} from "react-redux";
import {LabelledInput} from "components/molecules";
import {CsvMappingList, CsvMappingTable} from "components/organisms";
import {ImportProfileMappingField} from "models/";
import {transactionsImportSlice, State} from "store/";
import {CsvFileContents} from "utils/types";
import {StepNavigationFooter} from "../..";

/* Connect */

interface StateProps {
    /** The fields for the new import profile. */
    fields: Array<ImportProfileMappingField>;

    /** The name for the new import profile. */
    profileName: string;

    /** The sample (first 5 rows) of the user's CSV file. */
    sampleData: CsvFileContents;
}

interface DispatchProps {
    /** Handler for when a field gets changed, */
    onFieldChange: (index: number, value: ImportProfileMappingField) => void;

    /** Handler for when the name changes.
     *  Note that it's already set up as an input handler, cause laziness. */
    onProfileNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    fields: transactionsImportSlice.selectors.selectNewImportProfileFields(state),
    profileName: transactionsImportSlice.selectors.selectNewImportProfileName(state),
    sampleData: transactionsImportSlice.selectors.selectFileContentsSample(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    onFieldChange: (index: number, value: ImportProfileMappingField) =>
        dispatch(transactionsImportSlice.actions.updateNewImportProfileField({index, value})),
    onProfileNameChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        dispatch(transactionsImportSlice.actions.setNewImportProfileName(e.target.value))
});

/* Component */

interface NewProfileSectionProps extends ConnectedProps {}

/** The section for creating a new import profile during the "Map CSV" step. */
const NewProfileSection = ({
    fields = [],
    profileName,
    sampleData,
    onFieldChange,
    onProfileNameChange
}: NewProfileSectionProps) => (
    <>
        <div className="MapCsvStep-section NewProfileSection">
            <LabelledInput
                containerClassName="MapCsvStep-input"
                data-testid="map-csv-step-new-profile-name-input"
                label="Name this format"
                placeholder="Pick a name for this CSV format"
                value={profileName}
                onChange={onProfileNameChange}
            />

            <h3>Match columns to fields</h3>

            <CsvMappingTable
                editing={true}
                fields={fields}
                sampleData={sampleData}
                onFieldChange={onFieldChange}
            />

            <CsvMappingList
                editing={true}
                fields={fields}
                sampleData={sampleData}
                onFieldChange={onFieldChange}
            />
        </div>

        <StepNavigationFooter />
    </>
);

export default connect(mapStateToProps, mapDispatchToProps)(NewProfileSection);
