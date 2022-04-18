import {Sequelize, Model} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {importRuleActionsSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {Application} from "declarations";
import {Models} from "types";

const {IMPORT_RULES, IMPORT_RULE_ACTIONS} = tableNames;

export class ImportRuleAction extends Model {
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

    ImportRuleAction.init(importRuleActionsSchema, {
        sequelize,
        name: {
            singular: "ImportRuleAction",
            plural: "ImportRuleActions"
        },
        tableName: IMPORT_RULE_ACTIONS,
        timestamps: false,
        hooks: {
            beforeCount(options: any) {
                options.raw = true;
            }
        }
    });

    ImportRuleAction.associate = (models) => {
        ImportRuleAction.belongsTo(models.ImportRuleAction, {
            foreignKey: foreignKeys[IMPORT_RULE_ACTIONS][IMPORT_RULES].key
        });
    };

    return ImportRuleAction;
}
