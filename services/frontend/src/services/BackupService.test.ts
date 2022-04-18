import {v4 as uuidv4} from "uuid";
import {
    Account,
    ImportProfile,
    ImportProfileMapping,
    ImportRule,
    ImportRuleAction,
    ImportRuleCondition,
    Preference,
    RecurringTransaction,
    Transaction
} from "models/";
import BackupService, {
    BackupDataFormat,
    BackupFileFormat,
    FILE_VERSION,
    FILE_VERSIONS,
    UUID_REGEX
} from "./BackupService";

const DATA_PIECES = ["accounts", "importProfiles", "importProfileMappings", "transactions"];

const preferences = {currency: "CAD"};

// Note: We use non-UUIDv4 IDs here to skip testing the `rewriteIds` function in everything that
// isn't the function itself.
const validData: BackupDataFormat = {
    accounts: {
        "1": new Account({
            id: "1",
            name: "test account"
        }),
        "2": new Account({
            id: "2",
            name: "test account 2"
        })
    },
    importProfiles: {
        "3": new ImportProfile({id: "3", name: "test import profile"})
    },
    importProfileMappings: {
        "4": new ImportProfileMapping({id: "4"})
    },
    importRules: {
        "7": new ImportRule({
            id: "7",
            importRuleActionIds: ["8"],
            importRuleConditionIds: ["9"]
        })
    },
    importRuleActions: {
        "8": new ImportRuleAction({
            id: "8",
            importRuleId: "7",
            property: ImportRuleAction.PROPERTY_DESCRIPTION,
            value: "test import rule action"
        })
    },
    importRuleConditions: {
        "9": new ImportRuleCondition({
            id: "9",
            importRuleId: "7",
            condition: ImportRuleCondition.CONDITION_CONTAINS,
            property: ImportRuleCondition.PROPERTY_DESCRIPTION,
            value: "test import rule condition"
        })
    },
    transactions: {
        "5": new Transaction({
            id: "5",
            description: "test transaction",
            creditAccountId: "1",
            debitAccountId: "2"
        })
    },
    recurringTransactions: {
        "6": new RecurringTransaction({
            id: "6",
            description: "test recurring transaction",
            creditAccountId: "1",
            debitAccountId: "2"
        })
    },
    preferences
};

describe("createBackupFile", () => {
    it("turns store data into a stringified format that can be put into a file", () => {
        const {contents} = BackupService.createBackupFile(validData);

        expect(contents).toBe(
            JSON.stringify({
                version: FILE_VERSION,
                encrypted: false,
                data: validData
            })
        );
    });

    it("can set an encrypted flag", () => {
        const {contents} = BackupService.createBackupFile(validData, {encrypted: true});

        expect(contents).toBe(
            JSON.stringify({
                version: FILE_VERSION,
                encrypted: true,
                data: validData
            })
        );
    });

    it("generates a name for the file", () => {
        const {name} = BackupService.createBackupFile(validData, {encrypted: true});

        expect(name).toBe(BackupService._generateFileName(true));
    });
});

