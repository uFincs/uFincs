import {QueryInterface} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {transactionsSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {addForeignKey} from "db/utils";

const {ACCOUNTS, TRANSACTIONS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable(TRANSACTIONS, transactionsSchema);

        await addForeignKey(queryInterface)(
            TRANSACTIONS,
            ACCOUNTS,
            foreignKeys[TRANSACTIONS][ACCOUNTS]["1"].key
        );

        await addForeignKey(queryInterface)(
            TRANSACTIONS,
            ACCOUNTS,
            foreignKeys[TRANSACTIONS][ACCOUNTS]["2"].key
        );
    },
    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable(TRANSACTIONS);
    }
};
