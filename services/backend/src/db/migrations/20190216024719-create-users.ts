import {QueryInterface} from "sequelize";
import {usersSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {addDateFields} from "db/utils";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable(tableNames.USERS, addDateFields(usersSchema));
    },
    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable(tableNames.USERS);
    }
};
