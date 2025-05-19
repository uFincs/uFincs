import * as rawSeedData from "../../../backend/src/db/seedData";

/* Seed Data */

type Account = (typeof rawSeedData.ACCOUNTS)[0];

const accountsByType = rawSeedData.ACCOUNTS.reduce<Record<string, Array<Account>>>(
    (acc, account) => {
        if (account.type in acc) {
            acc[account.type].push(account);
        } else {
            acc[account.type] = [account];
        }

        return acc;
    },
    {}
);

// The first account should be Cash, since the accounts are sorted alphabetically.
const firstAccount = rawSeedData.ACCOUNTS.find(({name}) => name === "Cash")!;

// We also know that the second account is Chequing.
const secondAccount = rawSeedData.ACCOUNTS.find(({name}) => name === "Chequing")!;

// There's really only 1 liability, so...
const firstLiability = rawSeedData.ACCOUNTS.find(({name}) => name === "Credit Card")!;

// Well, there's only 1 import profile, so...
const firstImportProfile = rawSeedData.IMPORT_PROFILES[0];

export const seedData = {
    ...rawSeedData,
    accountsByType,
    firstAccount,
    secondAccount,
    firstLiability,
    firstImportProfile
};

/* Auth Data */

// This is a new user.
const email = "abc123@abc123.com";
const password = "abc123abc123";
const edek = "N95wQscGTK0d/8cKygM+46LMtHi5i5V8kB6sDO+OOG40CgzDiIIemg==";
const kekSalt = "jKdpCXPoEQptSAT0F0cvKw==";

export const newUser = {email, password, edek, kekSalt};

/* Import Rule Data */

export const newRule = {
    actions: [
        {property: "account", value: firstAccount.id},
        {property: "description", value: "apple"},
        {property: "type", value: "income"}
    ],
    conditions: [
        {condition: "matches", property: "account", value: "test|thing"},
        {condition: "contains", property: "description", value: "banana"}
    ]
};

export const anotherRule = {
    actions: [
        {property: "account", value: firstAccount.id},
        {property: "description", value: "pear"},
        {property: "type", value: "expense"}
    ],
    conditions: [
        {condition: "matches", property: "account", value: "hub|git"},
        {condition: "contains", property: "description", value: "tree"}
    ]
};

/* Files */

export const csvFile = "validTransactions.csv";
export const invalidFileForImport = "invalidFileForImport.jpg";

export const regularBackup = "ufincs-backup.json";
export const encryptedBackup = "ufincs-encrypted-backup.json";
