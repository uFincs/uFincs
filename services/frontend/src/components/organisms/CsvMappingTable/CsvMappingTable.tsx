import classNames from "classnames";
import React from "react";
import {LabelledSelectInput} from "components/molecules";
import {ImportProfileMappingField} from "models/";
import {CsvFileContents} from "utils/types";
import {mappableFieldOptions} from "values/importProfileFields";
import "./CsvMappingTable.scss";

interface CsvMappingTableProps {
    /** Custom class name. */
    className?: string;

    /** Whether or not we should display inputs for picking which fields belong to which columns
     *  (as opposed to the default behavior, which is displaying existing mapping of fields
     *   to columns). */
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

/** The (desktop) table that enables mapping a series of CSV columns to uFincs fields for the
 *  purposes of creating an ImportProfile. */
const CsvMappingTable = ({
    className,
    editing = false,
    fields = [],
    sampleData = [],
    onFieldChange
}: CsvMappingTableProps) => {
    const columnHeaders = [...new Array(sampleData?.[0]?.length)].map((_, index) => (
        <th key={index} id={`CsvMappingTable-column-${index + 1}`}>
            Column {index + 1}
        </th>
    ));

    const columnFields = fields.map((field, index) => <th key={index}>{field}</th>);

    const columnFieldInputs = fields.map((field, index) => (
        <th key={index}>
            <LabelledSelectInput
                data-testid="csv-mapping-table-input"
                aria-labelledby={`CsvMappingTable-column-${index + 1}`}
                label=""
                value={field}
                values={mappableFieldOptions}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    onFieldChange?.(index, e.target.value as ImportProfileMappingField)
                }
            />
        </th>
    ));

    const rows = sampleData.map((rowData, index) => (
        <tr className="CsvMappingTable-row" key={index}>
            <td className="CsvMappingTable-row-cell">Row {index + 1}</td>

            {rowData.map((data, index) => (
                <td key={index}>{data}</td>
            ))}
        </tr>
    ));

    return (
        <table className={classNames("CsvMappingTable", className)} data-testid="csv-mapping-table">
            <thead className="CsvMappingTable-head">
                <tr className="CsvMappingTable-head-row CsvMappingTable-head-columns">
                    <th></th>
                    {columnHeaders}
                </tr>

                <tr className="CsvMappingTable-head-row CsvMappingTable-head-fields">
                    <th className="CsvMappingTable-head-sample-data">Sample Data</th>

                    {editing ? columnFieldInputs : columnFields}
                </tr>
            </thead>

            <tbody className="CsvMappingTable-body">{rows}</tbody>
        </table>
    );
};

export default CsvMappingTable;