describe("parseBackupFile", () => {
    const {contents} = BackupService.createBackupFile(validData);
    const validFile = new Blob([contents], {type: "application/json"});

    it("can parse a valid backup file", async () => {
        const contents = await BackupService.parseBackupFile(validFile);

        expect(() => BackupService._validateFile(contents)).not.toThrow();
        expect(() => BackupService.validateData(contents.data, contents.version)).not.toThrow();

        // Use `toMatchObject` because `validData` uses class objects, whereas the output of the parsing
        // will not.
        //
        // Note: Need to reverse the expect/to order because `toMatchObject` ignores excess properties
        // on the 'expect' half, but not the 'to' half (and there are excess properties on the test
        // data since the parsed data removes the association properties).
        expect(validData).toMatchObject(contents.data);
    });

    describe("ID Rewriting", () => {
        const account = new Account({name: "test"});

        const action = new ImportRuleAction({
            property: ImportRuleAction.PROPERTY_ACCOUNT,
            value: account.id
        });

        // Need data with actual UUIDv4 IDs to make sure we're (not) triggering rewriteIds properly.
        const dataWithActualIds = {
            accounts: {
                [account.id]: account
            },
            importProfiles: {},
            importProfileMappings: {},
            importRules: {},
            importRuleActions: {
                [action.id]: action
            },
            importRuleConditions: {},
            preferences,
            recurringTransactions: {},
            transactions: {}
        };

        it("does ID rewriting for unencrypted files", async () => {
            const {contents} = BackupService.createBackupFile(dataWithActualIds, {
                encrypted: false
            });

            const encryptedFile = new Blob([contents], {type: "application/json"});
            const newContents = await BackupService.parseBackupFile(encryptedFile);

            expect(dataWithActualIds).not.toMatchObject(newContents.data);

            const newAccount = Object.values(newContents.data.accounts)[0];

            const newAction = Object.values(
                newContents.data.importRuleActions as any
            )[0] as ImportRuleAction;

            expect(newAccount.id).not.toBe(account.id);
            expect(newAction.id).not.toBe(action.id);

            expect(newAccount.id).toBe(newAction.value);
        });

        it("doesn't do ID rewriting for encrypted files", async () => {
            const {contents} = BackupService.createBackupFile(dataWithActualIds, {encrypted: true});

            const encryptedFile = new Blob([contents], {type: "application/json"});
            const newContents = await BackupService.parseBackupFile(encryptedFile);

            expect(dataWithActualIds).toMatchObject(newContents.data);
        });
    });

    describe("Old File Versions", () => {
        const extract1_0Data = (data: BackupDataFormat) => {
            const {accounts, importProfiles, importProfileMappings, transactions} = data;
            return {accounts, importProfiles, importProfileMappings, transactions};
        };

        const extract1_1Data = (data: BackupDataFormat) => {
            const {recurringTransactions} = data;
            return {...extract1_0Data(data), recurringTransactions};
        };

        const extract1_2Data = (data: BackupDataFormat) => {
            const {importRules, importRuleActions, importRuleConditions} = data;
            return {...extract1_1Data(data), importRules, importRuleActions, importRuleConditions};
        };

        // 1.3 introduced preferences. As a result, older formats, when parsed, will have
        // the preference data set to the default values.
        const pre1_3ValidData = {
            ...validData,
            preferences: Preference.DEFAULT_PREFERENCES
        };

        it("can still parse version 1.0", async () => {
            const version1_0Data = extract1_0Data(validData);

            const file = BackupService.createBackupFile(version1_0Data, {
                fileVersion: FILE_VERSIONS[0]
            });

            const validFile = new Blob([file.contents], {type: "application/json"});
            const contents = await BackupService.parseBackupFile(validFile);

            expect(() => BackupService._validateFile(contents)).not.toThrow();
            expect(() => BackupService.validateData(contents.data, contents.version)).not.toThrow();

            expect(pre1_3ValidData).toMatchObject(contents.data);
        });

        it("can still parse version 1.1", async () => {
            const version1_1Data = extract1_1Data(validData);

            const file = BackupService.createBackupFile(version1_1Data, {
                fileVersion: FILE_VERSIONS[1]
            });

            const validFile = new Blob([file.contents], {type: "application/json"});
            const contents = await BackupService.parseBackupFile(validFile);

            expect(() => BackupService._validateFile(contents)).not.toThrow();
            expect(() => BackupService.validateData(contents.data, contents.version)).not.toThrow();

            expect(pre1_3ValidData).toMatchObject(contents.data);
        });

        it("can still parse version 1.2", async () => {
            const version1_2Data = extract1_2Data(validData);

            const file = BackupService.createBackupFile(version1_2Data, {
                fileVersion: FILE_VERSIONS[2]
            });

            const validFile = new Blob([file.contents], {type: "application/json"});
            const contents = await BackupService.parseBackupFile(validFile);

            expect(() => BackupService._validateFile(contents)).not.toThrow();
            expect(() => BackupService.validateData(contents.data, contents.version)).not.toThrow();

            expect(pre1_3ValidData).toMatchObject(contents.data);
        });
    });

    it("can fail to parse when the file is not JSON", async () => {
        const invalidFile = new Blob(["1,2,3"], {type: "text/csv"});

        await expect(BackupService.parseBackupFile(invalidFile)).rejects.toThrow();
    });

    it("can fail to parse when the file has the wrong format", async () => {
        const invalidFile = new Blob([JSON.stringify(validData)], {type: "application/json"});

        await expect(BackupService.parseBackupFile(invalidFile)).rejects.toThrow();
    });

    it("can fail to parse when the data is invalid", async () => {
        // @ts-ignore Allow invalid data.
        const {contents} = BackupService.createBackupFile({...validData, importProfiles: null});
        const invalidFile = new Blob([contents], {type: "application/json"});

        await expect(BackupService.parseBackupFile(invalidFile)).rejects.toThrow();
    });
});

