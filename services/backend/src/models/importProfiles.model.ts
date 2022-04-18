import {Sequelize, Model} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {importProfilesSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {Application} from "declarations";
import {Models} from "types";
import {ImportProfileMapping} from "./importProfileMappings.model";

const {IMPORT_PROFILES, IMPORT_PROFILE_MAPPINGS, USERS} = tableNames;

export class ImportProfile extends Model {
    public id!: string;
    public name!: string;

    public readonly createdAt!: string;
    public readonly updatedAt!: string;

    public userId?: string;

    public importProfileMappings!: Array<ImportProfileMapping>;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static associate(models: Models): void {}

    public static validate(importProfile: Partial<ImportProfile>) {
        const {name} = importProfile;

        if (!name) {
            throw new Error("Missing name");
        }
    }
}

export default function (app: Application) {
    const sequelize: Sequelize = app.get("sequelizeClient");

    ImportProfile.init(importProfilesSchema, {
        sequelize,
        name: {
            singular: "ImportProfile",
            plural: "ImportProfiles"
        },
        tableName: IMPORT_PROFILES,
        timestamps: false,
        hooks: {
            beforeCount(options: any) {
                options.raw = true;
            }
        }
    });

    ImportProfile.associate = (models) => {
        ImportProfile.belongsTo(models.User, {foreignKey: foreignKeys[IMPORT_PROFILES][USERS].key});

        ImportProfile.hasMany(models.ImportProfileMapping, {
            as: foreignKeys[IMPORT_PROFILE_MAPPINGS][IMPORT_PROFILES].as,
            foreignKey: foreignKeys[IMPORT_PROFILE_MAPPINGS][IMPORT_PROFILES].key
        });
    };

    return ImportProfile;
}
