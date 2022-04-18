import {v4 as uuidv4} from "uuid";
import {
    Account,
    AccountData,
    ImportProfile,
    ImportProfileData,
    ImportProfileMapping,
    ImportProfileMappingData,
    ImportRule,
    ImportRuleData,
    ImportRuleAction,
    ImportRuleActionData,
    ImportRuleCondition,
    ImportRuleConditionData,
    PreferencePersistentFields,
    RecurringTransaction,
    RecurringTransactionData,
    Transaction,
    TransactionData,
    Preference
} from "models/";
import objectReduce from "utils/objectReduce";
import {Id} from "utils/types";
import DateService from "./DateService";

// Regex found from https://gist.github.com/bugventure/f71337e3927c34132b9a#gistcomment-2238943.
export const UUID_REGEX =
    /[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-4{1}[a-fA-F0-9]{3}-[89abAB]{1}[a-fA-F0-9]{3}-[a-fA-F0-9]{12}/g;

export type BackupDataFormat = {
    accounts: Record<Id, AccountData>;
    importProfiles: Record<Id, ImportProfileData>;
    importProfileMappings: Record<Id, ImportProfileMappingData>;
    importRules?: Record<Id, ImportRuleData>;
    importRuleActions?: Record<Id, ImportRuleActionData>;
    importRuleConditions?: Record<Id, ImportRuleConditionData>;
    preferences?: PreferencePersistentFields;
    recurringTransactions?: Record<Id, RecurringTransactionData>;
    transactions: Record<Id, TransactionData>;
};

export type BackupFileFormat = {
    version: string;
    encrypted: boolean;
    data: BackupDataFormat;
};

type BackupFile = {
    /** The contents should be a stringified version of BackupFileFormat. */
    contents: string;

    /** The name is the name of the file that the user will see when downloading the file. */
    name: string;
};

export const FILE_VERSIONS = ["1.0", "1.1", "1.2", "1.3"];
export const FILE_VERSION = FILE_VERSIONS[FILE_VERSIONS.length - 1];

/* START Versions Changelog

- 1.0: Initial version.
- 1.1: Added the `recurringTransactions` object.
- 1.2: Added the `importRules`, `importRuleActions`, and `importRuleConditions` objects.
- 1.3: Added the persistent `preference` fields.

END Versions Changelog */

export default class BackupService {
    /** Creates a backup file given a copy of the store data to backup. */
    public static createBackupFile(
        data: BackupDataFormat,
        options: {encrypted?: boolean; fileVersion?: string} = {
            encrypted: false,
            fileVersion: FILE_VERSION
        }
    ): BackupFile {
        const contents: BackupFileFormat = {
            version: options.fileVersion || FILE_VERSION,
            encrypted: options.encrypted || false,
            data
        };

        const name = BackupService._generateFileName(options.encrypted || false);

        return {
            contents: JSON.stringify(contents),
            name
        };
    }

    /** Parses a backup file into the format that can be restored to the app. */
    public static async parseBackupFile(file: Blob): Promise<BackupFileFormat> {
        let rawContents = await readFile(file);

        let contents: BackupFileFormat | null = null;

        try {
            // If the user gives us something that isn't a JSON file, it's gonna puke.
            contents = JSON.parse(rawContents) as BackupFileFormat;

            // Because we now have encrypted values that can reference IDs (i.e. ImportRuleAction.value),
            // we _can not_ do the ID rewriting here if the file is encrypted. If we did, then the
            // encrypted ID values would be completely destroyed.
            //
            // As such, we need to just parse the file as normal and expect the caller to call
            // `rewriteIdsAfterDecryption` once the caller has decrypted the file contents.
            if (!contents.encrypted) {
                // Rewrite all of the IDs with new IDs so that duplicate IDs can never happen.
                // This is mostly the case when trying to restore a backup to a different user account,
                // where the wiping of the user's data won't remove old data that has the old IDs.
                rawContents = BackupService._rewriteIds(rawContents);
            }

            contents = JSON.parse(rawContents) as BackupFileFormat;
        } catch {
            throw new Error("Invalid backup file");
        }

        BackupService._validateFile(contents);

        let {
            accounts,
            importProfiles,
            importProfileMappings,
            importRules = {},
            importRuleActions = {},
            importRuleConditions = {},
            preferences = Preference.DEFAULT_PREFERENCES,
            recurringTransactions = {},
            transactions
        } = contents.data;

        const version = parseFloat(contents.version);

        try {
            // Make sure to extract only the valid data properties for each model, to further guard
            // against potential errors/tampering by the user.
            accounts = objectReduce(accounts, (x) => Account.extractDataFields(x));
            transactions = objectReduce(transactions, (x) => Transaction.extractDataFields(x));

            importProfiles = objectReduce(importProfiles, (x) =>
                ImportProfile.extractDataFields(x)
            );

            importProfileMappings = objectReduce(importProfileMappings, (x) =>
                ImportProfileMapping.extractDataFields(x)
            );

            if (version >= 1.1) {
                recurringTransactions = objectReduce(recurringTransactions, (x) =>
                    RecurringTransaction.extractDataFields(x)
                );
            }

            if (version >= 1.2) {
                importRules = objectReduce(importRules, (x) => ImportRule.extractDataFields(x));

                importRuleActions = objectReduce(importRuleActions, (x) =>
                    ImportRuleAction.extractDataFields(x)
                );

                importRuleConditions = objectReduce(importRuleConditions, (x) =>
                    ImportRuleCondition.extractDataFields(x)
                );
            }

            if (version >= 1.3) {
                preferences = Preference.extractDataFields(preferences);
            }
        } catch (e) {
            throw new Error(`Invalid backup file: ${e.message}`);
        }

        contents.data = {
            accounts,
            importProfiles,
            importProfileMappings,
            importRules,
            importRuleActions,
            importRuleConditions,
            preferences,
            recurringTransactions,
            transactions
        };

        return contents;
    }

    /** This is some jank...
     *
     *  Basically, with the introduction of the Import Rules (specifically, Import Rule Actions),
     *  there now exists a case where IDs can be encrypted values. That is, the `value` property
     *  of an `ImportRuleAction` can hold an account ID value. However, since it's now a 'key' per-se,
     *  it is treated as just a regular value and is encrypted as such.
     *
     *  However, this poses a problem with the `rewriteIds` call in `parseBackupFile`: for an encrypted
     *  file, it'll rewrite the primary IDs for each object, but not the action values. As such,
     *  we have to defer the ID rewriting until the data has been decrypted. */
    public static rewriteIdsAfterDecryption(data: BackupDataFormat, fileVersion: string) {
        // We just need a 'file' to match the interface of `parseBackupFile`.
        const {contents} = BackupService.createBackupFile(data, {encrypted: false, fileVersion});
        const blob = new Blob([contents], {type: "application/json"});

        return BackupService.parseBackupFile(blob);
    }

    /** Validates that the data is actually valid app data, and not a bunch of mumbo-jumbo.
     *  And by mumbo-jumbo, I mean that it prevents against the user toggling the `encrypted` flag
     *  of an encrypted file, which would cause certain fields (namely, numbers) to be obviously wrong. */
    public static validateData(data: BackupDataFormat, rawVersion: string): BackupDataFormat {
        const version = parseFloat(rawVersion);

        let {
            accounts,
            importProfiles,
            importProfileMappings,
            importRules = {},
            importRuleActions = {},
            importRuleConditions = {},
            preferences = Preference.DEFAULT_PREFERENCES,
            recurringTransactions = {},
            transactions
        } = data;

        accounts = objectReduce(accounts, (x) => {
            try {
                return new Account(x).validate();
            } catch (e) {
                throw new Error(`Invalid backup file: ${e.message} for account ${x.id}`);
            }
        });

        transactions = objectReduce(transactions, (x) => {
            try {
                return new Transaction(x).validate();
            } catch (e) {
                throw new Error(`Invalid backup file: ${e.message} for transaction ${x.id}`);
            }
        });

        importProfiles = objectReduce(importProfiles, (x) => {
            try {
                return new ImportProfile(x).validate();
            } catch (e) {
                throw new Error(`Invalid backup file: ${e.message} for import profile ${x.id}`);
            }
        });

        importProfileMappings = objectReduce(
            importProfileMappings,
            (x) => new ImportProfileMapping(x)
        );

        if (version >= 1.1) {
            recurringTransactions = objectReduce(recurringTransactions, (x) => {
                try {
                    return new RecurringTransaction(x).validate();
                } catch (e) {
                    throw new Error(
                        `Invalid backup file: ${e.message} for recurring transaction ${x.id}`
                    );
                }
            });
        }

        if (version >= 1.2) {
            importRules = objectReduce(importRules, (x) => {
                try {
                    return new ImportRule(x).validate({ignoreDerivedProperties: true});
                } catch (e) {
                    throw new Error(`Invalid backup file: ${e.message} for import rule ${x.id}`);
                }
            });

            importRuleActions = objectReduce(importRuleActions, (x) => {
                try {
                    return new ImportRuleAction(x).validate();
                } catch (e) {
                    throw new Error(
                        `Invalid backup file: ${e.message} for import rule action ${x.id}`
                    );
                }
            });

            importRuleConditions = objectReduce(importRuleConditions, (x) => {
                try {
                    return new ImportRuleCondition(x).validate();
                } catch (e) {
                    throw new Error(
                        `Invalid backup file: ${e.message} for import rule condition ${x.id}`
                    );
                }
            });
        }

        if (version >= 1.3) {
            try {
                new Preference(preferences).validate();
            } catch (e) {
                throw new Error(`Invalid backup file: ${e.message} for preferences`);
            }
        }

        return {
            accounts,
            importProfiles,
            importProfileMappings,
            importRules,
            importRuleActions,
            importRuleConditions,
            preferences,
            recurringTransactions,
            transactions
        };
    }

    static _generateFileName(encrypted: boolean): string {
        const date = DateService.getTodayAsUTCString();

        if (encrypted) {
            return `ufincs-encrypted-backup-${date}.json`;
        } else {
            return `ufincs-backup-${date}.json`;
        }
    }

    /** Validates the file contents matches a minimum amount of a correct format. */
    static _validateFile(contents: BackupFileFormat): void {
        if (!FILE_VERSIONS.includes(contents?.version)) {
            throw new Error("Invalid backup file: missing or invalid value for 'version'");
        } else if (contents.encrypted !== false && contents.encrypted !== true) {
            throw new Error("Invalid backup file: invalid value for 'encrypted'");
        } else if (!contents?.data) {
            throw new Error("Invalid backup file: missing 'data'");
        } else {
            const {data} = contents;

            if (!data?.accounts) {
                throw new Error("Invalid backup file: missing 'accounts'");
            }

            if (!data?.importProfiles) {
                throw new Error("Invalid backup file: missing 'importProfiles'");
            }

            if (!data?.importProfileMappings) {
                throw new Error("Invalid backup file: missing 'importProfileMappings'");
            }

            if (!data?.transactions) {
                throw new Error("Invalid backup file: missing 'transactions'");
            }

            const {accounts, importProfiles, importProfileMappings, transactions} = data;

            if (
                typeof accounts !== "object" ||
                Array.isArray(accounts) ||
                typeof importProfiles !== "object" ||
                Array.isArray(importProfiles) ||
                typeof importProfileMappings !== "object" ||
                Array.isArray(importProfileMappings) ||
                typeof transactions !== "object" ||
                Array.isArray(transactions)
            ) {
                throw new Error("Invalid backup file: invalid 'data'");
            }
        }

        const version = parseFloat(contents.version);

        if (version >= 1.1) {
            const {data} = contents;

            if (!data?.recurringTransactions) {
                throw new Error("Invalid backup file: missing 'recurringTransactions'");
            }

            const {recurringTransactions} = data;

            if (typeof recurringTransactions !== "object" || Array.isArray(recurringTransactions)) {
                throw new Error("Invalid backup file: invalid 'data");
            }
        }

        if (version >= 1.2) {
            const {data} = contents;

            if (!data?.importRules) {
                throw new Error("Invalid backup file: missing 'importRules'");
            }

            if (!data?.importRuleActions) {
                throw new Error("Invalid backup file: missing 'importRuleActions'");
            }

            if (!data?.importRuleConditions) {
                throw new Error("Invalid backup file: missing 'importRuleConditions'");
            }

            const {importRules, importRuleActions, importRuleConditions} = data;

            if (
                typeof importRules !== "object" ||
                Array.isArray(importRules) ||
                typeof importRuleActions !== "object" ||
                Array.isArray(importRuleActions) ||
                typeof importRuleConditions !== "object" ||
                Array.isArray(importRuleConditions)
            ) {
                throw new Error("Invalid backup file: invalid 'data");
            }
        }

        if (version >= 1.3) {
            const {data} = contents;

            if (!data?.preferences) {
                throw new Error("Invalid backup file: missing 'preferences'");
            }

            const {preferences} = data;

            if (typeof preferences !== "object" || Array.isArray(preferences)) {
                throw new Error("Invalid backup file: invalid 'data'");
            }
        }
    }

    /** Takes all the IDs in a file and rewrites them with new IDs (obviously, maintaining relationships)
     *  to prevent duplicate IDs from being created on the Backend. */
    static _rewriteIds(fileContents: string): string {
        const matches = fileContents.matchAll(UUID_REGEX);

        // This is a _slightly_ more complicated algorithm than a naive loop over the matches and just
        // calling `replaceAll` for all the IDs. However, this algorithm is quite a bit faster;
        // an order of magnitude on small backups (test account, 8kb, 5ms -> 0.5ms) and approaching two
        // orders of magnitude on larger data sets (personal prod account, 140kb, 500ms -> 15ms).
        //
        // All this is doing is looping over each character in the file one-by-one and manually rewriting
        // the characters for each ID to a new ID.
        //
        // This is trivially more efficient because we're only iterating over the whole file contents
        // once to do the replacements, as opposed to however many, many times it takes when doing
        // lots of `replaceAll` calls.
        //
        // Also, just from an empirical point of view, we can see that the naive approach grows
        // superlinearly, but not quite quadratically, whereas this solution is essentially linear.
        //
        // Obviously, this doesn't seem like the best place to be pre-optimizing, but eh, I wanted
        // to do it more for the intellectual curiosity of "can I?" more so than anything else.
        // It just so happened to be worth it!

        const ids = {} as Record<string, string>;
        let charIndex = 0;

        // Split the file contents into an array of all the characters, so that we can manipulate the
        // string on a character-by-character basis.
        const result = fileContents.split("");

        for (const match of matches) {
            // Loop until we hit a match.
            while (charIndex !== match.index) {
                charIndex += 1;
            }

            const id = match[0];

            // Generate the new ID for the old ID and store it so that all future references
            // for the same old ID can use the same new ID.
            if (!(id in ids)) {
                ids[id] = uuidv4();
            }

            // Split the new ID into a character array to iterate over it, just like we're doing
            // for the file contents.
            const newId = ids[id].split("");
            const stoppingPoint = charIndex + newId.length;

            // Manually rewrite the characters of the old ID to the new ID.
            while (charIndex < stoppingPoint) {
                result[charIndex] = newId[newId.length - (stoppingPoint - charIndex)];
                charIndex += 1;
            }
        }

        // Combine everything back into a single string.
        return result.join("");
    }
}

/** Just a little Promise wrapper around the FileReader API. */
const readFile = async (file: Blob): Promise<string> => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onerror = () => {
            reader.abort();
            reject(new Error("Problem parsing file"));
        };

        reader.onload = () => {
            resolve((reader.result as string) || "");
        };

        reader.readAsText(file);
    });
};
