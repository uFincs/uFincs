import {Sequelize, Model} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {importRulesSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {Application} from "declarations";
import {Models} from "types";
import {ImportRuleAction} from "./importRuleActions.model";
import {ImportRuleCondition} from "./importRuleConditions.model";

const {IMPORT_RULES, IMPORT_RULE_ACTIONS, IMPORT_RULE_CONDITIONS, USERS} = tableNames;

export class ImportRule extends Model {
    public id!: string;

    public readonly createdAt!: string;
    public readonly updatedAt!: string;

    public userId?: string;

    public importRuleActions!: Array<ImportRuleAction>;
    public importRuleConditions!: Array<ImportRuleCondition>;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static associate(models: Models): void {}

    /** Used during update processes to figure out which actions/conditions need to be
     *  created/updated/deleted. */
    static diffRules(
        oldRule: ImportRule,
        newRule: ImportRule
    ): {
        actions: {created: Array<string>; updated: Array<string>; deleted: Array<string>};
        conditions: {created: Array<string>; updated: Array<string>; deleted: Array<string>};
    } {
        const oldActionIds = oldRule.importRuleActions.map(({id}) => id);
        const newActionIds = newRule.importRuleActions.map(({id}) => id);

        const oldConditionIds = oldRule.importRuleConditions.map(({id}) => id);
        const newConditionIds = newRule.importRuleConditions.map(({id}) => id);

        return {
            actions: ImportRule._diffArrays(oldActionIds, newActionIds),
            conditions: ImportRule._diffArrays(oldConditionIds, newConditionIds)
        };
    }

    static _diffArrays(
        oldArray: Array<string>,
        newArray: Array<string>
    ): {created: Array<string>; updated: Array<string>; deleted: Array<string>} {
        const oldIndex = oldArray.reduce<Record<string, string>>((acc, value) => {
            acc[value] = value;
            return acc;
        }, {});

        const newIndex = newArray.reduce<Record<string, string>>((acc, value) => {
            acc[value] = value;
            return acc;
        }, {});

        const result: {created: Array<string>; updated: Array<string>; deleted: Array<string>} = {
            created: [],
            updated: [],
            deleted: []
        };

        for (const oldValue of oldArray) {
            if (oldValue in newIndex) {
                result.updated.push(oldValue);
            } else if (!(oldValue in newIndex)) {
                result.deleted.push(oldValue);
            }
        }

        for (const newValue of newArray) {
            if (!(newValue in oldIndex)) {
                result.created.push(newValue);
            }
        }

        return result;
    }
}

export default function (app: Application) {
    const sequelize: Sequelize = app.get("sequelizeClient");

    ImportRule.init(importRulesSchema, {
        sequelize,
        name: {
            singular: "ImportRule",
            plural: "ImportRules"
        },
        tableName: IMPORT_RULES,
        timestamps: false,
        hooks: {
            beforeCount(options: any) {
                options.raw = true;
            }
        }
    });

    ImportRule.associate = (models) => {
        ImportRule.belongsTo(models.User, {foreignKey: foreignKeys[IMPORT_RULES][USERS].key});

        ImportRule.hasMany(models.ImportRuleAction, {
            as: foreignKeys[IMPORT_RULE_ACTIONS][IMPORT_RULES].as,
            foreignKey: foreignKeys[IMPORT_RULE_ACTIONS][IMPORT_RULES].key
        });

        ImportRule.hasMany(models.ImportRuleCondition, {
            as: foreignKeys[IMPORT_RULE_CONDITIONS][IMPORT_RULES].as,
            foreignKey: foreignKeys[IMPORT_RULE_CONDITIONS][IMPORT_RULES].key
        });
    };

    return ImportRule;
}
