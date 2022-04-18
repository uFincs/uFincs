import tableNames from "./tableNames";

// Foreign keys are stored on the table of the 'belongsTo' side of a 1-to-many association.
// As such, the foreign keys in here are organized by the table they are stored on.
//
// For example, a User hasMany Accounts, and an Account belongsTo a User. As such,
// the foreign `key` 'userId' is stored on the 'accounts' table.

// The `as` property is defined on the `hasMany` side of the relationship.

const foreignKeys = {
    [tableNames.ACCOUNTS]: {
        [tableNames.USERS]: {
            as: "accounts",
            key: "userId"
        }
    },
    [tableNames.FEEDBACK]: {
        [tableNames.USERS]: {
            as: "feedback",
            key: "userId"
        }
    },
    [tableNames.IMPORT_PROFILES]: {
        [tableNames.USERS]: {
            as: "importProfiles",
            key: "userId"
        }
    },
    [tableNames.IMPORT_PROFILE_MAPPINGS]: {
        [tableNames.IMPORT_PROFILES]: {
            as: "importProfileMappings",
            key: "importProfileId"
        }
    },
    [tableNames.IMPORT_RULES]: {
        [tableNames.USERS]: {
            as: "importRules",
            key: "userId"
        }
    },
    [tableNames.IMPORT_RULE_ACTIONS]: {
        [tableNames.IMPORT_RULES]: {
            as: "importRuleActions",
            key: "importRuleId"
        }
    },
    [tableNames.IMPORT_RULE_CONDITIONS]: {
        [tableNames.IMPORT_RULES]: {
            as: "importRuleConditions",
            key: "importRuleId"
        }
    },
    [tableNames.PREFERENCES]: {
        [tableNames.USERS]: {
            as: "preferences",
            key: "userId"
        }
    },
    [tableNames.RECURRING_TRANSACTIONS]: {
        [tableNames.ACCOUNTS]: {
            debit: {
                as: "debitAccountRecurringTransactions",
                key: "debitAccountId"
            },
            credit: {
                as: "creditAccountRecurringTransactions",
                key: "creditAccountId"
            }
        },
        [tableNames.USERS]: {
            as: "recurringTransactions",
            key: "userId"
        }
    },
    [tableNames.SUBSCRIPTIONS]: {
        [tableNames.USERS]: {
            as: "subscriptions",
            key: "userId"
        }
    },
    [tableNames.TRANSACTIONS]: {
        [tableNames.ACCOUNTS]: {
            // Note: These 1/2 keys are kept around for old migrations. They are _not_ currently used.
            "1": {
                as: "account1Transactions",
                key: "account1Id"
            },
            "2": {
                as: "account2Transactions",
                key: "account2Id"
            },
            debit: {
                as: "debitAccountTransactions",
                key: "debitAccountId"
            },
            credit: {
                as: "creditAccountTransactions",
                key: "creditAccountId"
            }
        },
        [tableNames.RECURRING_TRANSACTIONS]: {
            as: "transactions",
            key: "recurringTransactionId"
        }
    }
} as const;

export default foreignKeys;
