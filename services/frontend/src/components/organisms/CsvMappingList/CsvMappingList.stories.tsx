import type {Meta, StoryObj} from "@storybook/react";
import CsvMappingList from "./CsvMappingList";

const meta: Meta<typeof CsvMappingList> = {
    title: "Organisms/CSV Mapping List",
    component: CsvMappingList,
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
type Story = StoryObj<typeof CsvMappingList>;

/** The default view of `CsvMappingList`. */
export const Default: Story = {};

/** The editing view of `CsvMappingList`. */
export const Editing: Story = {
    args: {
        editing: true
    }
};
