import {QueryInterface} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {importRuleActionsSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {addForeignKey} from "db/utils";

const {IMPORT_RULES, IMPORT_RULE_ACTIONS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable(IMPORT_RULE_ACTIONS, importRuleActionsSchema);

        await addForeignKey(queryInterface)(
            IMPORT_RULE_ACTIONS,
            IMPORT_RULES,
            foreignKeys[IMPORT_RULE_ACTIONS][IMPORT_RULES].key
        );
    },
    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable(IMPORT_RULE_ACTIONS);
    }
};
