import {QueryInterface} from "sequelize";
import {recurringTransactionsSchema} from "db/schemas";
import tableNames from "db/tableNames";

const {RECURRING_TRANSACTIONS} = tableNames;

export default {
    up: async (queryInterface: QueryInterface) => {
        const existingColumns = await queryInterface.describeTable(RECURRING_TRANSACTIONS);

        if (!("on" in existingColumns)) {
            await queryInterface.addColumn(
                RECURRING_TRANSACTIONS,
                "on",
                recurringTransactionsSchema.on
            );
        }

        if (!("neverEnds" in existingColumns)) {
            await queryInterface.addColumn(
                RECURRING_TRANSACTIONS,
                "neverEnds",
                recurringTransactionsSchema.neverEnds
            );
        }
    },
    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeColumn(RECURRING_TRANSACTIONS, "on");
        await queryInterface.removeColumn(RECURRING_TRANSACTIONS, "neverEnds");
    }
};
