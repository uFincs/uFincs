import {v4 as uuidv4} from "uuid";
import {Transaction} from "models/";
import {DateService, ValueConversion} from "services/";
import {CsvFileContents, Id, NonFunctionProperties} from "utils/types";
import Account from "./Account";
import ImportProfileMapping, {ImportProfileMappingData} from "./ImportProfileMapping";
import ImportableTransaction from "./ImportableTransaction";

export interface ImportProfileData
    extends Omit<NonFunctionProperties<ImportProfile>, "importProfileMappings"> {
    importProfileMappings?: Array<ImportProfileMapping>;
}

export default class ImportProfile {
    id: Id;
    importProfileMappingIds: Array<string>;
    name: string;
    createdAt: Date | string;
    updatedAt: Date | string;

    // Properties derived from store.
    importProfileMappings: Array<ImportProfileMapping>;

    constructor({
        id = uuidv4(),
        importProfileMappingIds = [],
        name = "",
        importProfileMappings = [],
        createdAt = DateService.getTodayDateTime(),
        updatedAt = DateService.getTodayDateTime()
    }: Partial<ImportProfile> = {}) {
        this.id = id;
        this.importProfileMappingIds = importProfileMappingIds;
        this.name = name;

        this.createdAt = DateService.convertToTimestamp(createdAt);
        this.updatedAt = DateService.convertToTimestamp(updatedAt);

        // Aggregate properties
        this.importProfileMappings = importProfileMappings;
    }

    mergeWithMappings(mappingsById: Record<Id, ImportProfileMapping>): void {
        this.importProfileMappings = ImportProfile._mergeWithMappings(
            this.importProfileMappingIds,
            mappingsById
        );
    }

    validate(): ImportProfile {
        const {name} = this;

        if (!name) {
            throw new Error("Missing name");
        }

        return this;
    }

    /** Converts the contents of a CSV file to a set of transactions. */
    convertCsvToTransactions(
        csvRows: CsvFileContents = [],
        account: Account
    ): Array<ImportableTransaction> {
        return csvRows.reduce<Array<ImportableTransaction>>((acc, row) => {
            const transaction = this._createTransactionFromRow(row, account);

            if (transaction) {
                acc.push(transaction);
            }

            return acc;
        }, []);
    }

    static extractDataFields(object: any): Omit<ImportProfileData, "importProfileMappings"> {
        try {
            const {id, importProfileMappingIds, name, createdAt, updatedAt} = object;

            return {id, importProfileMappingIds, name, createdAt, updatedAt};
        } catch {
            throw new Error("Failed to extract data from import profile");
        }
    }

    /* Used to populate import profile data (from, e.g., a redux store) with import profile mapping data. */
    static populateImportProfile(mappingsById: Record<Id, ImportProfileMappingData>) {
        return (profileData: ImportProfileData) => {
            const profile = new ImportProfile(profileData);
            profile.mergeWithMappings(mappingsById);

            return profile;
        };
    }

    static _mergeWithMappings(ids: Array<Id>, mappingsById: Record<Id, ImportProfileMapping>) {
        return ids.reduce<Array<ImportProfileMapping>>((acc, id: string) => {
            if (id in mappingsById) {
                return [...acc, mappingsById[id]];
            } else {
                return acc;
            }
        }, []);
    }

    /** Converts a single row the CSV file contents to a transaction. */
    _createTransactionFromRow(
        transactionRow: Array<string>,
        account: Account
    ): ImportableTransaction | null {
        const rawTransaction: {[key: string]: string | number} = {};

        this.importProfileMappings.forEach((mapping) => {
            const columnData = transactionRow[parseInt(mapping.from)];
            const attribute = mapping.to;

            if (attribute) {
                if (attribute === "amount") {
                    rawTransaction[attribute] = ValueConversion.convertDollarsToCents(columnData);
                } else {
                    rawTransaction[attribute] = columnData;
                }
            }
        });

        try {
            const transaction = new ImportableTransaction(rawTransaction);
            return this._cleanTransaction(transaction, account);
        } catch {
            return null;
        }
    }

    /** Handles cleaning the raw transaction data from the CSV file into a valid transaction
     *  that conforms to all of our rules.
     *
     *  That is, the import account is on the right side (credit/debit), the type is inferred from
     *  where the transaction is being imported to and the amount is non-negative. */
    _cleanTransaction(transaction: ImportableTransaction, account: Account): ImportableTransaction {
        transaction.determineTransactionType(account);

        const {importAccount} = ImportableTransaction.determineTargetTransactionSides(
            transaction.type
        );

        transaction[Transaction.mapTransactionSideToAccount(importAccount)] = account.id;
        transaction.amount = Math.abs(transaction.amount);

        return transaction;
    }
}
