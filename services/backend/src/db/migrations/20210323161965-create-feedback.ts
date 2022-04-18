import {QueryInterface} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {feedbackSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {addDateFields, addForeignKey} from "db/utils";

const {FEEDBACK, USERS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable(FEEDBACK, addDateFields(feedbackSchema));

        await addForeignKey(queryInterface)(FEEDBACK, USERS, foreignKeys[FEEDBACK][USERS].key);
    },
    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable(FEEDBACK);
    }
};
