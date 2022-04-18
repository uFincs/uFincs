export const STEP_INDICES = {
    CHOOSE_ACCOUNT: 0,
    CHOOSE_FILE: 1,
    MAP_FIELDS: 2,
    ADJUST_TRANSACTIONS: 3,
    COMPLETE_IMPORT: 4
};

const transactionsImportSteps = [
    {
        label: "Choose Account",
        completedLabel: (account = "") => `Account: ${account}`
    },
    {
        label: "Choose CSV File",
        completedLabel: (file = "") => `File: ${file}`
    },
    {
        label: "Map CSV Fields",
        completedLabel: (profile = "") => `Import Profile: ${profile}`
    },
    {
        label: "Adjust Transactions",
        completedLabel: () => "Adjust Transactions"
    },
    {
        label: "Complete Import",
        completedLabel: () => "Complete Import"
    }
];

export default transactionsImportSteps;
