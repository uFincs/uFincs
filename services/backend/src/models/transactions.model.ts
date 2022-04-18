import {Sequelize, Model} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {transactionsSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {Application} from "declarations";
import {Models} from "types";

const {ACCOUNTS, RECURRING_TRANSACTIONS, TRANSACTIONS} = tableNames;

export class Transaction extends Model {
    public id!: string;
    public amount!: string;
    public date!: string;
    public description!: string;
    public notes!: string;
    public type!: string;

    public readonly createdAt!: string;
    public readonly updatedAt!: string;

    public creditAccountId!: string;
    public debitAccountId!: string;
    public recurringTransactionId!: string | null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static associate(models: Models): void {}

    public static validate(transaction: Partial<Transaction>) {
        const {amount, date, description, type, creditAccountId, debitAccountId} = transaction;

        if (amount === undefined || amount === null || amount === "") {
            throw new Error("Missing amount");
        }

        if (!date) {
            throw new Error("Missing date");
        }

        if (!description) {
            throw new Error("Missing description");
        }

        if (!type) {
            throw new Error("Missing type");
        }

        if (!creditAccountId) {
            throw new Error("Missing credit account");
        }

        if (!debitAccountId) {
            throw new Error("Missing debit account");
        }
    }

    /* Determines which account types are valid for the creditAccount and
     * debitAccount Transaction properties. */
    static determineAccountTypes(type: string) {
        let creditAccountTypes: Array<string> = [];
        let debitAccountTypes: Array<string> = [];

        switch (type) {
            case "income":
                creditAccountTypes = ["income"];
                debitAccountTypes = ["asset"];
                break;
            case "expense":
                creditAccountTypes = ["asset"];
                debitAccountTypes = ["expense"];
                break;
            case "debt":
                creditAccountTypes = ["liability"];
                debitAccountTypes = ["expense"];
                break;
            case "transfer":
                creditAccountTypes = ["asset", "liability"];
                debitAccountTypes = ["asset", "liability"];
                break;
            default:
                creditAccountTypes = [];
                debitAccountTypes = [];
        }

        return {creditAccountTypes, debitAccountTypes};
    }
}

export default function (app: Application) {
    const sequelize: Sequelize = app.get("sequelizeClient");

    Transaction.init(transactionsSchema, {
        sequelize,
        name: {
            singular: "Transaction",
            plural: "Transactions"
        },
        tableName: TRANSACTIONS,
        timestamps: false,
        hooks: {
            beforeCount(options: any) {
                options.raw = true;
            }
        }
    });

    Transaction.associate = (models) => {
        Transaction.belongsTo(models.Account, {
            foreignKey: foreignKeys[TRANSACTIONS][ACCOUNTS]["credit"].key,
            targetKey: "id"
        });

        Transaction.belongsTo(models.Account, {
            foreignKey: foreignKeys[TRANSACTIONS][ACCOUNTS]["debit"].key,
            targetKey: "id"
        });

        Transaction.belongsTo(models.RecurringTransaction, {
            foreignKey: foreignKeys[TRANSACTIONS][RECURRING_TRANSACTIONS].key,
            targetKey: "id",
            constraints: false
        });
    };

    return Transaction;
}
