import {QueryInterface} from "sequelize";
import {preferencesSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {addDateFields} from "db/utils";

const {PREFERENCES} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable(PREFERENCES, addDateFields(preferencesSchema));
    },
    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable(PREFERENCES);
    }
};
