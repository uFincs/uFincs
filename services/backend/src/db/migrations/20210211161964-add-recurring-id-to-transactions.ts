import {QueryInterface} from "sequelize";
import foreignKeys from "db/foreignKeys";
import tableNames from "db/tableNames";
import {addForeignKey} from "db/utils";

const {RECURRING_TRANSACTIONS, TRANSACTIONS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        await addForeignKey(queryInterface)(
            TRANSACTIONS,
            RECURRING_TRANSACTIONS,
            foreignKeys[TRANSACTIONS][RECURRING_TRANSACTIONS].key
        );
    },
    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeIndex(
            TRANSACTIONS,
            foreignKeys[TRANSACTIONS][RECURRING_TRANSACTIONS].key
        );

        await queryInterface.removeColumn(
            TRANSACTIONS,
            foreignKeys[TRANSACTIONS][RECURRING_TRANSACTIONS].key
        );
    }
};
