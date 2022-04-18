import {ImportProfileMapping} from "models/";

// We use an "N/A" value so that users actually have a value to assign to fields they don't
// care about. Even though these N/A values get stored as empty strings in the backend/store.
export const emptyFieldValue = "N/A";

const mappableFieldsWithNA = [emptyFieldValue, ...ImportProfileMapping.MAPPABLE_FIELDS] as const;

export const mappableFieldLabels = {
    "": "N/A",
    [emptyFieldValue]: "N/A",
    targetAccount: "Account",
    amount: "Amount",
    date: "Date",
    description: "Description",
    type: "Type"
} as const;

// These are the suggestions for the field inputs when creating a new Import Profile.
export const mappableFieldOptions = mappableFieldsWithNA.map((field) => ({
    label: mappableFieldLabels[field],
    value: field
}));
