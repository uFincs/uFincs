import {Sequelize, Model} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {preferencesSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {Application} from "declarations";
import {Models} from "types";

const {PREFERENCES, USERS} = tableNames;

// Yeah, it's kinda janky that this class is called 'Preference' when it a single
// instance of it represents all of the preferences for a single user.
// But... that's just how it goes for consistency's sake.
export class Preference extends Model {
    public id!: string;
    public currency!: string;

    public readonly createdAt!: string;
    public readonly updatedAt!: string;

    public userId?: string;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static associate(models: Models): void {}
}

export default function (app: Application) {
    const sequelize: Sequelize = app.get("sequelizeClient");

    Preference.init(preferencesSchema, {
        sequelize,
        name: {
            singular: "Preference",
            plural: "Preferences"
        },
        tableName: PREFERENCES,
        hooks: {
            beforeCount(options: any) {
                options.raw = true;
            }
        }
    });

    Preference.associate = (models) => {
        Preference.belongsTo(models.User, {foreignKey: foreignKeys[PREFERENCES][USERS].key});
    };

    return Preference;
}