describe("validateData", () => {
    it("doesn't throw when given valid data", () => {
        expect(() => BackupService.validateData(validData, FILE_VERSION)).not.toThrow();
    });

    it("does throw when an account is invalid", () => {
        const invalidData = {
            ...validData,
            accounts: {...validData.accounts, "2": new Account({id: "2"})}
        };

        expect(() => BackupService.validateData(invalidData, FILE_VERSION)).toThrow();
    });

    it("does throw when an import profile is invalid", () => {
        const invalidData = {
            ...validData,
            importProfiles: {...validData.importProfiles, "3": new ImportProfile({id: "3"})}
        };

        expect(() => BackupService.validateData(invalidData, FILE_VERSION)).toThrow();
    });

    it("does throw when a transaction is invalid", () => {
        const invalidData = {
            ...validData,
            transactions: {...validData.transactions, "5": new Transaction({id: "5"})}
        };

        expect(() => BackupService.validateData(invalidData, FILE_VERSION)).toThrow();
    });
});

describe("_validateFile", () => {
    const validFile: BackupFileFormat = {
        version: FILE_VERSION,
        encrypted: false,
        data: {
            accounts: {},
            importProfiles: {},
            importProfileMappings: {},
            importRules: {},
            importRuleActions: {},
            importRuleConditions: {},
            preferences,
            recurringTransactions: {},
            transactions: {}
        }
    };

    it("doesn't throw when given a valid file", () => {
        expect(() => BackupService._validateFile(validFile)).not.toThrow();
    });

    it("throws when the version is missing", () => {
        // @ts-ignore Allow testing invalid files.
        expect(() => BackupService._validateFile({...validFile, version: undefined})).toThrow();
    });

    it("throws when the version is wrong", () => {
        expect(() => BackupService._validateFile({...validFile, version: "10.1"})).toThrow();
    });

    it("throws when the encrypted flag is missing", () => {
        // @ts-ignore Allow testing invalid files.
        expect(() => BackupService._validateFile({...validFile, encrypted: undefined})).toThrow();
    });

    it("throws when the encrypted flag is wrong", () => {
        // @ts-ignore Allow testing invalid files.
        expect(() => BackupService._validateFile({...validFile, encrypted: "acb123"})).toThrow();
    });

    it("throws when the data is missing", () => {
        // @ts-ignore Allow testing invalid files.
        expect(() => BackupService._validateFile({...validFile, data: undefined})).toThrow();
    });

    it("throws when any of the data pieces are missing", () => {
        for (const piece of DATA_PIECES) {
            expect(() =>
                BackupService._validateFile({
                    ...validFile,
                    // @ts-ignore Allow testing invalid files.
                    data: {...validFile.data, [piece]: undefined}
                })
            ).toThrow();
        }
    });

    it("throws when any of the data pieces are arrays instead of objects", () => {
        for (const piece of DATA_PIECES) {
            expect(() =>
                BackupService._validateFile({
                    ...validFile,
                    // @ts-ignore Allow testing invalid files.
                    data: {...validFile.data, [piece]: []}
                })
            ).toThrow();
        }
    });

    it("throws when any of the data pieces aren't arrays nor objects", () => {
        for (const piece of DATA_PIECES) {
            expect(() =>
                BackupService._validateFile({
                    ...validFile,
                    // @ts-ignore Allow testing invalid files.
                    data: {...validFile.data, [piece]: "123"}
                })
            ).toThrow();
        }
    });
});

describe("_rewriteIds", () => {
    const id1 = uuidv4();
    const id2 = uuidv4();
    const id3 = uuidv4();

    const ids = [id1, id2, id3];

    it("can rewrite the IDs", () => {
        const fileContents = `[{id: ${id1}}, {id: ${id2}}, {id: ${id1}}, {id: ${id3}}, {id: ${id2}}]`;

        const result = BackupService._rewriteIds(fileContents);
        const newIds = [...new Set([...result.matchAll(UUID_REGEX)].map(([id]) => id))];

        expect(newIds.length).toBe(3);

        for (const id of ids) {
            expect(id in newIds).toBe(false);
        }
    });
});
