import {actions} from "@storybook/addon-actions";
import type {Meta, StoryObj} from "@storybook/react";
import CsvMappingTable from "./CsvMappingTable";

const meta: Meta<typeof CsvMappingTable> = {
    title: "Organisms/CSV Mapping Table",
    component: CsvMappingTable,
    args: {
        fields: ["Date", "Amount", "N/A", "Description", "Account"],
        sampleData: [
            ["7/21/2019", "1335.83", "-", "Payroll Deposit", "CANADA"],
            ["7/21/2019", "1335.83", "-", "Payroll Deposit", "CANADA"],
            ["7/21/2019", "1335.83", "-", "Payroll Deposit", "CANADA"],
            ["7/21/2019", "1335.83", "-", "Payroll Deposit", "CANADA"],
            ["7/21/2019", "1335.83", "-", "Payroll Deposit", "CANADA"]
        ]
    }
};

export default meta;
type Story = StoryObj<typeof CsvMappingTable>;

/** The default view of `CsvMappingTable`. */
export const Default: Story = {};

/** The editing view of `CsvMappingTable`. */
export const Editing: Story = {
    args: {
        editing: true
    },
    parameters: {
        ...actions("onFieldChange")
    }
};
