import {QueryInterface} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {importRulesSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {addForeignKey} from "db/utils";

const {IMPORT_RULES, USERS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable(IMPORT_RULES, importRulesSchema);

        await addForeignKey(queryInterface)(
            IMPORT_RULES,
            USERS,
            foreignKeys[IMPORT_RULES][USERS].key
        );
    },
    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable(IMPORT_RULES);
    }
};
