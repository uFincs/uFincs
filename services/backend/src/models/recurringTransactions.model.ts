import {Sequelize, Model} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {recurringTransactionsSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {Application} from "declarations";
import {Models} from "types";

const {ACCOUNTS, RECURRING_TRANSACTIONS, TRANSACTIONS, USERS} = tableNames;

export class RecurringTransaction extends Model {
    public id!: string;
    public amount!: string;
    public description!: string;
    public notes!: string;
    public type!: string;

    public interval!: string;
    public freq!: string;
    public on!: string | null;
    public startDate!: string;
    public endDate!: string | null;
    public count!: string | null;
    public neverEnds!: string;
    public lastRealizedDate!: string | null;

    public readonly createdAt!: string;
    public readonly updatedAt!: string;

    public creditAccountId!: string;
    public debitAccountId!: string;
    public userId!: string;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static associate(models: Models): void {}

    public static validate(recurringTransaction: Partial<RecurringTransaction>) {
        const {
            amount,
            description,
            type,
            creditAccountId,
            debitAccountId,
            interval,
            freq,
            startDate,
            neverEnds
        } = recurringTransaction;

        if (amount === undefined || amount === null || amount === "") {
            throw new Error("Missing amount");
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

        if (!interval) {
            throw new Error("Missing interval");
        }

        if (!freq) {
            throw new Error("Missing frequency");
        }

        if (!startDate) {
            throw new Error("Missing start date");
        }

        if (!neverEnds) {
            throw new Error("Missing never ends");
        }
    }
}

export default function (app: Application) {
    const sequelize: Sequelize = app.get("sequelizeClient");

    RecurringTransaction.init(recurringTransactionsSchema, {
        sequelize,
        name: {
            singular: "RecurringTransaction",
            plural: "RecurringTransactions"
        },
        tableName: RECURRING_TRANSACTIONS,
        timestamps: false,
        hooks: {
            beforeCount(options: any) {
                options.raw = true;
            }
        }
    });

    RecurringTransaction.associate = (models) => {
        RecurringTransaction.belongsTo(models.Account, {
            foreignKey: foreignKeys[RECURRING_TRANSACTIONS][ACCOUNTS]["credit"].key,
            targetKey: "id"
        });

        RecurringTransaction.belongsTo(models.Account, {
            foreignKey: foreignKeys[RECURRING_TRANSACTIONS][ACCOUNTS]["debit"].key,
            targetKey: "id"
        });

        RecurringTransaction.belongsTo(models.User, {
            foreignKey: foreignKeys[RECURRING_TRANSACTIONS][USERS].key,
            targetKey: "id"
        });

        RecurringTransaction.hasMany(models.Transaction, {
            as: foreignKeys[TRANSACTIONS][RECURRING_TRANSACTIONS].as,
            foreignKey: foreignKeys[TRANSACTIONS][RECURRING_TRANSACTIONS].key,
            constraints: false
        });
    };

    return RecurringTransaction;
}
