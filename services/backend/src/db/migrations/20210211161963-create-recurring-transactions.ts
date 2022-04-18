import {QueryInterface} from "sequelize";
import foreignKeys from "db/foreignKeys";
import {recurringTransactionsSchema} from "db/schemas";
import tableNames from "db/tableNames";
import {addForeignKey} from "db/utils";

const {ACCOUNTS, RECURRING_TRANSACTIONS, USERS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable(RECURRING_TRANSACTIONS, recurringTransactionsSchema);

        await addForeignKey(queryInterface)(
            RECURRING_TRANSACTIONS,
            USERS,
            foreignKeys[RECURRING_TRANSACTIONS][USERS].key
        );

        await addForeignKey(queryInterface)(
            RECURRING_TRANSACTIONS,
            ACCOUNTS,
            foreignKeys[RECURRING_TRANSACTIONS][ACCOUNTS]["credit"].key
        );

        await addForeignKey(queryInterface)(
            RECURRING_TRANSACTIONS,
            ACCOUNTS,
            foreignKeys[RECURRING_TRANSACTIONS][ACCOUNTS]["debit"].key
        );
    },
    down: (queryInterface: QueryInterface) => {
        return queryInterface.dropTable(RECURRING_TRANSACTIONS);
    }
};
