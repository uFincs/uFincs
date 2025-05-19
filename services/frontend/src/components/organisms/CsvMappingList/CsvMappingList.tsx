import classNames from "classnames";
import * as React from "react";
import {LabelledSelectInput} from "components/molecules";
import {ImportProfileMappingField} from "models/";
import {CsvFileContents} from "utils/types";
import {mappableFieldOptions} from "values/importProfileFields";
import "./CsvMappingList.scss";

interface CsvMappingListProps {
    /** Custom class name. */
    className?: string;

    /** Whether or not to not to show inputs for picking which fields belong to which columns. */
    editing?: boolean;

    /** OK, this is kind of stupid, but it's a holdover from the pre-redesign implementation.
     *  Basically, the Existing Profile section passes in the fields as labels, whereas the
     *  the New Profile section passes the fields in as ImportProfileMappingFields.
     *
     *  That is, when `editing === true`, the fields are ImportProfileMappingField, whereas
     *  when `editing === false`, the fields are labels.
     *
     *  This gets sorted out automatically in terms of usage since the AutocompleteInput needs
     *  the ImportProfileMappingFields whereas we just display fields as labels otherwise
     *  (where the 'otherwise' is handled by the editing state). */
    fields: Array<string | ImportProfileMappingField>;

    /** A sample (first 5 rows) of the CSV file.  */
    sampleData: CsvFileContents;

    /** Handler for propagating a field change for the ImportProfile back to the store. */
    onFieldChange?: (index: number, value: ImportProfileMappingField) => void;
}

/** The (mobile) list that enables mapping a series of CSV columns to uFincs fields for the
 *  purposes of creating an ImportProfile. */
const CsvMappingList = ({
    className,
    editing = false,
    fields = [],
    sampleData = [],
    onFieldChange
}: CsvMappingListProps) => {
    const sections = fields.map((field, index) => {
        const columnData = sampleData.map((rowData) => rowData[index]);

        return (
            <CsvListSection
                key={index}
                editing={editing}
                field={field}
                sampleColumnData={columnData}
                sectionIndex={index}
                onFieldChange={onFieldChange}
            />
        );
    });

    return (
        <div className={classNames("CsvMappingList", className)} data-testid="csv-mapping-list">
            {sections}
        </div>
    );
};

export default CsvMappingList;

/* Other Components */

interface CsvListSectionProps {
    /** Whether or not to not to show inputs for picking which fields belong to which columns. */
    editing?: boolean;

    /** The value of the field for this column. */
    field: string | ImportProfileMappingField;

    /** All of the data in a single column of the sample data. */
    sampleColumnData: Array<string>;

    /** The (0-indexed) index of the column. */
    sectionIndex: number;

    /** Handler for propagating a field change for the ImportProfile back to the store. */
    onFieldChange?: (index: number, value: ImportProfileMappingField) => void;
}

/** A section representing the mapping of a single ImportProfile field to a single column of the CSV. */
const CsvListSection = ({
    editing = false,
    field,
    sampleColumnData = [],
    sectionIndex,
    onFieldChange
}: CsvListSectionProps) => {
    const rows = sampleColumnData.map((data, index) => (
        <div className="CsvListSection-sample-data-row" key={index}>
            <p>Row {index + 1}:</p>
            <p className="CsvListSection-sample-data-row-data">{data}</p>
        </div>
    ));

    return (
        <div className={classNames("CsvListSection", {"CsvListSection--editing": editing})}>
            <div className="CsvListSection-field-container">
                {editing ? (
                    <LabelledSelectInput
                        data-testid="csv-mapping-list-input"
                        label={`Column ${sectionIndex + 1}`}
                        value={field}
                        values={mappableFieldOptions}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                            onFieldChange?.(
                                sectionIndex,
                                e.target.value as ImportProfileMappingField
                            );
                        }}
                    />
                ) : (
                    <>
                        <p className="CsvListSection-column-number" id="CsvMappingList-column-1">
                            Column {sectionIndex + 1}
                        </p>

                        <p className="CsvListSection-field">{field}</p>
                    </>
                )}
            </div>

            <div className="CsvListSection-sample-data">
                <p className="CsvListSection-sample-data-header">Sample Data</p>

                {rows}
            </div>
        </div>
    );
};
