import {actions} from "@storybook/addon-actions";
import React from "react";
import CsvMappingTable from "./CsvMappingTable";

export default {
    title: "Organisms/CSV Mapping Table",
    component: CsvMappingTable
};

const fields = ["Date", "Amount", "N/A", "Description", "Account"];

const sampleData = [
    ["7/21/2019", "1335.83", "-", "Payroll Deposit", "CANADA"],
    ["7/21/2019", "1335.83", "-", "Payroll Deposit", "CANADA"],
    ["7/21/2019", "1335.83", "-", "Payroll Deposit", "CANADA"],
    ["7/21/2019", "1335.83", "-", "Payroll Deposit", "CANADA"],
    ["7/21/2019", "1335.83", "-", "Payroll Deposit", "CANADA"]
];

const tableActions = actions("onFieldChange");

/** The default view of `CsvMappingTable`. */
export const Default = () => <CsvMappingTable fields={fields} sampleData={sampleData} />;

/** The editing view of `CsvMappingTable`. */
export const Editing = () => (
    <CsvMappingTable editing={true} fields={fields} sampleData={sampleData} {...tableActions} />
);
