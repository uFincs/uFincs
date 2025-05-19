import {useMemo} from "react";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {LabelledSelectInput} from "components/molecules";
import {CsvMappingList, CsvMappingTable} from "components/organisms";
import {ImportProfile} from "models/";
import {crossSliceSelectors, transactionsImportSlice, State} from "store/";
import {CsvFileContents, Id} from "utils/types";
import {emptyFieldValue, mappableFieldLabels} from "values/importProfileFields";
import {StepNavigationFooter} from "../..";

/* Connect */

interface StateProps {
    /** The ID of the currently selected import profile. */
    importProfileId: Id;

    /** The full set of existing import profiles. */
    importProfiles: Array<ImportProfile>;

    /** The sample (first 5 rows) of the user's CSV file. */
    sampleData: CsvFileContents;
}

interface DispatchProps {
    /** Callback for saving the import profile ID to the store. */
    saveImportProfileId: (id: Id) => void;
}

interface ConnectedProps extends StateProps, DispatchProps {}

const mapStateToProps = (state: State): StateProps => ({
    importProfileId: transactionsImportSlice.selectors.selectImportProfileId(state),
    importProfiles: crossSliceSelectors.importProfiles.selectImportProfiles(state),
    sampleData: transactionsImportSlice.selectors.selectFileContentsSample(state)
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({
    saveImportProfileId: (id: Id) =>
        dispatch(transactionsImportSlice.actions.setImportProfileId(id))
});

/* Hooks */

/** Converts the import profiles into options for the select input. */
const useImportProfileOptions = (importProfiles: Array<ImportProfile>) =>
    useMemo(
        () => [
            // Add an empty option for users to be able to see the select input's placeholder.
            {label: "", value: ""},
            ...importProfiles.map(({id, name}) => ({label: name, value: id}))
        ],
        [importProfiles]
    );

/** Creates the array of fields where the index is the column of the CSV file and the value
 *  is the import profile fields (with the empty field value for display purposes). */
const useMappedFields = (
    importProfileId: Id,
    importProfiles: Array<ImportProfile>,
    sampleData: CsvFileContents
): Array<string> =>
    useMemo(() => {
        const importProfile = importProfiles.find(({id}) => id === importProfileId);

        if (importProfile) {
            // Since each item in `sampleData` is a row, we get the number of columns
            // by the length of the (first) row.
            const numberOfColumns = sampleData?.[0]?.length;
            const fields = new Array(numberOfColumns).fill(emptyFieldValue);

            importProfile.importProfileMappings.forEach((mapping) => {
                if (mapping.to) {
                    fields[parseInt(mapping.from)] = mappableFieldLabels[mapping.to];
                }
            });

            return fields;
        } else {
            return [];
        }
    }, [importProfileId, importProfiles, sampleData]);

/* Component */

interface ExistingProfileSectionProps extends ConnectedProps {}

/** The section for choosing an existing import profile during the "Map CSV" step. */
const ExistingProfileSection = ({
    importProfileId,
    importProfiles,
    sampleData,
    saveImportProfileId
}: ExistingProfileSectionProps) => {
    const profileOptions = useImportProfileOptions(importProfiles);
    const fields = useMappedFields(importProfileId, importProfiles, sampleData);

    return (
        <>
            <div className="MapCsvStep-section ExistingProfileSection">
                <LabelledSelectInput
                    containerClassName="MapCsvStep-input"
                    data-testid="map-csv-step-existing-profile-input"
                    label="Pick a format"
                    placeholder="Select a format"
                    value={importProfileId}
                    values={profileOptions}
                    onChange={(e) => saveImportProfileId(e.target.value)}
                />

                {importProfileId && (
                    <>
                        <h3>Column format</h3>

                        <CsvMappingTable fields={fields} sampleData={sampleData} />
                        <CsvMappingList fields={fields} sampleData={sampleData} />
                    </>
                )}
            </div>

            <StepNavigationFooter />
        </>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(ExistingProfileSection);
