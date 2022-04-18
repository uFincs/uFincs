import {Sequelize, Model} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {importRuleConditionsSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {Application} from "declarations";
import {Models} from "types";

const {IMPORT_RULES, IMPORT_RULE_CONDITIONS} = tableNames;

export class ImportRuleCondition extends Model {
    public id!: string;
    public property!: string;
    public value!: string;

    public readonly createdAt!: string;
    public readonly updatedAt!: string;

    public importRuleId?: string;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static associate(models: Models): void {}
}

export default function (app: Application) {
    const sequelize: Sequelize = app.get("sequelizeClient");

    ImportRuleCondition.init(importRuleConditionsSchema, {
        sequelize,
        name: {
            singular: "ImportRuleCondition",
            plural: "ImportRuleConditions"
        },
        tableName: IMPORT_RULE_CONDITIONS,
        timestamps: false,
        hooks: {
            beforeCount(options: any) {
                options.raw = true;
            }
        }
    });

    ImportRuleCondition.associate = (models) => {
        ImportRuleCondition.belongsTo(models.ImportRuleCondition, {
            foreignKey: foreignKeys[IMPORT_RULE_CONDITIONS][IMPORT_RULES].key
        });
    };

    return ImportRuleCondition;
}
