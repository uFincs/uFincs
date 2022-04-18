import {QueryInterface} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {subscriptionsSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {addDateFields, addForeignKey} from "db/utils";

const {SUBSCRIPTIONS, USERS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable(SUBSCRIPTIONS, addDateFields(subscriptionsSchema));

        await addForeignKey(queryInterface)(
            SUBSCRIPTIONS,
            USERS,
            foreignKeys[SUBSCRIPTIONS][USERS].key
        );
    },
    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable(SUBSCRIPTIONS);
    }
};
