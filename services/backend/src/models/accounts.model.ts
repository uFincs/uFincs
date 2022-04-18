import {Sequelize, Model} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {accountsSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {Application} from "declarations";
import {Models} from "types";
import {Transaction} from "./transactions.model";

const {ACCOUNTS, RECURRING_TRANSACTIONS, TRANSACTIONS, USERS} = tableNames;

export class Account extends Model {
    public id!: string;
    public name!: string;
    public type!: string;
    public openingBalance!: string;
    public interest!: string;

    public readonly createdAt!: string;
    public readonly updatedAt!: string;

    public creditAccountTransactions?: Array<Transaction>;
    public debitAccountTransactions?: Array<Transaction>;

    public userId?: string;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static associate(models: Models): void {}

    public static validate(account: Partial<Account>) {
        const {name, type, openingBalance, interest} = account;

        if (!name) {
            throw new Error("Missing name");
        }

        if (!type) {
            throw new Error("Missing type");
        }

        if (openingBalance === undefined || openingBalance === null || openingBalance === "") {
            throw new Error("Missing opening balance");
        }

        if (interest === undefined || interest === null || interest === "") {
            throw new Error("Invalid interest rate");
        }
    }
}

export default function (app: Application) {
    const sequelize: Sequelize = app.get("sequelizeClient");

    Account.init(accountsSchema, {
        sequelize,
        name: {
            singular: "Account",
            plural: "Accounts"
        },
        tableName: ACCOUNTS,
        timestamps: false,
        hooks: {
            beforeCount(options: any) {
                options.raw = true;
            }
        }
    });

    Account.associate = (models) => {
        Account.belongsTo(models.User, {
            foreignKey: foreignKeys[ACCOUNTS][USERS].key
        });

        Account.hasMany(models.Transaction, {
            as: foreignKeys[TRANSACTIONS][ACCOUNTS]["credit"].as,
            foreignKey: foreignKeys[TRANSACTIONS][ACCOUNTS]["credit"].key,
            sourceKey: "id"
        });

        Account.hasMany(models.Transaction, {
            as: foreignKeys[TRANSACTIONS][ACCOUNTS]["debit"].as,
            foreignKey: foreignKeys[TRANSACTIONS][ACCOUNTS]["debit"].key,
            sourceKey: "id"
        });

        Account.hasMany(models.RecurringTransaction, {
            as: foreignKeys[RECURRING_TRANSACTIONS][ACCOUNTS]["credit"].as,
            foreignKey: foreignKeys[RECURRING_TRANSACTIONS][ACCOUNTS]["credit"].key,
            sourceKey: "id"
        });

        Account.hasMany(models.RecurringTransaction, {
            as: foreignKeys[RECURRING_TRANSACTIONS][ACCOUNTS]["debit"].as,
            foreignKey: foreignKeys[RECURRING_TRANSACTIONS][ACCOUNTS]["debit"].key,
            sourceKey: "id"
        });
    };

    return Account;
}
