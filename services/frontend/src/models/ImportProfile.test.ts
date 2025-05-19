/* eslint-disable @typescript-eslint/ban-ts-comment */
import {silenceConsoleErrors} from "utils/testHelpers";
import Account from "./Account";
import ImportProfile from "./ImportProfile";
import ImportProfileMapping from "./ImportProfileMapping";
import ImportableTransaction from "./ImportableTransaction";
import Transaction from "./Transaction";

describe("validate", () => {
    const validProfile = new ImportProfile({name: "test"});

    it("doesn't throw an error for a valid profile", () => {
        expect(() => validProfile.validate()).not.toThrow();
    });

    it("checks for name existence", () => {
        const invalidProfile = new ImportProfile({...validProfile, name: ""});
        expect(() => invalidProfile.validate()).toThrow("name");
    });
});

describe("convertCsvToTransactions", () => {
    const assetAccount = new Account({type: Account.ASSET});
    const liabilityAccount = new Account({type: Account.LIABILITY});

    const positiveRow = ["description", "123.45", "2019-01-01", "some account"];
    const negativeRow = ["description2", "-678.90", "2019-02-01", "another one"];

    const incomeTransaction = new ImportableTransaction({
        description: "description",
        amount: 12345,
        date: "2019-01-01",
        targetAccount: "some account",
        type: Transaction.INCOME,
        debitAccountId: assetAccount.id
    });

    const expenseTransaction = new ImportableTransaction({
        description: "description2",
        amount: 67890,
        date: "2019-02-01",
        targetAccount: "another one",
        type: Transaction.EXPENSE,
        creditAccountId: assetAccount.id
    });

    const debtTransaction = new ImportableTransaction({
        description: "description",
        amount: 12345,
        date: "2019-01-01",
        targetAccount: "some account",
        type: Transaction.DEBT,
        creditAccountId: liabilityAccount.id
    });

    const transferTransaction = new ImportableTransaction({
        description: "description2",
        amount: 67890,
        date: "2019-02-01",
        targetAccount: "another one",
        type: Transaction.TRANSFER,
        creditAccountId: liabilityAccount.id
    });

    // Remove all these irrelevant properties for testing purposes
    // @ts-expect-error Ignore need for property to be optional.
    delete incomeTransaction.id;
    // @ts-expect-error
    delete incomeTransaction.createdAt;
    // @ts-expect-error
    delete incomeTransaction.updatedAt;

    // @ts-expect-error
    delete expenseTransaction.id;
    // @ts-expect-error
    delete expenseTransaction.createdAt;
    // @ts-expect-error
    delete expenseTransaction.updatedAt;

    // @ts-expect-error
    delete debtTransaction.id;
    // @ts-expect-error
    delete debtTransaction.createdAt;
    // @ts-expect-error
    delete debtTransaction.updatedAt;

    // @ts-expect-error
    delete transferTransaction.id;
    // @ts-expect-error
    delete transferTransaction.createdAt;
    // @ts-expect-error
    delete transferTransaction.updatedAt;

    const mappings = [
        new ImportProfileMapping({from: "0", to: "description"}),
        new ImportProfileMapping({from: "1", to: "amount"}),
        new ImportProfileMapping({from: "2", to: "date"}),
        new ImportProfileMapping({from: "3", to: "targetAccount"})
    ];

    const profile = new ImportProfile({name: "test", importProfileMappings: mappings});

    const expectResults = (
        results: Array<ImportableTransaction>,
        transactions: Array<ImportableTransaction>
    ) => {
        for (let i = 0; i < results.length; i++) {
            expect(results[i]).toMatchObject(transactions[i]);
        }
    };

    it("can convert a set of CSV rows into transactions with a given mapping", () => {
        const results = profile.convertCsvToTransactions([positiveRow, negativeRow], assetAccount);
        expectResults(results, [incomeTransaction, expenseTransaction]);
    });

    it("can ensure that transaction type is income when importing a positive amount against an asset", () => {
        const results = profile.convertCsvToTransactions([positiveRow], assetAccount);
        expectResults(results, [incomeTransaction]);
    });

    it("can ensure that transaction type is expense when importing a negative amount against an asset", () => {
        const results = profile.convertCsvToTransactions([negativeRow], assetAccount);
        expectResults(results, [expenseTransaction]);
    });

    it("can ensure that transaction type is debt when importing a positive amount against a liability", () => {
        const results = profile.convertCsvToTransactions([positiveRow], liabilityAccount);
        expectResults(results, [debtTransaction]);
    });

    it("can ensure that transaction type is transfer when importing a negative amount against a liability", () => {
        const results = profile.convertCsvToTransactions([negativeRow], liabilityAccount);
        expectResults(results, [transferTransaction]);
    });

    it("can ensure that the transaction amount is cents amount with 2 decimals of accuracy", () => {
        const rowWithLessDecimals = ["description", "123", "2019-01-01", "some account"];

        const results = profile.convertCsvToTransactions([rowWithLessDecimals], assetAccount);
        expect(results[0].amount).toBe(12300);

        const rowWithMoreDecimals = ["description", "123.123456", "2019-01-01", "some account"];

        const results2 = profile.convertCsvToTransactions([rowWithMoreDecimals], assetAccount);
        expect(results2[0].amount).toBe(12312);
    });

    // NOTE: Now that we catch errors when parsing the date, we don't really have a way to force an error...
    // At least, not without a mock. So... yeah, just leaving this test here.
    //
    // it("can discard any rows that throw errors when being created as transactions", () => {
    //     const rowWithInvalidDate = ["description", "123.123456", "not a date", "some account"];

    //     const results = profile.convertCsvToTransactions([rowWithInvalidDate], assetAccount);
    //     expect(results.length).toBe(0);
    // });

    // But we can at least test that we now keep transactions with invalid dates!
    it("can discard any rows that throw errors when being created as transactions", () => {
        silenceConsoleErrors();
        const rowWithInvalidDate = ["description", "123.123456", "not a date", "some account"];

        const results = profile.convertCsvToTransactions([rowWithInvalidDate], assetAccount);
        expect(results.length).toBe(1);

        expect(results[0].date).toBe("");
    });

    it("can ignore any mappings that are empty", () => {
        const mappingsWithEmpty = [...mappings, new ImportProfileMapping()];
        const profileWithEmpty = new ImportProfile({
            name: "test2",
            importProfileMappings: mappingsWithEmpty
        });

        const results = profileWithEmpty.convertCsvToTransactions(
            [positiveRow, negativeRow],
            assetAccount
        );

        expectResults(results, [incomeTransaction, expenseTransaction]);
    });

    it("will override previous mappings if there are duplicates", () => {
        const mappingsWithDuplicate = [
            ...mappings,
            new ImportProfileMapping({from: "4", to: "description"})
        ];

        const profileWithDuplicate = new ImportProfile({
            name: "test2",
            importProfileMappings: mappingsWithDuplicate
        });

        const extendedRow = [...positiveRow, "duplicate description"];
        const extendedTransaction = new ImportableTransaction({
            ...incomeTransaction,
            description: "duplicate description"
        });

        // @ts-expect-error
        delete extendedTransaction.id;
        // @ts-expect-error
        delete extendedTransaction.createdAt;
        // @ts-expect-error
        delete extendedTransaction.updatedAt;

        const results = profileWithDuplicate.convertCsvToTransactions([extendedRow], assetAccount);
        expectResults(results, [extendedTransaction]);
    });
});
