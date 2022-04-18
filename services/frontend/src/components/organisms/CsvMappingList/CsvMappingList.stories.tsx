import React from "react";
import CsvMappingList from "./CsvMappingList";

export default {
    title: "Organisms/CSV Mapping List",
    component: CsvMappingList
};

const fields = ["Date", "Amount", "N/A", "Description", "Account"];

const sampleData = [
    ["7/21/2019", "1335.83", "-", "Payroll Deposit", "CANADA"],
    ["7/21/2019", "1335.83", "-", "Payroll Deposit", "CANADA"],
    ["7/21/2019", "1335.83", "-", "Payroll Deposit", "CANADA"],
    ["7/21/2019", "1335.83", "-", "Payroll Deposit", "CANADA"],
    ["7/21/2019", "1335.83", "-", "Payroll Deposit", "CANADA"]
];

/** The default view of `CsvMappingList`. */
export const Default = () => <CsvMappingList fields={fields} sampleData={sampleData} />;

/** The editing view of `CsvMappingList`. */
export const Editing = () => (
    <CsvMappingList editing={true} fields={fields} sampleData={sampleData} />
);
