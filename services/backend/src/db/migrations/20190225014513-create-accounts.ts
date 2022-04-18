import {QueryInterface} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {accountsSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {addForeignKey} from "db/utils";

const {ACCOUNTS, USERS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable(ACCOUNTS, accountsSchema);

        await queryInterface.addIndex(ACCOUNTS, ["name"]);
        await addForeignKey(queryInterface)(ACCOUNTS, USERS, foreignKeys[ACCOUNTS][USERS].key);
    },
    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable(ACCOUNTS);
    }
};
