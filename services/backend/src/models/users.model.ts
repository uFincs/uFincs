import {Sequelize, Model} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {usersSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {Application} from "declarations";
import {Models} from "types";

const {
    ACCOUNTS,
    FEEDBACK,
    IMPORT_PROFILES,
    IMPORT_RULES,
    PREFERENCES,
    RECURRING_TRANSACTIONS,
    SUBSCRIPTIONS,
    USERS
} = tableNames;

export class User extends Model {
    public id!: string;
    public email!: string;
    public password!: string;
    public edek!: string;
    public kekSalt!: string;
    public isOnboarded!: boolean;

    public isVerified!: boolean;
    public verifyToken!: string;
    public verifyShortToken!: string;
    public verifyExpires!: Date;
    public verifyChanges!: Object;
    public resetToken!: string;
    public resetShortToken!: string;
    public resetExpires!: Date;
    public resetAttempts!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
    public readonly deletedAt!: Date;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static associate(models: Models): void {}

    public static generateDeletedEmail(user: User): string {
        return `__DELETED__${user.id}-${user.email}`;
    }
}

export default function (app: Application) {
    const sequelize: Sequelize = app.get("sequelizeClient");

    User.init(usersSchema, {
        sequelize,
        name: {
            singular: "User",
            plural: "Users"
        },
        tableName: USERS,
        // Enabling `paranoid` mode means that users will be soft-deleted when they are removed.
        // AKA, the `deletedAt` date will be updated with a value and the user won't show up in searches.
        // We want to only soft-delete for auditing purposes.
        paranoid: true,
        hooks: {
            beforeCount(options: any) {
                options.raw = true;
            }
        }
    });

    User.associate = (models) => {
        User.hasMany(models.Account, {
            as: foreignKeys[ACCOUNTS][USERS].as,
            foreignKey: foreignKeys[ACCOUNTS][USERS].key
        });

        User.hasMany(models.Feedback, {
            as: foreignKeys[FEEDBACK][USERS].as,
            foreignKey: foreignKeys[FEEDBACK][USERS].key
        });

        User.hasMany(models.ImportProfile, {
            as: foreignKeys[IMPORT_PROFILES][USERS].as,
            foreignKey: foreignKeys[IMPORT_PROFILES][USERS].key
        });

        User.hasMany(models.ImportRule, {
            as: foreignKeys[IMPORT_RULES][USERS].as,
            foreignKey: foreignKeys[IMPORT_RULES][USERS].key
        });

        User.hasOne(models.Preference, {
            as: foreignKeys[PREFERENCES][USERS].as,
            foreignKey: foreignKeys[PREFERENCES][USERS].key
        });

        User.hasMany(models.RecurringTransaction, {
            as: foreignKeys[RECURRING_TRANSACTIONS][USERS].as,
            foreignKey: foreignKeys[RECURRING_TRANSACTIONS][USERS].key
        });

        User.hasOne(models.Subscription, {
            as: foreignKeys[SUBSCRIPTIONS][USERS].as,
            foreignKey: foreignKeys[SUBSCRIPTIONS][USERS].key
        });
    };

    return User;
}
