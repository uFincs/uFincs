import {QueryInterface} from "sequelize";
import {recurringTransactionsSchema} from "db/schemas";
import tableNames from "db/tableNames";

const {RECURRING_TRANSACTIONS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        const existingColumns = await queryInterface.describeTable(RECURRING_TRANSACTIONS);

        if (!("lastRealizedDate" in existingColumns)) {
            await queryInterface.addColumn(
                RECURRING_TRANSACTIONS,
                "lastRealizedDate",
                recurringTransactionsSchema.lastRealizedDate
            );
        }
    },
    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeColumn(RECURRING_TRANSACTIONS, "lastRealizedDate");
    }
};
