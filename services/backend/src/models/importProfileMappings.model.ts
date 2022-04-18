import {Sequelize, Model} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {importProfileMappingsSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {Application} from "declarations";
import {Models} from "types";

const {IMPORT_PROFILES, IMPORT_PROFILE_MAPPINGS} = tableNames;

export class ImportProfileMapping extends Model {
    public id!: string;
    public from!: string;
    public to!: string;

    public readonly createdAt!: string;
    public readonly updatedAt!: string;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static associate(models: Models): void {}
}

export default function (app: Application) {
    const sequelize: Sequelize = app.get("sequelizeClient");

    ImportProfileMapping.init(importProfileMappingsSchema, {
        sequelize,
        name: {
            singular: "ImportProfileMapping",
            plural: "ImportProfileMappings"
        },
        tableName: IMPORT_PROFILE_MAPPINGS,
        timestamps: false,
        hooks: {
            beforeCount(options: any) {
                options.raw = true;
            }
        }
    });

    ImportProfileMapping.associate = (models) => {
        ImportProfileMapping.belongsTo(models.ImportProfile, {
            foreignKey: foreignKeys[IMPORT_PROFILE_MAPPINGS][IMPORT_PROFILES].key
        });
    };

    return ImportProfileMapping;
}
